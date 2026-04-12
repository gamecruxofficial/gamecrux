import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const discordId = (await cookies()).get("discordId")?.value;

  if (!discordId) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({ authenticated: true, discordId });
}
