'use server'

import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: {
  name?: string
  email?: string
  image?: string | null
}) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Not authenticated")

  await db.update(users)
    .set(data)
    .where(eq(users.email, session.user.email))

  revalidatePath('/settings')
}

export async function removePhoto() {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Not authenticated")

  await db.update(users)
    .set({ image: null })
    .where(eq(users.email, session.user.email))

  revalidatePath('/settings')
}

