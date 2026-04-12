'use server'

const username = process.env.TEBEX_PROJECT_ID;
const password = process.env.TEBEX_PRIVATE_KEY;

export async function fetchPaymentDetailsServerSide(transactionId: string) {

  if (!username || !password) {
    throw new Error("Tebex API credentials not configured on server");
  }

  const response = await fetch(`${process.env.HEADLESS_API_ENDPOINT}/api/payments/${transactionId}?type=txn_id`, {
    method: 'GET',
    headers: {
      "Authorization": "Basic " + Buffer.from(username + ":" + password).toString("base64"),
      "Content-Type": "application/json"
    },
  });

  if (!response.ok) {
    throw new Error(`Tebex API request failed with status ${response.status}`);
  }

  return await response.json();
}