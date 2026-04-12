// This file is deprecated - webhooks are now handled by /api/webhooks/tebex/route.ts
// Keeping for backward compatibility, redirects to new endpoint

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Redirect to the new webhook endpoint
  return NextResponse.redirect(new URL('/api/webhooks/tebex', request.url), 307)
}

export async function GET() {
  return NextResponse.json({
    message: 'This webhook endpoint has been moved to /api/webhooks/tebex',
    status: 'deprecated'
  })
}
