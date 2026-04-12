import { NextResponse } from 'next/server'
import { signUp } from '@/auth'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const user = await signUp(data)
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 400 }
    )
  }
}