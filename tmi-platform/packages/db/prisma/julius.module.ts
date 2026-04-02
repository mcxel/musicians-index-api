import { Module } from '@nestjs/common';
import { JuliusController } from './julius.controller';
import { JuliusService } from './julius.service';

@Module({
  imports: [],
  controllers: [JuliusController],
  providers: [JuliusService],
  exports: [JuliusService],
})
export class JuliusModule {}import { Module } from '@nestjs/common';
import { JuliusController } from './julius.controller';
import { JuliusService } from './julius.service';

@Module({
  imports: [],
  controllers: [JuliusController],
  providers: [JuliusService],
  exports: [JuliusService],
})
export class JuliusModule {}