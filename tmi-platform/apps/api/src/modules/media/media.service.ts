import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaService {
  getMediaStatus() {
    return {
      module: 'media',
      status: 'active',
      features: ['upload', 'stream', 'clips', 'replay', 'transcode'],
    };
  }
}
