/**
 * ==================================================================================
 * LAW BUBBLE - WALLET CREDIT SYSTEM
 * ==================================================================================
 * 
 * Faster payment flow: Users buy credits once, then each question deducts 1 credit
 * Removes payment latency per question
 * 
 * POST /api/law-bubble/wallet/purchase
 * Body: { amount: 5 | 10 | 20, userId }
 * Response: { paymentUrl, credits }
 * 
 * POST /api/law-bubble/wallet/deduct
 * Body: { userId, credits: 1 }
 * Response: { remainingCredits, success }
 * 
 * GET /api/law-bubble/wallet/balance
 * Query: userId
 * Response: { credits, history[] }
 * 
 * ==================================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// IN-MEMORY WALLET (Replace with database in production)
// ============================================================================

interface WalletTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'deduct' | 'refund';
  credits: number;
  amount?: number; // USD
  timestamp: Date;
  description: string;
}

const userWallets = new Map<string, number>(); // userId -> credits
const transactions: WalletTransaction[] = [];

// ============================================================================
// PURCHASE CREDITS
// ============================================================================

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'purchase') {
    return handlePurchase(request);
  } else if (action === 'deduct') {
    return handleDeduct(request);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

async function handlePurchase(request: NextRequest) {
  const { amount, userId } = await request.json();

  // Credit packages
  const packages: Record<number, { credits: number; bonus: number }> = {
    5: { credits: 5, bonus: 0 },      // $5 = 5 credits
    10: { credits: 10, bonus: 2 },    // $10 = 12 credits (+2 bonus)
    20: { credits: 20, bonus: 5 },    // $20 = 25 credits (+5 bonus)
  };

  const pkg = packages[amount];

  if (!pkg) {
    return NextResponse.json(
      { error: 'Invalid amount. Choose $5, $10, or $20' },
      { status: 400 }
    );
  }

  // TODO: Create Stripe PaymentIntent
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: amount * 100,
  //   currency: 'usd',
  //   metadata: { userId, credits: pkg.credits + pkg.bonus }
  // });

  // Mock payment success
  const totalCredits = pkg.credits + pkg.bonus;
  const currentBalance = userWallets.get(userId) || 0;
  userWallets.set(userId, currentBalance + totalCredits);

  // Record transaction
  transactions.push({
    id: `txn_${Date.now()}`,
    userId,
    type: 'purchase',
    credits: totalCredits,
    amount,
    timestamp: new Date(),
    description: `Purchased ${pkg.credits} credits (+${pkg.bonus} bonus)`,
  });

  return NextResponse.json({
    success: true,
    credits: totalCredits,
    bonus: pkg.bonus,
    newBalance: currentBalance + totalCredits,
    paymentUrl: `https://checkout.stripe.com/mock-${userId}`, // Mock URL
  });
}

// ============================================================================
// DEDUCT CREDITS
// ============================================================================

async function handleDeduct(request: NextRequest) {
  const { userId, credits = 1 } = await request.json();

  const currentBalance = userWallets.get(userId) || 0;

  if (currentBalance < credits) {
    return NextResponse.json(
      { 
        error: 'Insufficient credits', 
        remainingCredits: currentBalance,
        needToPurchase: credits - currentBalance 
      },
      { status: 402 } // Payment Required
    );
  }

  // Deduct credits
  const newBalance = currentBalance - credits;
  userWallets.set(userId, newBalance);

  // Record transaction
  transactions.push({
    id: `txn_${Date.now()}`,
    userId,
    type: 'deduct',
    credits: -credits,
    timestamp: new Date(),
    description: 'Asked legal question',
  });

  return NextResponse.json({
    success: true,
    deducted: credits,
    remainingCredits: newBalance,
  });
}

// ============================================================================
// GET BALANCE
// ============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const balance = userWallets.get(userId) || 0;
  const userTransactions = transactions.filter(t => t.userId === userId).slice(-10);

  return NextResponse.json({
    credits: balance,
    history: userTransactions,
  });
}
