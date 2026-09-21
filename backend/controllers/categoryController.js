const db = require('../config/db');

// GET /api/categories - All categories with active part count
exports.getCategories = async (req, res) => {
  try {
    const sql = `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.created_at,
        COUNT(CASE WHEN p.status = 'approved' THEN 1 ELSE NULL END) AS parts_count,
        COUNT(p.id) AS total_listings_count
      FROM categories c
      LEFT JOIN parts p ON c.id = p.category_id
      GROUP BY c.id, c.name, c.description, c.created_at
      ORDER BY c.id ASC
    `;
    const [categories] = await db.query(sql);
    return res.json({ success: true, categories });
  } catch (err) {
    console.error('getCategories error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

// POST /api/categories - Admin creates category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const [result] = await db.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name.trim(), description ? description.trim() : null]
    );

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category: { id: result.insertId, name: name.trim(), description }
    });
  } catch (err) {
    console.error('createCategory error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
};

// PUT /api/categories/:id - Admin updates category
exports.updateCategory = async (req, res) => {
  try {
    const catId = parseInt(req.params.id, 10);
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    await db.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name.trim(), description ? description.trim() : null, catId]
    );

    return res.json({ success: true, message: 'Category updated successfully.' });
  } catch (err) {
    console.error('updateCategory error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
};

// DELETE /api/categories/:id - Admin deletes category
exports.deleteCategory = async (req, res) => {
  try {
    const catId = parseInt(req.params.id, 10);
    await db.query('DELETE FROM categories WHERE id = ?', [catId]);
    return res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    console.error('deleteCategory error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
};
