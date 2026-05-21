import { Injectable } from '@nestjs/common';
import { BeatsService } from '../beats/beats.service';

@Injectable()
export class ProducerService {
  constructor(private readonly beatsService: BeatsService) {}

  async getStats(producerId: string) {
    return this.beatsService.getProducerStats(producerId);
  }
}
