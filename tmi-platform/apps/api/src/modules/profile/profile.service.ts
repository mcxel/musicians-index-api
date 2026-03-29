import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    return this.prisma.userProfile.findUnique({ where: { userId } });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.userProfile.update({
      where: { userId },
      data: { ...dto },
    });
  }
}
