import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SponsorsService {
  constructor(private readonly prisma: PrismaService) {}

  async getActivePackages() {
    return this.prisma.sponsorPackage.findMany({
      where: { isActive: true },
      orderBy: { price: 'desc' },
    });
  }

  async getAll() {
    return this.prisma.sponsorPackage.findMany({
      orderBy: { tier: 'asc' },
    });
  }
}
