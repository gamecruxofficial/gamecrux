import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI!,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return NextResponse.json({ error: "Failed to obtain access token" }, { status: 400 });
    }

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userResponse.json();
    if (!userData.id) {
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 400 });
    }

    // Store Discord ID in a cookie (or session store)
    (await
      // Store Discord ID in a cookie (or session store)
      cookies()).set("discordId", userData.id, { httpOnly: true, secure: true });

    return NextResponse.redirect(new URL("/", request.url)); // Redirect back to home
  } catch (error) {
    console.error("Discord OAuth error:", error);
    return NextResponse.json({ error: "OAuth error" }, { status: 500 });
  }
}
