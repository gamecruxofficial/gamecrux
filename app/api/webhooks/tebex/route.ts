import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/db';
import { subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { fetchPaymentDetailsServerSide } from '@/app/actions/tebexPaymentService';
import { processPayment } from '@/app/actions/paymentActions'; // Import the processPayment action

// --- ENVIRONMENT VARIABLES ---
// Ensure these are set in your Vercel production environment
const TEBEX_WEBHOOK_SECRET = process.env.TEBEX_SECRET;
const ALLOWED_IPS = ['18.209.80.3', '54.87.231.232'];

// --- HELPER FUNCTIONS ---

/**
 * Gets the real IP address from the request, accounting for proxies like Vercel and Cloudflare.
 * @param request The incoming NextRequest object.
 * @returns The client's IP address.
 */
function getRealIP(request: NextRequest): string {
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) return cfConnectingIP;

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;

  return 'unknown';
}

/**
 * Verifies the webhook signature from Tebex to ensure the request is authentic.
 * @param rawBody The raw text body of the request.
 * @param signature The signature from the 'x-signature' header.
 * @returns True if the signature is valid, false otherwise.
 */
function verifySignature(rawBody: string, signature: string): boolean {
  if (!TEBEX_WEBHOOK_SECRET) {
    console.warn('TEBEX_WEBHOOK_SECRET is not configured. Signature verification failed.');
    return false;
  }
  try {
    // --- CORRECTED SIGNATURE LOGIC AS PER TEBEX DOCUMENTATION ---

    // Step 1: Create a SHA256 hash of the raw request body.
    const bodyHash = crypto
        .createHash('sha256')
        .update(rawBody, 'utf-8')
        .digest('hex');
    
    // Step 2: Create a SHA256 HMAC of the *body hash* using your secret as the key.
    const expectedSignature = crypto
        .createHmac('sha256', TEBEX_WEBHOOK_SECRET)
        .update(bodyHash)
        .digest('hex');
    
    const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    
    if (!isValid) {
        console.error("Signature Mismatch!");
        console.log(`Received Signature:  ${signature}`);
        console.log(`Calculated Signature: ${expectedSignature}`);
    }
    return isValid;
  } catch (error) {
    console.error('Error verifying Tebex signature:', error);
    return false;
  }
}

// --- MAIN WEBHOOK HANDLER ---

export async function POST(request: NextRequest) {
  console.log('--- Tebex webhook received ---');
  try {
    const rawBody = await request.text();
    if (!rawBody) {
      console.warn('Webhook rejected: Empty request body.');
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
    }

    const webhookData = JSON.parse(rawBody);
    const { type, id, subject } = webhookData;

    console.log(`Received webhook event '${type}' with ID: ${id}`);

    // Handle validation webhook immediately, before security checks
    if (type === 'validation.webhook') {
      console.log('Successfully responded to validation webhook.');
      return NextResponse.json({ id }, { status: 200 });
    }

    // --- SECURITY CHECKS (Signature Verification Re-enabled) ---
    if (process.env.NODE_ENV === 'production') {
      const clientIP = getRealIP(request);
      if (!ALLOWED_IPS.includes(clientIP)) {
        console.warn(`Webhook rejected: Request from invalid IP ${clientIP}`);
        return NextResponse.json({ error: 'Forbidden: Invalid IP address' }, { status: 403 });
      }

      const signature = request.headers.get('x-signature');
      if (!signature || !verifySignature(rawBody, signature)) {
        console.warn('Webhook rejected: Invalid signature.');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      console.log('Security checks passed.');
    } else {
        console.log('Skipping security checks in non-production environment.');
    }


    // --- EVENT ROUTING ---
    switch (type) {
      case 'payment.completed':
        await handlePaymentCompleted(subject);
        break;
      case 'payment.declined':
        await handlePaymentDeclined(subject);
        break;
      case 'payment.refunded':
        await handlePaymentRefunded(subject);
        break;
      case 'recurring-payment.started':
        await handleRecurringPaymentStarted(subject);
        break;
      case 'recurring-payment.renewed':
        await handleRecurringPaymentRenewed(subject);
        break;
      case 'recurring-payment.ended':
        await handleRecurringPaymentEnded(subject);
        break;
      case 'recurring-payment.cancellation.requested':
        await handleRecurringPaymentCancellationRequested(subject);
        break;
      case 'recurring-payment.cancellation.aborted':
        await handleRecurringPaymentCancellationAborted(subject);
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('CRITICAL ERROR in webhook processing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --- EVENT HANDLER FUNCTIONS ---

/**
 * Handles a completed payment. Creates a new subscription or updates an existing one.
 * This is the most critical handler for new purchases.
 */
async function handlePaymentCompleted(subject: any) {
  try {
    const transactionId = subject?.transaction_id;
    if (!transactionId) {
      console.warn("handlePaymentCompleted: Event is missing transaction_id.");
      return;
    }

    console.log(`handlePaymentCompleted: Processing transaction ${transactionId}`);
    
    // Fetch full, verified payment details from Tebex API for security and accuracy
    const paymentDetails = await fetchPaymentDetailsServerSide(transactionId);

    // Directly call the server action to handle database logic
    const result = await processPayment(paymentDetails);

    if (result.success) {
        console.log(`Successfully processed payment for user via processPayment action.`);
    } else {
        console.error(`processPayment action failed: ${result.message}`);
    }
  } catch (error) {
    console.error('Error in handlePaymentCompleted:', error);
  }
}

/**
 * Handles a recurring payment renewal.
 */
async function handleRecurringPaymentRenewed(subject: any) {
  try {
    const userId = subject?.last_payment?.custom?.userid;
    if (!userId) {
      console.warn('handleRecurringPaymentRenewed: No user ID found.');
      return;
    }
    console.log(`Renewing subscription for user: ${userId}`);
    await db
      .update(subscriptions)
      .set({
        isActive: "true",
        status: 'active',
        nextPaymentDate: subject.next_payment_at ? new Date(subject.next_payment_at) : null,
        updatedAt: new Date(),
        failedPaymentCount: "0",
        pendingCancellation: "false",
      })
      .where(eq(subscriptions.userId, userId));
  } catch (error) {
    console.error('Error in handleRecurringPaymentRenewed:', error);
  }
}

/**
 * Handles the end of a recurring payment (e.g., cancellation).
 */
async function handleRecurringPaymentEnded(subject: any) {
  try {
    const userId = subject?.last_payment?.custom?.userid;
    if (!userId) {
      console.warn('handleRecurringPaymentEnded: No user ID found.');
      return;
    }
    console.log(`Ending subscription for user: ${userId}`);
    await db
      .update(subscriptions)
      .set({
        isActive: "false",
        status: 'cancelled',
        cancelledAt: subject.cancelled_at ? new Date(subject.cancelled_at) : new Date(),
        cancellationReason: subject.cancel_reason || 'Subscription ended',
        pendingCancellation: "false",
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));
  } catch (error) {
    console.error('Error in handleRecurringPaymentEnded:', error);
  }
}

/**
 * Handles a user's request to cancel their subscription.
 */
async function handleRecurringPaymentCancellationRequested(subject: any) {
    try {
        const userId = subject?.last_payment?.custom?.userid;
        if (!userId) {
            console.warn('handleRecurringPaymentCancellationRequested: No user ID found.');
            return;
        }
        console.log(`Cancellation requested for user: ${userId}`);
        await db
            .update(subscriptions)
            .set({
                pendingCancellation: "true",
                cancellationRequestedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(subscriptions.userId, userId));
    } catch (error) {
        console.error('Error in handleRecurringPaymentCancellationRequested:', error);
    }
}

/**
 * Handles when a user aborts a pending cancellation.
 */
async function handleRecurringPaymentCancellationAborted(subject: any) {
    try {
        const userId = subject?.last_payment?.custom?.userid;
        if (!userId) {
            console.warn('handleRecurringPaymentCancellationAborted: No user ID found.');
            return;
        }
        console.log(`Cancellation aborted for user: ${userId}`);
        await db
            .update(subscriptions)
            .set({
                pendingCancellation: "false",
                cancellationRequestedAt: null,
                updatedAt: new Date(),
            })
            .where(eq(subscriptions.userId, userId));
    } catch (error) {
        console.error('Error in handleRecurringPaymentCancellationAborted:', error);
    }
}

/**
 * Handles a declined payment and updates the subscription status.
 */
async function handlePaymentDeclined(subject: any) {
    try {
        const userId = subject?.custom?.userid;
        if (!userId) {
            console.warn('handlePaymentDeclined: No user ID found.');
            return;
        }
        console.log(`Payment declined for user: ${userId}`);
        const existing = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
        if (existing.length > 0) {
            const currentFailedCount = parseInt(existing[0].failedPaymentCount || "0");
            const newFailedCount = currentFailedCount + 1;
            await db
                .update(subscriptions)
                .set({
                    failedPaymentCount: newFailedCount.toString(),
                    status: newFailedCount >= 3 ? 'expired' : 'overdue', // Deactivate after 3 failed attempts
                    isActive: newFailedCount >= 3 ? "false" : "true",
                    lastFailedPaymentReason: subject.decline_reason,
                    updatedAt: new Date(),
                })
                .where(eq(subscriptions.userId, userId));
        }
    } catch (error) {
        console.error('Error in handlePaymentDeclined:', error);
    }
}

/**
 * Handles a refunded payment.
 */
async function handlePaymentRefunded(subject: any) {
    try {
        const userId = subject?.custom?.userid;
        if (!userId) {
            console.warn('handlePaymentRefunded: No user ID found.');
            return;
        }
        console.log(`Payment refunded for user: ${userId}`);
        await db
            .update(subscriptions)
            .set({
                isActive: "false",
                status: 'cancelled',
                cancellationReason: `Refunded: ${subject.refund_reason || 'N/A'}`,
                cancelledAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(subscriptions.userId, userId));
    } catch (error) {
        console.error('Error in handlePaymentRefunded:', error);
    }
}

/**
 * Handles the start of a new recurring payment subscription.
 */
async function handleRecurringPaymentStarted(subject: any) {
    try {
        const userId = subject?.initial_payment?.custom?.userid;
        if (!userId) {
            console.warn('handleRecurringPaymentStarted: No user ID found.');
            return;
        }
        console.log(`Recurring payment started for user: ${userId}`);
        await db
            .update(subscriptions)
            .set({
                isActive: "true",
                status: 'active',
                recurringPayment: subject.reference,
                nextPaymentDate: subject.next_payment_at ? new Date(subject.next_payment_at) : null,
                updatedAt: new Date(),
            })
            .where(eq(subscriptions.userId, userId));
    } catch (error) {
        console.error('Error in handleRecurringPaymentStarted:', error);
    }
}
