/**
 * FanPointLedgerEngine.ts
 *
 * Immutable ledger of all points transactions for audit trail.
 * Records: earned, spent, transferred, adjusted.
 * Purpose: Prevent fraud, maintain audit trail, explain balances.
 */

export interface PointsTransaction {
  txId: string;
  fanId: string;
  transactionType: 'earned' | 'spent' | 'transferred' | 'refunded' | 'adjusted';
  sourceType: string; // "attend-event", "vote", "store-purchase", etc.
  pointsAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason?: string;
  createdAt: number;
}

// In-memory registry (append-only)
const pointsLedger: PointsTransaction[] = [];
let txCounter = 0;

/**
 * Records transaction (append-only).
 */
export function recordPointsTransaction(input: {
  fanId: string;
  transactionType: PointsTransaction['transactionType'];
  sourceType: string;
  pointsAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason?: string;
}): string {
  const txId = `tx-${txCounter++}`;

  const transaction: PointsTransaction = {
    txId,
    fanId: input.fanId,
    transactionType: input.transactionType,
    sourceType: input.sourceType,
    pointsAmount: input.pointsAmount,
    balanceBefore: input.balanceBefore,
    balanceAfter: input.balanceAfter,
    reason: input.reason,
    createdAt: Date.now(),
  };

  pointsLedger.push(transaction);
  return txId;
}

/**
 * Gets transaction by ID.
 */
export function getTransaction(txId: string): PointsTransaction | null {
  return pointsLedger.find((tx) => tx.txId === txId) ?? null;
}

/**
 * Gets all transactions for fan.
 */
export function getTransactionsByFan(fanId: string): PointsTransaction[] {
  return pointsLedger.filter((tx) => tx.fanId === fanId);
}

/**
 * Gets recent transactions.
 */
export function getRecentTransactions(limit: number = 100): PointsTransaction[] {
  return pointsLedger.slice(-limit);
}

/**
 * Gets ledger summary for fan.
 */
export function getLedgerSummaryForFan(fanId: string): {
  totalTransactions: number;
  earned: number;
  spent: number;
  transferred: number;
  refunded: number;
  adjusted: number;
  firstTransaction?: PointsTransaction;
  lastTransaction?: PointsTransaction;
} {
  const transactions = pointsLedger.filter((tx) => tx.fanId === fanId);

  return {
    totalTransactions: transactions.length,
    earned: transactions
      .filter((tx) => tx.transactionType === 'earned')
      .reduce((sum, tx) => sum + tx.pointsAmount, 0),
    spent: transactions
      .filter((tx) => tx.transactionType === 'spent')
      .reduce((sum, tx) => sum + tx.pointsAmount, 0),
    transferred: transactions
      .filter((tx) => tx.transactionType === 'transferred')
      .reduce((sum, tx) => sum + tx.pointsAmount, 0),
    refunded: transactions
      .filter((tx) => tx.transactionType === 'refunded')
      .reduce((sum, tx) => sum + tx.pointsAmount, 0),
    adjusted: transactions
      .filter((tx) => tx.transactionType === 'adjusted')
      .reduce((sum, tx) => sum + tx.pointsAmount, 0),
    firstTransaction: transactions[0],
    lastTransaction: transactions[transactions.length - 1],
  };
}

/**
 * Gets all transactions (audit report).
 */
export function getAllTransactions(): PointsTransaction[] {
  return [...pointsLedger];
}

/**
 * Gets transactions by type.
 */
export function getTransactionsByType(
  transactionType: PointsTransaction['transactionType']
): PointsTransaction[] {
  return pointsLedger.filter((tx) => tx.transactionType === transactionType);
}
