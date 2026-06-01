import { Module } from '@nestjs/common';
import { CypherController } from './cypher.controller';
import { CypherService } from './cypher.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CypherController],
  providers: [CypherService],
  exports: [CypherService],
})
export class CypherModule {}
