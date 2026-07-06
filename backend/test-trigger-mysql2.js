const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("No DATABASE_URL");

  const connection = await mysql.createConnection(url);

  try {
    console.log("Dropping triggers...");
    await connection.query('DROP TRIGGER IF EXISTS trg_nurse_profile_wallet;');
    await connection.query('DROP TRIGGER IF EXISTS trg_nurse_kyc_activation;');
    console.log("Success!");
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

main();
