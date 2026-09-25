const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { Pool: PgPool, types: pgTypes } = require('pg');
const initSqlJs = require('sql.js');

// Configure pg to return numbers for COUNT/SUM/NUMERIC just like MySQL & SQLite
pgTypes.setTypeParser(20, (val) => (val === null ? null : parseInt(val, 10))); // INT8 / BIGINT
pgTypes.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val))); // NUMERIC / DECIMAL

let pool = null;
let pgPool = null;
let sqlJsDb = null;
let isFallback = false;
let dbEngine = 'sqlite'; // 'postgres' | 'mysql' | 'sqlite'

let dbFilePath = process.env.DATA_DIR
  ? path.join(process.env.DATA_DIR, 'machinex_local.db')
  : path.join(__dirname, '..', 'machinex_local.db');

const PG_SCHEMA = `
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

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS wishlist (
  id SERIAL PRIMARY KEY,
  buyer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  part_id INT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (buyer_id, part_id)
);

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

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  part_id INT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  reported_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(255) NOT NULL,
  details TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

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

async function createPostgresPool() {
  const connStr = process.env.DATABASE_URL;
  const baseConfig = connStr
    ? { connectionString: connStr, connectionTimeoutMillis: 8000 }
    : {
        host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
        user: process.env.PGUSER || process.env.DB_USER || 'postgres',
        password: process.env.PGPASSWORD || process.env.DB_PASSWORD || '',
        database: process.env.PGDATABASE || process.env.DB_NAME || 'machinex_db',
        port: parseInt(process.env.PGPORT || process.env.DB_PORT || '5432', 10),
        connectionTimeoutMillis: 8000
      };

  // Try with SSL first for cloud providers (Render External, Neon, Supabase), fallback to non-SSL (Render Internal, Localhost)
  try {
    const sslPool = new PgPool({ ...baseConfig, ssl: { rejectUnauthorized: false } });
    await sslPool.query('SELECT 1');
    return sslPool;
  } catch (sslErr) {
    const nonSslPool = new PgPool({ ...baseConfig, ssl: false });
    await nonSslPool.query('SELECT 1');
    return nonSslPool;
  }
}

async function initDatabase() {
  const dbUrl = (process.env.DATABASE_URL || '').trim();
  const wantsPostgres =
    dbUrl.startsWith('postgres://') ||
    dbUrl.startsWith('postgresql://') ||
    process.env.DB_ENGINE === 'postgres' ||
    Boolean(process.env.PGHOST) ||
    process.env.DB_PORT === '5432';

  // 1. Try PostgreSQL Connection if configured
  if (wantsPostgres) {
    try {
      pgPool = await createPostgresPool();
      dbEngine = 'postgres';
      isFallback = false;
      console.log('✅ [MachineX DB] Connected to PostgreSQL Database');

      // Initialize schema
      await pgPool.query(PG_SCHEMA);

      // Seed initial data if empty
      const userCountRes = await pgPool.query('SELECT COUNT(*) AS count FROM users');
      if (parseInt(userCountRes.rows[0].count, 10) === 0) {
        console.log('🌱 [MachineX DB] Seeding initial catalog & accounts into PostgreSQL...');
        const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');
        if (fs.existsSync(seedPath)) {
          const seedSql = fs.readFileSync(seedPath, 'utf8');
          const seedStatements = seedSql
            .replace(/--.*$/gm, '')
            .split(';')
            .map((s) => s.trim())
            .filter(
              (s) =>
                s.length > 0 &&
                !s.toLowerCase().startsWith('use ') &&
                !s.toLowerCase().startsWith('delete from')
            );

          for (const s of seedStatements) {
            try {
              await pgPool.query(s);
            } catch (e) {
              console.error('PG Seed statement notice:', e.message);
            }
          }

          // Synchronize SERIAL sequences after explicit ID inserts
          const tables = ['users', 'categories', 'parts', 'wishlist', 'inquiries', 'purchase_requests', 'reports'];
          for (const t of tables) {
            try {
              await pgPool.query(
                `SELECT setval(pg_get_serial_sequence('${t}', 'id'), COALESCE((SELECT MAX(id) FROM ${t}), 1), true);`
              );
            } catch (seqErr) {}
          }
          console.log('✅ [MachineX DB] PostgreSQL seeding & sequence sync completed.');
        }
      }
      return;
    } catch (pgErr) {
      console.warn('⚠️ [MachineX DB] PostgreSQL connection failed (' + pgErr.message + ').');
    }
  }

  // 2. Try MySQL Connection if configured
  const wantsMysql =
    dbUrl.startsWith('mysql://') ||
    process.env.DB_ENGINE === 'mysql' ||
    (process.env.DB_HOST && !wantsPostgres);

  if (wantsMysql) {
    try {
      let dbConfig;
      if (dbUrl.startsWith('mysql://')) {
        const parsed = new URL(dbUrl);
        dbConfig = {
          host: parsed.hostname,
          user: decodeURIComponent(parsed.username),
          password: decodeURIComponent(parsed.password),
          database: parsed.pathname.replace(/^\//, '') || 'machinex_db',
          port: parseInt(parsed.port || '3306', 10),
          ssl: { rejectUnauthorized: false },
          waitForConnections: true,
          connectionLimit: 10,
          connectTimeout: 8000
        };
      } else {
        const host = process.env.DB_HOST || 'localhost';
        const isRemote = host !== 'localhost' && host !== '127.0.0.1';
        dbConfig = {
          host,
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'machinex_db',
          port: parseInt(process.env.DB_PORT || '3306', 10),
          ...(isRemote || process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
          waitForConnections: true,
          connectionLimit: 10,
          connectTimeout: isRemote ? 8000 : 2000
        };
      }

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
      } catch (e) {}

      pool = mysql.createPool(dbConfig);
      await pool.query('SELECT 1 + 1 AS result');
      dbEngine = 'mysql';
      isFallback = false;
      console.log('✅ [MachineX DB] Connected to MySQL 8 (' + dbConfig.host + ':' + dbConfig.port + ')');

      const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        const statements = schemaSql
          .replace(/--.*$/gm, '')
          .split(';')
          .map((s) => s.trim())
          .filter(
            (s) =>
              s.length > 0 &&
              !s.toLowerCase().startsWith('create database') &&
              !s.toLowerCase().startsWith('use ')
          );
        for (const statement of statements) {
          try {
            await pool.query(statement);
          } catch (err) {}
        }
        try {
          await pool.query('ALTER TABLE parts MODIFY COLUMN image LONGTEXT;');
        } catch (alterErr) {}
      }

      const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users');
      if (userRows[0].count === 0) {
        const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');
        if (fs.existsSync(seedPath)) {
          const seedSql = fs.readFileSync(seedPath, 'utf8');
          const seedStatements = seedSql
            .replace(/--.*$/gm, '')
            .split(';')
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && !s.toLowerCase().startsWith('use '));
          for (const s of seedStatements) {
            try {
              await pool.query(s);
            } catch (e) {}
          }
        }
      }
      return;
    } catch (mysqlErr) {
      console.warn('⚠️ [MachineX DB] MySQL connection not established (' + mysqlErr.message + ').');
    }
  }

  // 3. Fallback: Embedded SQLite WebAssembly Database
  console.log('🚀 [MachineX DB] Auto-activating Embedded Database Engine (' + dbFilePath + ').');
  isFallback = true;
  dbEngine = 'sqlite';

  const SQL = await initSqlJs();
  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    sqlJsDb = new SQL.Database(fileBuffer);
  } else {
    sqlJsDb = new SQL.Database();
    sqlJsDb.run(SQLITE_SCHEMA);

    console.log('🌱 [MachineX DB] Initializing fallback database with demonstration data...');
    const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      const seedStatements = seedSql
        .replace(/--.*$/gm, '')
        .split(';')
        .map((s) => s.trim())
        .filter(
          (s) =>
            s.length > 0 &&
            !s.toLowerCase().startsWith('use ') &&
            !s.toLowerCase().startsWith('delete from')
        );

      for (const s of seedStatements) {
        try {
          sqlJsDb.run(s);
        } catch (e) {}
      }
    }
    saveSqlJsToFile();
    console.log('✅ [MachineX DB] Embedded database seeded and ready at ' + dbFilePath);
  }
}

// Unified Query Function: returns [rows, fields] across PostgreSQL, MySQL, and SQLite
async function query(sql, params = []) {
  if (!pgPool && !pool && !sqlJsDb) {
    await initDatabase();
  }

  // --- A. PostgreSQL Execution ---
  if (dbEngine === 'postgres' && pgPool) {
    let paramIndex = 0;
    let pgSql = sql
      .trim()
      .replace(/\?/g, () => `$${++paramIndex}`)
      .replace(/\bLIKE\b/gi, 'ILIKE')
      .replace(/=\s*"([^"]+)"/g, "= '$1'");

    const isInsert = /^insert\s+into/i.test(pgSql);
    const isSelect = /^select/i.test(pgSql);

    if (isInsert && !/\breturning\b/i.test(pgSql)) {
      pgSql = pgSql.replace(/;?\s*$/, ' RETURNING id');
    }

    const normalizedParams = (params || []).map((p) => (p === undefined ? null : p));
    const res = await pgPool.query(pgSql, normalizedParams);

    if (isSelect) {
      return [res.rows, res.fields];
    } else {
      return [
        {
          insertId: res.rows && res.rows[0] ? res.rows[0].id : 0,
          affectedRows: res.rowCount,
          changedRows: res.rowCount
        },
        null
      ];
    }
  }

  // --- B. MySQL Execution ---
  if (dbEngine === 'mysql' && pool) {
    return await pool.query(sql, params);
  }

  // --- C. SQLite Fallback Execution ---
  try {
    const trimmedSql = sql.trim();
    const isSelect =
      /^select/i.test(trimmedSql) || /^show/i.test(trimmedSql) || /^pragma/i.test(trimmedSql);

    const normalizedParams = (params || []).map((p) => {
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

      return [
        {
          insertId,
          affectedRows,
          changedRows: affectedRows
        },
        null
      ];
    }
  } catch (err) {
    console.error('SQL Execution Error:', err.message, '\nQuery:', sql, '\nParams:', params);
    throw err;
  }
}

module.exports = {
  initDatabase,
  query,
  get isFallback() {
    return isFallback;
  },
  get dbEngine() {
    return dbEngine;
  }
};
