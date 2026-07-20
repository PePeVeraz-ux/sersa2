const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  try {
    console.log("Dropping triggers...");
    await client.query('DROP TRIGGER IF EXISTS trg_nurse_profile_wallet;');
    await client.query('DROP TRIGGER IF EXISTS trg_nurse_kyc_activation;');
    console.log("Success!");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();