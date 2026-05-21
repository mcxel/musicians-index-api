import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommerceAuthorityService {
  private readonly logger = new Logger(CommerceAuthorityService.name);

  constructor(private readonly prisma: PrismaService) {}

  async executeSecureTransaction(userId: string, amount: number, itemType: 'STORE' | 'BEAT' | 'NFT' | 'MERCH' | 'TICKET' | 'REWARD', itemId: string) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.availableBalance < amount) {
        throw new BadRequestException('Insufficient balance for transaction');
      }

      const updatedWalletCount = await tx.wallet.updateMany({
        where: { id: wallet.id, availableBalance: { gte: amount } },
        data: { availableBalance: { decrement: amount } }
      });

      if (updatedWalletCount.count === 0) {
        throw new BadRequestException('Transaction failed: Insufficient funds during deduction');
      }

      const ledgerEntry = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: -amount,
          netAmount: -amount,
          category: `PURCHASE_${itemType}`,
          referenceId: itemId,
          direction: 'debit',
          status: 'COMPLETED'
        }
      });

      const updatedWallet = await tx.wallet.findUnique({ where: { id: wallet.id } });
      return { updatedWallet, ledgerEntry };
    }).catch(error => {
      this.logger.error(`Transaction failed for user ${userId} on item ${itemId}`, error.stack);
      throw new InternalServerErrorException('Commerce transaction aborted. Rollback executed.');
    });
  }

  async executeCredit(userId: string, amount: number, itemType: 'ROYALTY' | 'REFUND' | 'PAYOUT', referenceId: string) {
    if (amount <= 0) {
      throw new BadRequestException('Credit amount must be positive.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.upsert({
        where: { userId },
        update: { availableBalance: { increment: amount } },
        create: { userId, availableBalance: amount },
      });

      const ledgerEntry = await tx.walletTransaction.create({
        data: {
          walletId: updatedWallet.id,
          amount,
          netAmount: amount,
          category: `CREDIT_${itemType}`,
          referenceId,
          direction: 'credit',
          status: 'COMPLETED',
        },
      });

      this.logger.log(`Credited ${amount} to user ${userId} for ${itemType} ${referenceId}`);
      return { updatedWallet, ledgerEntry };
    });
  }

  async executeRefund(referenceId: string, reason: string) {
    this.logger.warn(`Refund/Rollback triggered for reference: ${referenceId}. Reason: ${reason}`);

    return this.prisma.$transaction(async (tx) => {
      const transactions = await tx.walletTransaction.findMany({
        where: { referenceId, status: 'COMPLETED' }
      });

      if (transactions.length === 0) {
        throw new BadRequestException('No completed transactions found for rollback.');
      }

      for (const t of transactions) {
        await tx.wallet.update({
          where: { id: t.walletId },
          data: { availableBalance: { decrement: t.amount } }
        });

        await tx.walletTransaction.update({
          where: { id: t.id },
          data: { status: 'REFUNDED' }
        });
      }

      return { status: 'ROLLBACK_SUCCESS', transactionsReverted: transactions.length };
    });
  }
}
