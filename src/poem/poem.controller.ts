import { ApiTags } from '@nestjs/swagger';
import { Controller, Param, Query, Get } from '@nestjs/common';

import { Locale } from '@/shared/enums';

import { PoemService } from './poem.service';

@Controller('poem')
@ApiTags('Poem')
export class PoemController
{
    constructor(private readonly poemService: PoemService)
    { }

    @Get('/find-by-id/:id')
    public async findByID(@Param('id') slug: string, @Query('locale') locale: Locale, @Query('token') token: string)
    {
        return this.poemService.findByID(slug, token, locale);
    }

    @Get('/find-all')
    public async findAllAndOrder(@Query('locale') locale: Locale, @Query('page') page: number, @Query('limit') limit: number, @Query('token') token: string)
    {
        return this.poemService.findAllAndOrder(locale, token, page, limit);
    }

    @Get('/search-in-content')
    public async searchInContentAndSummary(@Query('locale') locale: Locale, @Query('token') token: string, @Query('search') search: string, @Query('page') page: number, @Query('limit') limit: number)
    {
        return this.poemService.searchInContent(locale, token, search, page, limit);
    }
}
