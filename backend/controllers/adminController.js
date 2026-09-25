const db = require('../config/db');

// GET /api/admin/statistics - Comprehensive platform statistics & analytics
exports.getStatistics = async (req, res) => {
  try {
    // 1. Overall counts
    const [userCounts] = await db.query(`
      SELECT 
        COUNT(*) AS total_users,
        COUNT(CASE WHEN role = 'buyer' THEN 1 END) AS total_buyers,
        COUNT(CASE WHEN role = 'seller' THEN 1 END) AS total_sellers
      FROM users
    `);

    const [listingCounts] = await db.query(`
      SELECT 
        COUNT(*) AS total_listings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_listings,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) AS approved_listings,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) AS rejected_listings,
        COUNT(CASE WHEN status = 'sold' THEN 1 END) AS sold_parts,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN quantity * price ELSE 0 END), 0) AS total_active_value,
        COALESCE(SUM(quantity * price), 0) AS total_platform_inventory_value
      FROM parts
    `);

    const [reportCounts] = await db.query(`
      SELECT 
        COUNT(*) AS total_reports,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_reports
      FROM reports
    `);

    const [requestCounts] = await db.query(`
      SELECT 
        COUNT(*) AS total_requests,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) AS approved_requests,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN total_price ELSE 0 END), 0) AS total_transaction_volume
      FROM purchase_requests
    `);

    // 2. Chart Data: Listings by Category
    const [listingsByCategory] = await db.query(`
      SELECT c.name, COUNT(p.id) AS count
      FROM categories c
      LEFT JOIN parts p ON c.id = p.category_id
      GROUP BY c.id, c.name
      ORDER BY count DESC
      LIMIT 8
    `);

    // 3. Chart Data: Listing Status Distribution
    const [listingStatusDist] = await db.query(`
      SELECT status, COUNT(*) AS count
      FROM parts
      GROUP BY status
    `);

    // 4. Chart Data: Users by Role
    const usersByRole = [
      { role: 'Buyers', count: userCounts[0]?.total_buyers || 0 },
      { role: 'Sellers', count: userCounts[0]?.total_sellers || 0 },
      { role: 'Admins', count: 1 }
    ];

    // 5. Recent Activity Feed
    const [recentListings] = await db.query(`
      SELECT 
        p.id, p.name, p.price, p.status, p.created_at,
        u.name AS seller_name, u.company_name,
        'listing' AS activity_type
      FROM parts p
      JOIN users u ON p.seller_id = u.id
      ORDER BY p.id DESC
      LIMIT 6
    `);

    const [recentRequests] = await db.query(`
      SELECT 
        r.id, r.total_price, r.status, r.created_at,
        p.name AS part_name,
        buyer.name AS buyer_name,
        'purchase_request' AS activity_type
      FROM purchase_requests r
      JOIN parts p ON r.part_id = p.id
      JOIN users buyer ON r.buyer_id = buyer.id
      ORDER BY r.id DESC
      LIMIT 6
    `);

    return res.json({
      success: true,
      stats: {
        totalUsers: userCounts[0]?.total_users || 0,
        totalBuyers: userCounts[0]?.total_buyers || 0,
        totalSellers: userCounts[0]?.total_sellers || 0,
        totalListings: listingCounts[0]?.total_listings || 0,
        pendingListings: listingCounts[0]?.pending_listings || 0,
        approvedListings: listingCounts[0]?.approved_listings || 0,
        rejectedListings: listingCounts[0]?.rejected_listings || 0,
        soldParts: listingCounts[0]?.sold_parts || 0,
        totalReports: reportCounts[0]?.total_reports || 0,
        pendingReports: reportCounts[0]?.pending_reports || 0,
        totalRequests: requestCounts[0]?.total_requests || 0,
        totalTransactionVolume: requestCounts[0]?.total_transaction_volume || 0,
        totalActiveValue: listingCounts[0]?.total_active_value || 0
      },
      charts: {
        listingsByCategory,
        listingStatusDist,
        usersByRole
      },
      recentActivity: {
        recentListings,
        recentRequests
      }
    });
  } catch (err) {
    console.error('getStatistics error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin statistics.' });
  }
};

// GET /api/admin/listings - All listings with filter (pending, approved, rejected, sold)
exports.getAdminListings = async (req, res) => {
  try {
    const { status, search } = req.query;
    let sql = `
      SELECT 
        p.*,
        c.name AS category_name,
        u.name AS seller_name,
        u.email AS seller_email,
        u.company_name AS seller_company
      FROM parts p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.seller_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.brand LIKE ? OR p.model_number LIKE ? OR u.company_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY p.id DESC';
    const [listings] = await db.query(sql, params);
    return res.json({ success: true, listings });
  } catch (err) {
    console.error('getAdminListings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin listings.' });
  }
};

// PUT /api/admin/listings/:id/approve - Approve listing
exports.approveListing = async (req, res) => {
  try {
    const partId = parseInt(req.params.id, 10);
    await db.query('UPDATE parts SET status = "approved", updated_at = CURRENT_TIMESTAMP WHERE id = ?', [partId]);
    return res.json({ success: true, message: 'Machine part listing approved and is now live in the marketplace!' });
  } catch (err) {
    console.error('approveListing error:', err);
    return res.status(500).json({ success: false, message: 'Failed to approve listing.' });
  }
};

// PUT /api/admin/listings/:id/reject - Reject listing
exports.rejectListing = async (req, res) => {
  try {
    const partId = parseInt(req.params.id, 10);
    const { reason } = req.body;
    await db.query('UPDATE parts SET status = "rejected", updated_at = CURRENT_TIMESTAMP WHERE id = ?', [partId]);
    return res.json({ success: true, message: 'Machine part listing rejected.', reason });
  } catch (err) {
    console.error('rejectListing error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reject listing.' });
  }
};

// GET /api/admin/backup - Export full database snapshot as JSON (including Base64 images)
exports.exportDatabase = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, phone, role, company_name, location, created_at FROM users');
    const [categories] = await db.query('SELECT * FROM categories');
    const [parts] = await db.query('SELECT * FROM parts');
    const [wishlist] = await db.query('SELECT * FROM wishlist');
    const [inquiries] = await db.query('SELECT * FROM inquiries');
    const [purchase_requests] = await db.query('SELECT * FROM purchase_requests');
    const [reports] = await db.query('SELECT * FROM reports');

    return res.json({
      success: true,
      exported_at: new Date().toISOString(),
      db_mode: db.isFallback ? 'Embedded SQLite' : 'Cloud MySQL 8',
      data: {
        users,
        categories,
        parts,
        wishlist,
        inquiries,
        purchase_requests,
        reports
      }
    });
  } catch (err) {
    console.error('exportDatabase error:', err);
    return res.status(500).json({ success: false, message: 'Failed to export database snapshot.' });
  }
};

