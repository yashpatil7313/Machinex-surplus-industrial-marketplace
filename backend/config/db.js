const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const initSqlJs = require('sql.js');

let pool = null;
let sqlJsDb = null;
let isFallback = false;
let dbFilePath = process.env.DATA_DIR
  ? path.join(process.env.DATA_DIR, 'machinex_local.db')
  : path.join(__dirname, '..', 'machinex_local.db');

function buildDbConfig() {
  if (process.env.DATABASE_URL) {
    try {
      const parsed = new URL(process.env.DATABASE_URL);
      return {
        host: parsed.hostname,
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: parsed.pathname.replace(/^\//, '') || 'machinex_db',
        port: parseInt(parsed.port || '3306', 10),
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 8000
      };
    } catch (e) {
      console.warn('Invalid DATABASE_URL format, falling back to DB_* env vars');
    }
  }

  const host = process.env.DB_HOST || 'localhost';
  const isRemote = host !== 'localhost' && host !== '127.0.0.1';

  return {
    host,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'machinex_db',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    ...(isRemote || process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: isRemote ? 8000 : 2000
  };
}

const dbConfig = buildDbConfig();

// SQLite compatible schema for embedded fallback
const SQLITE_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'buyer',
  company_name TEXT,
  location TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  model_number TEXT,
  description TEXT,
  condition_state TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price REAL NOT NULL,
  location TEXT,
  image TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  buyer_id INTEGER NOT NULL,
  part_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE,
  UNIQUE(buyer_id, part_id)
);

CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  part_id INTEGER NOT NULL,
  buyer_id INTEGER NOT NULL,
  seller_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  reply TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS purchase_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  part_id INTEGER NOT NULL,
  buyer_id INTEGER NOT NULL,
  seller_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  total_price REAL NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  part_id INTEGER NOT NULL,
  reported_by INTEGER NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE
);
`;

function saveSqlJsToFile() {
  if (sqlJsDb) {
    const data = sqlJsDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFilePath, buffer);
  }
}

async function initDatabase() {
  // 1. Try MySQL Connection
  try {
    try {
      const testConn = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        port: dbConfig.port,
        ssl: dbConfig.ssl,
        connectTimeout: dbConfig.connectTimeout
      });
      await testConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
      await testConn.end();
    } catch (createDbErr) {
      // Managed cloud MySQL instances often pre-create the database and restrict CREATE DATABASE
    }

    pool = mysql.createPool(dbConfig);
    const [test] = await pool.query('SELECT 1 + 1 AS result');
    console.log('✅ [MachineX DB] Connected to MySQL 8 (' + dbConfig.host + ':' + dbConfig.port + ')');

    // Initialize schema if tables do not exist
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const statements = schemaSql
        .replace(/--.*$/gm, '')
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.toLowerCase().startsWith('create database') && !s.toLowerCase().startsWith('use '));
      
      for (const statement of statements) {
        try {
          await pool.query(statement);
        } catch (err) {
          // ignore already exists errors
        }
      }
      // Ensure parts.image is LONGTEXT for persistent Base64 images
      try {
        await pool.query('ALTER TABLE parts MODIFY COLUMN image LONGTEXT;');
      } catch (alterErr) {}
    }

    // Check if users exist, otherwise seed
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      console.log('🌱 [MachineX DB] Seeding initial data into MySQL...');
      const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        const seedStatements = seedSql
          .replace(/--.*$/gm, '')
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.toLowerCase().startsWith('use '));
        for (const s of seedStatements) {
          try {
            await pool.query(s);
          } catch (e) {
            console.error('Seed error:', e.message);
          }
        }
        console.log('✅ [MachineX DB] Seeding completed.');
      }
    }
    return;
  } catch (mysqlErr) {
    console.warn('⚠️ [MachineX DB] MySQL connection not established (' + mysqlErr.message + ').');
    console.log('🚀 [MachineX DB] Auto-activating Embedded High-Performance Database Engine for seamless execution & demonstration.');
    isFallback = true;
  }

  // 2. Initialize Fallback WebAssembly Database
  const SQL = await initSqlJs();
  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    sqlJsDb = new SQL.Database(fileBuffer);
  } else {
    sqlJsDb = new SQL.Database();
    sqlJsDb.run(SQLITE_SCHEMA);

    // Seed fallback database
    console.log('🌱 [MachineX DB] Initializing fallback database with demonstration data...');
    const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      const seedStatements = seedSql
        .replace(/--.*$/gm, '')
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.toLowerCase().startsWith('use ') && !s.toLowerCase().startsWith('delete from'));
      
      for (const s of seedStatements) {
        try {
          sqlJsDb.run(s);
        } catch (e) {
          // ignore minor DDL mismatch
        }
      }
    }
    saveSqlJsToFile();
    console.log('✅ [MachineX DB] Embedded database seeded and ready at ' + dbFilePath);
  }
}

// Unified Query Function: returns [rows, fields]
async function query(sql, params = []) {
  if (!pool && !sqlJsDb) {
    await initDatabase();
  }

  if (!isFallback && pool) {
    return await pool.query(sql, params);
  }

  // Fallback SQL execution
  try {
    const trimmedSql = sql.trim();
    const isSelect = /^select/i.test(trimmedSql) || /^show/i.test(trimmedSql) || /^pragma/i.test(trimmedSql);
    
    // Normalize params: convert undefined to null, boolean to 0/1
    const normalizedParams = (params || []).map(p => {
      if (p === undefined) return null;
      if (typeof p === 'boolean') return p ? 1 : 0;
      return p;
    });

    if (isSelect) {
      const stmt = sqlJsDb.prepare(trimmedSql);
      stmt.bind(normalizedParams);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return [rows, null];
    } else {
      sqlJsDb.run(trimmedSql, normalizedParams);
      let insertId = 0;
      let affectedRows = 1;
      try {
        const idRes = sqlJsDb.exec('SELECT last_insert_rowid() AS id');
        if (idRes.length && idRes[0].values.length) {
          insertId = idRes[0].values[0][0];
        }
        const changeRes = sqlJsDb.exec('SELECT changes() AS ch');
        if (changeRes.length && changeRes[0].values.length) {
          affectedRows = changeRes[0].values[0][0];
        }
      } catch (e) {}

      saveSqlJsToFile();

      const result = {
        insertId,
        affectedRows,
        changedRows: affectedRows
      };
      return [result, null];
    }
  } catch (err) {
    console.error('SQL Execution Error:', err.message, '\nQuery:', sql, '\nParams:', params);
    throw err;
  }
}

module.exports = {
  initDatabase,
  query,
  get isFallback() { return isFallback; }
};
