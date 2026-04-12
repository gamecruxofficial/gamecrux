import { NextResponse } from "next/server";

export async function GET() {
  const discordAuthUrl = new URL("https://discord.com/oauth2/authorize");
  discordAuthUrl.searchParams.append("client_id", process.env.DISCORD_CLIENT_ID!);
  discordAuthUrl.searchParams.append("redirect_uri", process.env.DISCORD_REDIRECT_URI!);
  discordAuthUrl.searchParams.append("response_type", "code");
  discordAuthUrl.searchParams.append("scope", "identify");

  return NextResponse.json({ authUrl: discordAuthUrl.toString() });
}
