const db = require('../config/db');

// POST /api/reports - User reports an inappropriate listing
exports.createReport = async (req, res) => {
  try {
    const { part_id, reason, details } = req.body;
    if (!part_id || !reason) {
      return res.status(400).json({ success: false, message: 'Part ID and report reason are required.' });
    }

    const validReasons = [
      'Incorrect information',
      'Fraudulent listing',
      'Duplicate listing',
      'Wrong category',
      'Other'
    ];

    if (!validReasons.includes(reason)) {
      return res.status(400).json({ success: false, message: 'Invalid report reason provided.' });
    }

    const [partRows] = await db.query('SELECT id FROM parts WHERE id = ?', [parseInt(part_id, 10)]);
    if (!partRows || partRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Machine part not found.' });
    }

    const [result] = await db.query(
      `INSERT INTO reports (part_id, reported_by, reason, details, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [parseInt(part_id, 10), req.user.id, reason, details ? details.trim() : null]
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you. Your report has been submitted to MachineX moderators for review.',
      reportId: result.insertId
    });
  } catch (err) {
    console.error('createReport error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit report.' });
  }
};

// GET /api/reports - Admin views all reports
exports.getReports = async (req, res) => {
  try {
    const sql = `
      SELECT 
        r.*,
        p.name AS part_name,
        p.brand AS part_brand,
        p.price AS part_price,
        p.status AS part_status,
        p.image AS part_image,
        u.name AS reporter_name,
        u.email AS reporter_email,
        s.name AS seller_name,
        s.company_name AS seller_company
      FROM reports r
      JOIN parts p ON r.part_id = p.id
      JOIN users u ON r.reported_by = u.id
      JOIN users s ON p.seller_id = s.id
      ORDER BY r.id DESC
    `;
    const [reports] = await db.query(sql);
    return res.json({ success: true, reports });
  } catch (err) {
    console.error('getReports error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch reports.' });
  }
};

// PUT /api/reports/:id - Admin resolves or updates report status
exports.updateReport = async (req, res) => {
  try {
    const reportId = parseInt(req.params.id, 10);
    const { status, action } = req.body;

    const [existing] = await db.query('SELECT * FROM reports WHERE id = ?', [reportId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    const report = existing[0];

    // Optional action: take down the reported listing
    if (action === 'takedown_listing') {
      await db.query("UPDATE parts SET status = 'rejected' WHERE id = ?", [report.part_id]);
    }

    const newStatus = status || 'resolved';
    await db.query('UPDATE reports SET status = ? WHERE id = ?', [newStatus, reportId]);

    return res.json({
      success: true,
      message: `Report status updated to ${newStatus}.`,
      status: newStatus
    });
  } catch (err) {
    console.error('updateReport error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update report.' });
  }
};
