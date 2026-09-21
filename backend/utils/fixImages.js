const db = require('../config/db');

async function fix() {
  await db.initDatabase();
  const [parts] = await db.query('SELECT id, image FROM parts');
  for (const p of parts) {
    if (p.image && p.image.endsWith('.jpg')) {
      const newImg = p.image.replace('.jpg', '.svg');
      await db.query('UPDATE parts SET image = ? WHERE id = ?', [newImg, p.id]);
    }
  }
  const [updated] = await db.query('SELECT id, name, image FROM parts LIMIT 5');
  console.log('Images updated to SVG successfully:');
  console.log(updated);
  process.exit(0);
}

fix().catch(err => {
  console.error(err);
  process.exit(1);
});
