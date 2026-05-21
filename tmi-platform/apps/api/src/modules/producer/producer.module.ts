import { Module } from '@nestjs/common';
import { ProducerController } from './producer.controller';
import { ProducerService } from './producer.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BeatsModule } from '../beats/beats.module';

@Module({
  imports: [PrismaModule, BeatsModule],
  controllers: [ProducerController],
  providers: [ProducerService],
  exports: [ProducerService],
})
export class ProducerModule {}
