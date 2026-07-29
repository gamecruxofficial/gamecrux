'use server'

function getTebexAuthHeader() {
  const username = process.env.TEBEX_PROJECT_ID?.trim();
  const password = process.env.TEBEX_PRIVATE_KEY?.trim();

  if (!username || !password) {
    throw new Error("Tebex API credentials not configured on server");
  }

  return "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
}

function getCheckoutApiBase() {
  const endpoint = (process.env.HEADLESS_API_ENDPOINT || "https://checkout.tebex.io").trim();
  return endpoint.replace(/\/$/, "").replace(/\/api$/, "") + "/api";
}

export async function fetchPaymentDetailsServerSide(transactionId: string) {
  const response = await fetch(
    `${getCheckoutApiBase()}/payments/${transactionId}?type=txn_id`,
    {
      method: "GET",
      headers: {
        Authorization: getTebexAuthHeader(),
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Tebex API request failed with status ${response.status}: ${body}`
    );
  }

  return await response.json();
}
