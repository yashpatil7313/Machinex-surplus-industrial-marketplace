const http = require('http');

const API_BASE = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  console.log('🚀 ====================================================');
  console.log('🧪 RUNNING MACHINEX END-TO-END AUTOMATED TEST SUITE');
  console.log('🚀 ====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    const health = await request('/health');
    assert(health.data.status === 'healthy', 'API Health Check is ONLINE');

    // 2. Demo Logins for All 3 Roles
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@machinex.com', password: 'admin123' }
    });
    assert(adminLogin.data.success && adminLogin.data.user.role === 'admin', 'Admin Login Successful (Role: admin)');
    const adminToken = adminLogin.data.token;

    const sellerLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'seller@industrialequip.com', password: 'seller123' }
    });
    assert(sellerLogin.data.success && sellerLogin.data.user.role === 'seller', 'Seller Login Successful (Role: seller)');
    const sellerToken = sellerLogin.data.token;

    const buyerLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'buyer@precisionmfg.com', password: 'buyer123' }
    });
    assert(buyerLogin.data.success && buyerLogin.data.user.role === 'buyer', 'Buyer Login Successful (Role: buyer)');
    const buyerToken = buyerLogin.data.token;

    // 3. Register New Account
    const randomEmail = `testbuyer_${Date.now()}@example.com`;
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Auto Test Buyer',
        email: randomEmail,
        password: 'password123',
        role: 'buyer',
        company_name: 'Test Industrial Works',
        location: 'Hyderabad'
      }
    });
    assert(regRes.data.success && regRes.data.user.email === randomEmail, 'New Buyer Registration Successful');

    // 4. Seller Listing Creation & Initial Pending Status
    const newPartRes = await request('/parts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: {
        name: 'ABB Inverter Duty Induction Motor',
        category_id: 2,
        brand: 'ABB',
        model_number: 'M3BP-160-MLA4',
        description: 'Heavy duty 11 kW inverter duty motor.',
        condition_state: 'Surplus',
        quantity: 3,
        price: 45000.00,
        location: 'Pune Plant'
      }
    });
    assert(newPartRes.data.success && newPartRes.data.partId, 'Seller Created Machine Part Listing (starts pending)');
    const createdPartId = newPartRes.data.partId;

    // 5. Verify unapproved part is NOT in public marketplace
    const publicPartsBefore = await request('/parts');
    const isVisibleBefore = publicPartsBefore.data.parts.some(p => p.id === createdPartId);
    assert(!isVisibleBefore, 'Pending part is NOT visible in public marketplace');

    // 6. Admin Approves Listing
    const approveRes = await request(`/admin/listings/${createdPartId}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(approveRes.data.success, 'Admin Approved Listing');

    // 7. Verify approved part IS NOW in public marketplace
    const publicPartsAfter = await request('/parts');
    const isVisibleAfter = publicPartsAfter.data.parts.some(p => p.id === createdPartId);
    assert(isVisibleAfter, 'Approved part is NOW LIVE in public marketplace');

    // 8. Smart Search & Ranking
    const searchRes = await request('/parts?search=' + encodeURIComponent('Siemens 5 HP'));
    const topResult = searchRes.data.parts[0];
    assert(
      topResult && topResult.name.includes('Siemens') && topResult.match_score > 0 && topResult.is_best_match,
      `Smart Search: "Siemens 5 HP" ranked correctly with score: ${topResult?.match_score} (Best Match: ${topResult?.is_best_match})`
    );

    // 9. Wishlist Management & Duplicate Prevention
    const wishAdd1 = await request('/wishlist', {
      method: 'POST',
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: { part_id: 3 }
    });
    assert(wishAdd1.data.success, 'Buyer Added Part to Wishlist');

    const wishAddDuplicate = await request('/wishlist', {
      method: 'POST',
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: { part_id: 3 }
    });
    assert(!wishAddDuplicate.data.success, 'Duplicate Wishlist Prevention Works (Correctly Blocked)');

    const wishRemove = await request(`/wishlist/3`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${buyerToken}` }
    });
    assert(wishRemove.data.success, 'Buyer Removed Part from Wishlist');

    // 10. Inquiry System: Buyer Sends, Seller Replies
    const inqRes = await request('/inquiries', {
      method: 'POST',
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: {
        part_id: 1,
        message: 'Do you have dispatch test records for this motor?',
        quantity: 1
      }
    });
    assert(inqRes.data.success, 'Buyer Sent Inquiry to Seller');
    const inquiryId = inqRes.data.inquiryId;

    const replyRes = await request(`/inquiries/${inquiryId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: {
        status: 'accepted',
        reply: 'Yes, full factory test certificates are included in the dispatch box.'
      }
    });
    assert(replyRes.data.success, 'Seller Replied to Inquiry and Set Status to Accepted');

    // 11. Purchase Request & Auto Price Calculation (Quantity × Price)
    const partToBuyRes = await request('/parts/1');
    const unitPrice = partToBuyRes.data.part.price;
    const reqQty = 2;
    const expectedTotal = unitPrice * reqQty;

    const buyRes = await request('/requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: {
        part_id: 1,
        quantity: reqQty,
        message: 'Delivery required at our Ahmedabad facility with GST invoice.'
      }
    });
    assert(
      buyRes.data.success && parseFloat(buyRes.data.total_price) === expectedTotal,
      `Purchase Request: Auto Calculated Quantity × Price: ${reqQty} × ₹${unitPrice} = ₹${buyRes.data?.total_price}`
    );
    const purchaseReqId = buyRes.data.requestId;

    // 12. Seller Approves Purchase Order & Decrements Stock
    const stockBefore = partToBuyRes.data.part.quantity;
    const approveOrderRes = await request(`/requests/${purchaseReqId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: { status: 'approved' }
    });
    assert(approveOrderRes.data.success, 'Seller Approved Purchase Order');

    const partAfterBuy = await request('/parts/1');
    assert(
      partAfterBuy.data.part.quantity === stockBefore - reqQty,
      `Inventory Stock Auto-Updated from ${stockBefore} to ${partAfterBuy.data.part.quantity}`
    );

    // 13. Seller Surplus Inventory Valuation Check
    const valRes = await request('/parts/seller/inventory-value', {
      headers: { Authorization: `Bearer ${sellerToken}` }
    });
    assert(
      valRes.data.success && valRes.data.totalInventoryValue > 0 && valRes.data.categoryBreakdown.length > 0,
      `Surplus Inventory Value Computed: ₹${valRes.data.totalInventoryValue.toLocaleString('en-IN')} across ${valRes.data.totalListings} items`
    );

    // 14. Admin Governance & Telemetry
    const statsRes = await request('/admin/statistics', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(
      statsRes.data.success && statsRes.data.stats.totalUsers >= 4 && statsRes.data.charts.listingsByCategory.length > 0,
      `Admin Statistics & Analytics Active (Users: ${statsRes.data.stats.totalUsers}, Listings: ${statsRes.data.stats.totalListings})`
    );

    // 15. User Reporting Mechanism
    const reportRes = await request('/reports', {
      method: 'POST',
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: {
        part_id: 2,
        reason: 'Incorrect information',
        details: 'Automated test report.'
      }
    });
    assert(reportRes.data.success, 'User Submitted Listing Report');

    console.log('\n====================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

  } catch (error) {
    console.error('Fatal Test Error:', error);
  }
}

runTests();
