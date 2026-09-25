-- MACHINEX Database Schema (PostgreSQL)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'buyer',
  company_name VARCHAR(255),
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Machine Parts Table
CREATE TABLE IF NOT EXISTS parts (
  id SERIAL PRIMARY KEY,
  seller_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  model_number VARCHAR(255),
  description TEXT,
  condition_state VARCHAR(100) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price NUMERIC(12, 2) NOT NULL,
  location VARCHAR(255),
  image TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
  id SERIAL PRIMARY KEY,
  buyer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  part_id INT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (buyer_id, part_id)
);

-- 5. Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY,
  part_id INT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  buyer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  quantity INT DEFAULT 1,
  reply TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Purchase Requests Table
CREATE TABLE IF NOT EXISTS purchase_requests (
  id SERIAL PRIMARY KEY,
  part_id INT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  buyer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quantity INT NOT NULL,
  total_price NUMERIC(12, 2) NOT NULL,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  part_id INT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  reported_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(255) NOT NULL,
  details TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
