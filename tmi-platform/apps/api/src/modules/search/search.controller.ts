import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(
    @Query('q') q = '',
    @Query('type') type = 'all',
    @Query('page') page = '1',
  ) {
    return this.searchService.search(q, type, parseInt(page, 10) || 1);
  }
}
