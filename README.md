<<<<<<< HEAD
# MACHINEX: B2B Marketplace for Surplus & Unused Machine Parts

> **"Give Your Unused Machine Parts a Second Life"**  
> *A full-stack industrial e-commerce platform engineered for factory asset recovery, surplus spares exchange, and circular manufacturing.*

---

## 1. Project Overview & Problem Statement

### 1.1 The Industrial Dilemma
Manufacturing plants, fabrication workshops, processing facilities, and engineering MSMEs routinely accumulate surplus machinery spares due to:
- Cancelled project expansion lines and layout redesigns.
- Decommissioning of legacy equipment cells with unconsumed spare stores.
- Minimum Order Quantity (MOQ) mandates forcing excess procurement of specialized parts.

Historically, this high-grade precision inventory—such as AC/DC induction motors, spherical roller bearings, hydraulic valves, and PLC controllers—remained idle on warehouse shelves, suffering steady asset depreciation before ultimately being discarded as low-value scrap metal. Simultaneously, neighboring facilities faced crippling machine downtime waiting months for identical OEM replacement parts with protracted import lead times.

### 1.2 The MachineX Solution
**MachineX** establishes a structured, secure, and audited B2B surplus machine parts exchange. Sellers convert stagnant capital into immediate business liquidity, while buyers obtain certified, ready-to-dispatch industrial components at significant discounts (typically 35%–60% below list price). 

---

## 2. Platform Roles & Core Capabilities

MachineX implements strict role-based access control (RBAC) across three user personas:

| Capability / Workflow | Industrial Buyer | Surplus Seller | Master Admin |
| :--- | :---: | :---: | :---: |
| Browse Public Marketplace | ✅ | ✅ | ✅ |
| Smart Keyword Search & Ranking | ✅ | ✅ | ✅ |
| Filter by Category, Condition, Brand, Price | ✅ | ✅ | ✅ |
| Technical Spec Sheets & Supplier Audits | ✅ | ✅ | ✅ |
| Bookmark / Maintain Saved Wishlist | ✅ | ❌ | ❌ |
| Submit Structured Inquiry Messages | ✅ | ❌ | ❌ |
| Issue Purchase Requests (`Qty × Price`) | ✅ | ❌ | ❌ |
| Track Commercial Order Statuses | ✅ | ❌ | ✅ |
| Flag / Report Questionable Listings | ✅ | ✅ | ✅ |
| Add Surplus Machine Parts (w/ Photo Upload) | ❌ | ✅ | ✅ |
| Automated Inventory Valuation (`Qty × Price`) | ❌ | ✅ | ❌ |
| Receive, Reply & Accept Buyer Inquiries | ❌ | ✅ | ❌ |
| Fulfill / Approve Buyer Purchase Orders | ❌ | ✅ | ❌ |
| Listing Approval / Rejection Gatekeeping | ❌ | ❌ | ✅ |
| User Account Management & Deletion | ❌ | ❌ | ✅ |
| Engineering Taxonomy / Category CRUD | ❌ | ❌ | ✅ |
| System-Wide Analytics & Moderation | ❌ | ❌ | ✅ |

---

## 3. Key Feature Highlights

### 3.1 Smart Keyword Search & Relevance Scoring
Rather than simple string matching, the search engine extracts individual engineering tokens (e.g., `"5 HP Siemens motor"` splits into `"5"`, `"HP"`, `"Siemens"`, `"motor"`). Listings are dynamically scored based on:
- **Brand match**: +35 points
- **Part name match**: +25 points
- **Model number match**: +20 points
- **Category match**: +15 points
- **Description match**: +10 points

Items scoring above threshold are awarded a prominent **"Best Match"** badge.

### 3.2 Surplus Inventory Valuation Engine
Sellers have access to a real-time mathematical aggregation engine:
$$\text{Surplus Inventory Value} = \sum_{i=1}^{n} (\text{Quantity}_i \times \text{Unit Price}_i)$$

*Example Computation:*
- 4 units of Siemens 5 HP Motor @ ₹38,500 = ₹1,54,000
- 60 units of SKF Ball Bearings @ ₹1,450 = ₹87,000
- 25 units of Schneider Proximity Sensors @ ₹2,800 = ₹70,000  
**Aggregated Asset Portfolio: ₹3,11,000**

### 3.3 Administrative Gatekeeping Workflow
To prevent counterfeit, hazardous, or misrepresented equipment from circulating:
1. When a seller creates a listing, its status is defaulted to `pending`.
2. Unapproved listings are **completely excluded** from the public marketplace.
3. The Admin inspects photo uploads, technical specifications, and condition tags.
4. Upon Admin approval (`status = 'approved'`), the item instantly reflects in the live marketplace.

### 3.4 Automated Order Calculation & Stock Decrementing
When a buyer submits a purchase request for $Q$ units of an approved part with price $P$:
- The backend automatically calculates $\text{Total} = Q \times P$.
- Upon seller order approval, stock quantity is atomically decremented: $Q_{\text{new}} = Q_{\text{old}} - Q$.
- If $Q_{\text{new}} = 0$, the listing status transitions automatically to `sold`.

---

## 4. Technology Stack

- **Frontend**:
  - React.js 18 (JavaScript, JSX)
  - Vite 6 build tool
  - Tailwind CSS 3 (Custom industrial slate, safety orange, and amber palette)
  - React Router DOM 6 (Declarative protected routing and role guards)
  - Axios 1.7 (Centralized HTTP client with JWT request/response interceptors)
  - Lucide React (Industrial, engineering, and telemetry icons)
- **Backend**:
  - Node.js 24 LTS
  - Express.js 4 REST API
  - JSON Web Tokens (JWT) for stateless session authorization
  - bcryptjs (10-round salted password hashing)
  - Multer (Multipart image upload with MIME validation)
  - CORS middleware
- **Database Architecture**:
  - **MySQL 8** (`machinex_db`)
  - Connection pooling via `mysql2/promise`
  - Zero-Config Fallback: If MySQL is not running on localhost during viva or evaluation, the abstraction layer seamlessly activates an embedded high-performance SQL engine (`machinex_local.db`), ensuring zero downtime or startup failures.

---

## 5. System Architecture & Directory Structure

```
machinex/
├── backend/
│   ├── config/
│   │   └── db.js               # Dual MySQL 8 connection pool + embedded fallback
│   ├── controllers/
│   │   ├── authController.js   # User registration, login, profile, directory
│   │   ├── partsController.js  # CRUD, smart search, filters, valuation
│   │   ├── categoryController.js # Taxonomy management
│   │   ├── inquiryController.js  # Technical Q&A messaging
│   │   ├── requestController.js  # Purchase orders and auto-pricing
│   │   ├── wishlistController.js # Bookmark tracking (duplicate-protected)
│   │   ├── adminController.js    # Platform stats, approval queues
│   │   └── reportController.js   # Moderation and takedowns
│   ├── middleware/
│   │   ├── auth.js             # JWT verification & role authorization
│   │   └── upload.js           # Multer disk storage and file validation
│   ├── routes/                 # REST route declarations
│   ├── uploads/                # Product photos (with 13 vector part graphics)
│   ├── utils/
│   │   ├── generateImages.js   # Industrial SVG component graphic generator
│   │   └── testSuite.js        # 21-test end-to-end verification script
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Navbar, Footer, Badges, Skeletons, EmptyState
│   │   │   └── marketplace/    # ProductCard, SearchBar, FilterSheet
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── layouts/            # MainLayout (public), DashboardLayout (sidebar)
│   │   ├── pages/              # Public pages (Home, Marketplace, Details, etc.)
│   │   │   ├── buyer/          # Buyer dashboard, requests, inquiries, wishlist
│   │   │   ├── seller/         # Seller dashboard, listings, add part, valuation
│   │   │   └── admin/          # Admin dashboard, approvals, users, reports
│   │   ├── services/           # Axios API services
│   │   ├── App.jsx             # Route definitions & protected guards
│   │   └── index.css           # Industrial Tailwind styles
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── database/
│   ├── schema.sql              # MySQL 8 table DDL with foreign keys
│   └── seed.sql                # Realistic industrial seed data
└── README.md
```

---

## 6. Database Schema (`machinex_db`)

```
  ┌──────────────┐          ┌──────────────────────┐          ┌──────────────┐
  │    users     │ 1      * │        parts         │ *      1 │  categories  │
  ├──────────────┤──────────├──────────────────────┤──────────├──────────────┤
  │ id (PK)      │          │ id (PK)              │          │ id (PK)      │
  │ name         │          │ seller_id (FK->users)│          │ name         │
  │ email (UQ)   │          │ category_id (FK->cat)│          │ description  │
  │ password     │          │ name                 │          │ created_at   │
  │ phone        │          │ brand, model_number  │          └──────────────┘
  │ role         │          │ condition_state      │
  │ company_name │          │ quantity, price      │
  │ location     │          │ location, image      │
  │ created_at   │          │ status               │
  └──────┬───────┘          └──────────┬───────────┘
         │                             │
         │ 1                         1 │
         ├─────────────────────────────┼──────────────────────────────┐
         │ *                           │ *                            │ *
  ┌──────┴───────────┐          ┌──────┴───────────┐          ┌───────┴──────────┐
  │     wishlist     │          │    inquiries     │          │purchase_requests │
  ├──────────────────┤          ├──────────────────┤          ├──────────────────┤
  │ id (PK)          │          │ id (PK)          │          │ id (PK)          │
  │ buyer_id (FK)    │          │ part_id (FK)     │          │ part_id (FK)     │
  │ part_id (FK)     │          │ buyer_id (FK)    │          │ buyer_id (FK)    │
  │ (buyer_id,part_id│          │ seller_id (FK)   │          │ seller_id (FK)   │
  │   UNIQUE)        │          │ message, quantity│          │ quantity         │
  └──────────────────┘          │ reply, status    │          │ total_price      │
                                └──────────────────┘          │ status, message  │
                                                              └──────────────────┘
```

---

## 7. Demo Accounts (College Viva Shortcuts)

The login screen features **one-click quick-fill buttons** for each role:

| Persona | Email | Password | Organization | Role Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@machinex.com` | `admin123` | MachineX Operations HQ | Full platform oversight & approval queue |
| **Seller** | `seller@industrialequip.com` | `seller123` | Apex Industrial Solutions Pvt Ltd | Inventory management, add parts, valuation |
| **Buyer** | `buyer@precisionmfg.com` | `buyer123` | Precision Manufacturing Works | Browse, search, inquiries, purchase orders |

---

## 8. Installation & Setup Instructions

### Prerequisites
- Node.js (v18 or higher) & npm
- (Optional) MySQL Server 8 (if running locally; if not running, the built-in fallback runs automatically)

### Step 1: Clone or Navigate to Project
```bash
cd machinex
```

### Step 2: Configure Environment Variables
In `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=machinex_db
DB_PORT=3306
JWT_SECRET=machinex_industrial_marketplace_secret_jwt_key_2026
```

*(Optional MySQL Setup)*: If using MySQL CLI / Workbench:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### Step 3: Install & Start Backend
```bash
cd backend
npm install
npm start
```
*Backend runs on:* `http://localhost:5000`

### Step 4: Install & Start Frontend
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend runs on:* `http://localhost:5173`

---

## 9. Comprehensive API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new buyer or seller
- `POST /api/auth/login` — Authenticate user and issue JWT
- `GET /api/auth/profile` — Fetch authenticated profile
- `PUT /api/auth/profile` — Update account profile
- `GET /api/auth/users` *(Admin)* — List all registered users
- `DELETE /api/auth/users/:id` *(Admin)* — Remove user account

### Machine Parts (`/api/parts`)
- `GET /api/parts` — Public marketplace with smart keyword ranking & faceted filters
- `GET /api/parts/featured` — Top featured approved parts for homepage
- `GET /api/parts/:id` — Machine part detail, specs, and related parts
- `POST /api/parts` *(Seller/Admin)* — Submit new part (starts as `pending`)
- `PUT /api/parts/:id` *(Seller/Admin)* — Update existing part listing
- `DELETE /api/parts/:id` *(Seller/Admin)* — Delete listing
- `GET /api/parts/seller/my-listings` *(Seller)* — Retrieve seller's own listings
- `GET /api/parts/seller/inventory-value` *(Seller)* — Calculate `Quantity × Price` valuation

### Categories (`/api/categories`)
- `GET /api/categories` — Catalog taxonomy with approved part counts
- `POST /api/categories` *(Admin)* — Create engineering category
- `PUT /api/categories/:id` *(Admin)* — Update category name & description
- `DELETE /api/categories/:id` *(Admin)* — Remove category

### Wishlist (`/api/wishlist`)
- `GET /api/wishlist` *(Buyer)* — Retrieve saved machine parts
- `POST /api/wishlist` *(Buyer)* — Add part (duplicate prevention enforced)
- `DELETE /api/wishlist/:partId` *(Buyer)* — Remove from wishlist

### Inquiries (`/api/inquiries`)
- `POST /api/inquiries` *(Buyer)* — Send technical inquiry to seller
- `GET /api/inquiries` — Fetch sent (buyer) or received (seller) inquiries
- `PUT /api/inquiries/:id` *(Seller)* — Reply, accept, or reject inquiry

### Purchase Requests (`/api/requests`)
- `POST /api/requests` *(Buyer)* — Submit purchase order with auto-pricing
- `GET /api/requests` — View orders (Buyer: sent; Seller: received; Admin: all)
- `PUT /api/requests/:id` *(Seller)* — Accept/reject order & update inventory

### Admin Console (`/api/admin`)
- `GET /api/admin/statistics` — Platform counts, valuation sums, and chart datasets
- `GET /api/admin/listings` — Moderation queue with status filters
- `PUT /api/admin/listings/:id/approve` — Release listing to live marketplace
- `PUT /api/admin/listings/:id/reject` — Reject listing with notes

### Reports (`/api/reports`)
- `POST /api/reports` — Flag inappropriate or misrepresented listing
- `GET /api/reports` *(Admin)* — Retrieve moderation flags
- `PUT /api/reports/:id` *(Admin)* — Dismiss report or initiate listing takedown

---

## 10. Automated Test Suite Execution

Run the built-in end-to-end integration test suite:
```bash
cd backend
node utils/testSuite.js
```
**Test Results (21 / 21 Passed):**
- ✅ Health Check
- ✅ Admin, Seller & Buyer Logins
- ✅ Buyer Registration
- ✅ Listing creation in `pending` status
- ✅ Non-visibility of pending parts in public marketplace
- ✅ Admin approval & instant live marketplace visibility
- ✅ Keyword smart search & relevance ranking
- ✅ Wishlist add, duplicate prevention, and deletion
- ✅ Inquiry messaging & seller response
- ✅ Purchase request auto-pricing (`Quantity × Price`)
- ✅ Order approval & inventory stock decrementing
- ✅ Surplus inventory valuation computation
- ✅ Admin telemetry & moderation reporting

---

## 11. Future Enhancements

1. **Escrow Payment Integration**: Razorpay / Stripe integration for milestone-based industrial escrow release upon physical machinery inspection.
2. **CAD / 3D STEP Viewer**: Embedded WebGL viewer allowing engineers to inspect 3D CAD files of obsolete tooling directly in the browser.
3. **Logistics Freight Calculator**: Dynamic freight quotes based on motor weights, crate dimensions, and pin-code haulage rates.
4. **Automated Equipment Valuation AI**: Image-based wear estimation using vision models to suggest optimal surplus resale pricing.
=======
# Machinex-surplus-industrial-marketplace
"MACHINEX – A full-stack B2B online marketplace for surplus, unused, and obsolete industrial machine parts. Built with React 18, Vite, Tailwind CSS, Node.js, Express, and MySQL/SQLite with smart search scoring and automated inventory valuation."
>>>>>>> 11d4861a78995c27fe2d80e942e21f366502d487
