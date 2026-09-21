const db = require('../config/db');

// POST /api/requests - Buyer creates purchase request (auto calculates Quantity × Price)
exports.createRequest = async (req, res) => {
  try {
    const { part_id, quantity, message } = req.body;
    if (!part_id || !quantity || parseInt(quantity, 10) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid part ID and positive quantity are required.' });
    }

    const qty = parseInt(quantity, 10);
    const [partRows] = await db.query('SELECT * FROM parts WHERE id = ?', [parseInt(part_id, 10)]);
    if (!partRows || partRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Machine part not found.' });
    }

    const part = partRows[0];
    if (part.seller_id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot submit a purchase request for your own listing.' });
    }

    if (qty > part.quantity) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${qty}) exceeds available stock (${part.quantity}).`
      });
    }

    // Automatically calculate: Quantity × Price
    const totalPrice = parseFloat((qty * part.price).toFixed(2));

    const [result] = await db.query(
      `INSERT INTO purchase_requests (part_id, buyer_id, seller_id, quantity, total_price, message, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        part.id,
        req.user.id,
        part.seller_id,
        qty,
        totalPrice,
        message ? message.trim() : null
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Purchase request submitted successfully!',
      requestId: result.insertId,
      total_price: totalPrice
    });
  } catch (err) {
    console.error('createRequest error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create purchase request.' });
  }
};

// GET /api/requests - Fetch purchase requests for buyer, seller, or admin
exports.getRequests = async (req, res) => {
  try {
    let sql = `
      SELECT 
        r.*,
        p.name AS part_name,
        p.brand AS part_brand,
        p.model_number AS part_model,
        p.price AS unit_price,
        p.image AS part_image,
        p.quantity AS current_stock,
        buyer.name AS buyer_name,
        buyer.email AS buyer_email,
        buyer.phone AS buyer_phone,
        buyer.company_name AS buyer_company,
        seller.name AS seller_name,
        seller.email AS seller_email,
        seller.company_name AS seller_company
      FROM purchase_requests r
      JOIN parts p ON r.part_id = p.id
      JOIN users buyer ON r.buyer_id = buyer.id
      JOIN users seller ON r.seller_id = seller.id
    `;
    const params = [];

    if (req.user.role === 'buyer') {
      sql += ' WHERE r.buyer_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'seller') {
      sql += ' WHERE r.seller_id = ?';
      params.push(req.user.id);
    } // Admin sees all requests

    sql += ' ORDER BY r.id DESC';
    const [requests] = await db.query(sql, params);
    return res.json({ success: true, requests });
  } catch (err) {
    console.error('getRequests error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch purchase requests.' });
  }
};

// PUT /api/requests/:id - Seller or Admin accepts / rejects request
exports.updateRequest = async (req, res) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const [existing] = await db.query('SELECT * FROM purchase_requests WHERE id = ?', [requestId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Purchase request not found.' });
    }

    const request = existing[0];
    if (req.user.role !== 'admin' && request.seller_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this purchase request.' });
    }

    // If approving request and transitioning from pending, optionally decrement stock
    if (status === 'approved' && request.status === 'pending') {
      const [partRows] = await db.query('SELECT quantity FROM parts WHERE id = ?', [request.part_id]);
      if (partRows && partRows.length > 0) {
        const remainingStock = Math.max(0, partRows[0].quantity - request.quantity);
        const partStatus = remainingStock === 0 ? 'sold' : 'approved';
        await db.query('UPDATE parts SET quantity = ?, status = ? WHERE id = ?', [remainingStock, partStatus, request.part_id]);
      }
    }

    await db.query(
      'UPDATE purchase_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, requestId]
    );

    return res.json({
      success: true,
      message: `Purchase request has been marked as ${status}.`,
      status
    });
  } catch (err) {
    console.error('updateRequest error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update purchase request.' });
  }
};
