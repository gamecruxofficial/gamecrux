const postgres = require("postgres");

async function main() {
  const sql = postgres(process.env.DATABASE_URL, { prepare: false });
  const txn = "tbx-69020926a81279-800627";
  const userId = "5907cf1f-c959-4c00-8465-6d2c0f4d5369";

  try {
    const user = await sql`
      SELECT id, email, discord_id FROM users WHERE id = ${userId}
    `;
    console.log("USER:", user);

    const byTxn = await sql`
      SELECT id, user_id, plan, is_active, status, amount, created_at
      FROM subscriptions
      WHERE id = ${txn}
    `;
    console.log("BY_TXN:", byTxn);

    const byUser = await sql`
      SELECT id, plan, is_active, status, created_at
      FROM subscriptions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    console.log("BY_USER:", byUser);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
