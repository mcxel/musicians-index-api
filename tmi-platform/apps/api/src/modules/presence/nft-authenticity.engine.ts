import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * NFT authenticity stubs — NftAsset model is not yet in the Prisma schema.
 * Returns typed results without DB calls until the NFT schema migration is applied.
 */
@Injectable()
export class NftAuthenticityEngine {
  private readonly logger = new Logger(NftAuthenticityEngine.name);

  async generateAuthenticityHash(assetId: string): Promise<string> {
    this.logger.warn(`generateAuthenticityHash called for ${assetId} — NFT schema not yet live`);
    return crypto.createHash('sha256').update(`stub:${assetId}`).digest('hex');
  }

  async verifyProvenance(_assetId: string): Promise<never> {
    throw new NotImplementedException('NFT provenance verification requires NFT schema migration');
  }
}
