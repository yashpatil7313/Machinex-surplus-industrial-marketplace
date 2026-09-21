const db = require('../config/db');

// POST /api/inquiries - Buyer sends inquiry to seller
exports.createInquiry = async (req, res) => {
  try {
    const { part_id, message, quantity } = req.body;
    if (!part_id || !message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Part ID and message are required.' });
    }

    // Lookup part to get seller_id
    const [partRows] = await db.query('SELECT seller_id, name FROM parts WHERE id = ?', [parseInt(part_id, 10)]);
    if (!partRows || partRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Machine part not found.' });
    }

    const sellerId = partRows[0].seller_id;
    if (sellerId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot send an inquiry for your own listing.' });
    }

    const [result] = await db.query(
      `INSERT INTO inquiries (part_id, buyer_id, seller_id, message, quantity, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [
        parseInt(part_id, 10),
        req.user.id,
        sellerId,
        message.trim(),
        quantity ? parseInt(quantity, 10) : 1
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Inquiry sent successfully to the seller.',
      inquiryId: result.insertId
    });
  } catch (err) {
    console.error('createInquiry error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send inquiry.' });
  }
};

// GET /api/inquiries - Role-based inquiry retrieval
exports.getInquiries = async (req, res) => {
  try {
    let sql = `
      SELECT 
        i.*,
        p.name AS part_name,
        p.brand AS part_brand,
        p.model_number AS part_model,
        p.price AS part_price,
        p.image AS part_image,
        buyer.name AS buyer_name,
        buyer.email AS buyer_email,
        buyer.company_name AS buyer_company,
        buyer.phone AS buyer_phone,
        seller.name AS seller_name,
        seller.company_name AS seller_company
      FROM inquiries i
      JOIN parts p ON i.part_id = p.id
      JOIN users buyer ON i.buyer_id = buyer.id
      JOIN users seller ON i.seller_id = seller.id
    `;
    const params = [];

    if (req.user.role === 'buyer') {
      sql += ' WHERE i.buyer_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'seller') {
      sql += ' WHERE i.seller_id = ?';
      params.push(req.user.id);
    } // Admin sees all inquiries

    sql += ' ORDER BY i.id DESC';
    const [inquiries] = await db.query(sql, params);
    return res.json({ success: true, inquiries });
  } catch (err) {
    console.error('getInquiries error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve inquiries.' });
  }
};

// PUT /api/inquiries/:id - Seller responds or updates status
exports.updateInquiry = async (req, res) => {
  try {
    const inquiryId = parseInt(req.params.id, 10);
    const { status, reply } = req.body;

    const [existing] = await db.query('SELECT * FROM inquiries WHERE id = ?', [inquiryId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }

    const inquiry = existing[0];
    if (req.user.role !== 'admin' && inquiry.seller_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this inquiry.' });
    }

    const updatedStatus = status || inquiry.status;
    const updatedReply = reply !== undefined ? reply : inquiry.reply;

    await db.query(
      'UPDATE inquiries SET status = ?, reply = ? WHERE id = ?',
      [updatedStatus, updatedReply, inquiryId]
    );

    return res.json({
      success: true,
      message: 'Inquiry updated successfully.',
      status: updatedStatus
    });
  } catch (err) {
    console.error('updateInquiry error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update inquiry.' });
  }
};
