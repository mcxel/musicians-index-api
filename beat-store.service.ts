import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommerceAuthorityService } from '../presence/commerce-authority.service';

@Injectable()
export class BeatStoreService {
  private readonly logger = new Logger(BeatStoreService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly commerce: CommerceAuthorityService,
  ) {}

  async purchaseLicense(buyerId: string, licenseId: string) {
    const license = await this.prisma.beatLicense.findUnique({
      where: { id: licenseId },
    });

    if (!license || !license.isAvailable) {
      throw new NotFoundException('License not available for purchase.');
    }

    // Optimistic lock for EXCLUSIVE licenses before charging
    if (license.licenseType === 'EXCLUSIVE') {
      const lock = await this.prisma.beatLicense.updateMany({
        where: { id: licenseId, isAvailable: true },
        data: { isAvailable: false }
      });
      if (lock.count === 0) {
        throw new ConflictException('License is no longer available.');
      }
    }

    try {
      const { ledgerEntry } = await this.commerce.executeSecureTransaction(
        buyerId,
        license.price,
        'BEAT',
        license.beatId,
      );

      const purchase = await this.prisma.beatPurchase.create({
        data: {
          beatId: license.beatId,
          licenseId: license.id,
          buyerId,
          txId: ledgerEntry.id,
        },
      });


    this.logger.log(`User ${buyerId} purchased license ${licenseId} for beat ${license.beatId}`);
    return purchase;
    } catch (error) {
      // Release lock if financial transaction fails
      if (license.licenseType === 'EXCLUSIVE') {
        await this.prisma.beatLicense.update({ where: { id: licenseId }, data: { isAvailable: true } });
      }
      throw error;
    }
  }
}