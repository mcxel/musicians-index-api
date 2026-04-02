import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JuliusController } from './julius.controller';
import { JuliusService } from './julius.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JuliusGateway } from './julius.gateway';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [JuliusController],
  providers: [JuliusService, JuliusGateway],
  exports: [JuliusService, JuliusGateway],
})
export class JuliusModule {}
