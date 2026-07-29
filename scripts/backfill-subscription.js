/**
 * One-time backfill for payment that webhook ACK'd but never wrote an active subscription.
 * Run: node --env-file=.env scripts/backfill-subscription.js
 */
const postgres = require("postgres");

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const sql = postgres(databaseUrl, { prepare: false });

  const transactionId = "tbx-97820726a17089-cf7bc9";
  const userId = "25e868d2-d138-43ed-837f-6c70f0a8c45f";
  const plan = "STARTER PLAN";
  const amount = "1";
  const billingCycle = "1";

  try {
    const users = await sql`SELECT id, email FROM users WHERE id = ${userId} LIMIT 1`;
    if (users.length === 0) {
      throw new Error(`User ${userId} not found in users table`);
    }

    console.log("Found user:", users[0]);

    const existing = await sql`
      SELECT id, is_active, status, plan
      FROM subscriptions
      WHERE id = ${transactionId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      await sql`
        UPDATE subscriptions
        SET
          user_id = ${userId},
          plan = ${plan},
          is_active = 'true',
          status = 'active',
          amount = ${amount},
          billing_cycle = ${billingCycle},
          pending_cancellation = 'false',
          failed_payment_count = '0',
          updated_at = NOW()
        WHERE id = ${transactionId}
      `;
      console.log("Updated existing subscription row:", transactionId);
    } else {
      await sql`
        INSERT INTO subscriptions (
          id,
          user_id,
          plan,
          is_active,
          status,
          amount,
          billing_cycle,
          pending_cancellation,
          failed_payment_count,
          created_at,
          updated_at
        ) VALUES (
          ${transactionId},
          ${userId},
          ${plan},
          'true',
          'active',
          ${amount},
          ${billingCycle},
          'false',
          '0',
          NOW(),
          NOW()
        )
      `;
      console.log("Inserted subscription row:", transactionId);
    }

    await sql`
      UPDATE subscriptions
      SET
        is_active = 'false',
        status = 'cancelled',
        cancellation_reason = 'Replaced by newer purchase',
        updated_at = NOW()
      WHERE user_id = ${userId}
        AND id <> ${transactionId}
        AND is_active = 'true'
    `;

    const result = await sql`
      SELECT id, user_id, plan, is_active, status, amount, created_at
      FROM subscriptions
      WHERE id = ${transactionId}
    `;

    console.log("Backfill complete:", result[0]);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
