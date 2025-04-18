const mysql = require('mysql2/promise');

async function checkDatabase(retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DB
      });
      await connection.ping();
      await connection.end();
      process.exit(0);
    } catch (err) {
      console.error(`Tentativa ${i + 1} falhou:`, err.message);
      await new Promise(resolve => setTimeout(resolve, 3000)); // espera 3s
    }
  }
  console.error('Todas as tentativas falharam.');
  process.exit(1);
}

checkDatabase();
