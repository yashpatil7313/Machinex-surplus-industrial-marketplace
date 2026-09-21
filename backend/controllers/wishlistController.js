const db = require('../config/db');

// GET /api/wishlist - Get buyer's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const sql = `
      SELECT 
        w.id AS wishlist_id,
        w.created_at AS saved_at,
        p.*,
        c.name AS category_name,
        u.name AS seller_name,
        u.company_name AS seller_company
      FROM wishlist w
      JOIN parts p ON w.part_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.seller_id = u.id
      WHERE w.buyer_id = ?
      ORDER BY w.id DESC
    `;
    const [items] = await db.query(sql, [req.user.id]);
    return res.json({ success: true, wishlist: items });
  } catch (err) {
    console.error('getWishlist error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch wishlist.' });
  }
};

// POST /api/wishlist - Add part to wishlist (prevent duplicates)
exports.addToWishlist = async (req, res) => {
  try {
    const { part_id } = req.body;
    if (!part_id) {
      return res.status(400).json({ success: false, message: 'Part ID is required.' });
    }

    const partIdNum = parseInt(part_id, 10);

    // Check if already in wishlist
    const [existing] = await db.query(
      'SELECT id FROM wishlist WHERE buyer_id = ? AND part_id = ?',
      [req.user.id, partIdNum]
    );

    if (existing && existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This machine part is already in your wishlist.'
      });
    }

    await db.query(
      'INSERT INTO wishlist (buyer_id, part_id) VALUES (?, ?)',
      [req.user.id, partIdNum]
    );

    return res.status(201).json({
      success: true,
      message: 'Part added to wishlist.'
    });
  } catch (err) {
    console.error('addToWishlist error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add part to wishlist.' });
  }
};

// DELETE /api/wishlist/:partId - Remove part from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const partId = parseInt(req.params.partId, 10);
    await db.query(
      'DELETE FROM wishlist WHERE buyer_id = ? AND part_id = ?',
      [req.user.id, partId]
    );
    return res.json({ success: true, message: 'Part removed from wishlist.' });
  } catch (err) {
    console.error('removeFromWishlist error:', err);
    return res.status(500).json({ success: false, message: 'Failed to remove from wishlist.' });
  }
};
