import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

const DOWNLOAD_EXPIRY_HOURS = 48;
const MAX_DOWNLOADS = 3;

@Injectable()
export class VaultService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserVault(userId: string) {
    const licenses = await this.prisma.beatLicense.findMany({
      where: { buyerId: userId },
      include: { beat: true },
      orderBy: { createdAt: 'desc' },
    });

    return licenses.map(lic => ({
      id: lic.id,
      assetType: 'BEAT',
      assetId: lic.beatId,
      title: lic.beat.title,
      licenseType: lic.type,
      pricePaid: lic.price,
      downloadUrl: lic.downloadUrl,
      purchasedAt: lic.createdAt,
      status: 'DELIVERED',
    }));
  }

  async getVaultItem(userId: string, itemId: string) {
    const license = await this.prisma.beatLicense.findUnique({
      where: { id: itemId },
      include: { beat: true },
    });

    if (!license) throw new NotFoundException('Vault item not found');
    if (license.buyerId !== userId) throw new ForbiddenException('Access denied');

    const token = await this.prisma.vaultDownloadToken.findFirst({
      where: { userId, assetId: license.beatId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      id: license.id,
      assetType: 'BEAT',
      assetId: license.beatId,
      title: license.beat.title,
      genre: license.beat.genre,
      licenseType: license.type,
      pricePaid: license.price,
      downloadUrl: license.downloadUrl,
      purchasedAt: license.createdAt,
      downloadsUsed: token?.downloadCount ?? 0,
      maxDownloads: MAX_DOWNLOADS,
      hasActiveToken: !!token,
    };
  }

  async requestDownload(userId: string, itemId: string) {
    const license = await this.prisma.beatLicense.findUnique({
      where: { id: itemId },
      include: { beat: true },
    });

    if (!license) throw new NotFoundException('Vault item not found');
    if (license.buyerId !== userId) throw new ForbiddenException('Access denied');
    if (!license.downloadUrl) throw new BadRequestException('Asset not yet available for download');

    let token = await this.prisma.vaultDownloadToken.findFirst({
      where: { userId, assetId: license.beatId, expiresAt: { gt: new Date() } },
    });

    if (!token) {
      const expiresAt = new Date(Date.now() + DOWNLOAD_EXPIRY_HOURS * 60 * 60 * 1000);
      token = await this.prisma.vaultDownloadToken.create({
        data: {
          userId,
          assetType: 'BEAT',
          assetId: license.beatId,
          maxDownloads: MAX_DOWNLOADS,
          expiresAt,
        },
      });
    }

    if (token.downloadCount >= token.maxDownloads) {
      throw new BadRequestException(`Download limit reached (${MAX_DOWNLOADS} max)`);
    }

    await this.prisma.vaultDownloadToken.update({
      where: { id: token.id },
      data: { downloadCount: { increment: 1 } },
    });

    const tempToken = randomBytes(32).toString('hex');

    return {
      success: true,
      downloadUrl: license.downloadUrl,
      tempToken,
      expiresAt: token.expiresAt,
      downloadsRemaining: token.maxDownloads - (token.downloadCount + 1),
    };
  }
}
