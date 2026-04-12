import { NextResponse } from "next/server";
import { db } from "@/db"; // Import your Drizzle ORM instance
import { suggestions } from "@/db/schema"; // Import the suggestions table schema
import { z } from "zod";

// Define the schema for the request body
const suggestGameSchema = z.object({
  gameName: z.string().min(1).max(100),
  gameUrl: z.string().url(),
  gameDescription: z.string().min(1).max(500),
  gameReason: z.string().min(1).max(500),
  userId: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameName, gameUrl, gameDescription, gameReason, userId } = suggestGameSchema.parse(body);

    // Insert the suggestion into the database
    await db.insert(suggestions).values({
      id: crypto.randomUUID(), // Generate a unique ID
      gameName,
      gameUrl,
      gameDescription,
      gameReason,
      userId,
    });

    return NextResponse.json({ message: "Game suggestion submitted successfully!" }, { status: 200 });
  } catch (error) {
    console.error("Error submitting game suggestion:", error);
    return NextResponse.json({ message: "Failed to submit game suggestion" }, { status: 500 });
  }
}