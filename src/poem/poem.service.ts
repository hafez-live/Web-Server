import { Pool } from 'mysql2/promise';
import { BadRequestException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';

import { Locale } from '@/shared/enums';

@Injectable()
export class PoemService
{
    private logger: Logger = new Logger(PoemService.name);

    constructor(
        @Inject('AUTH_DATABASE') private authDatabase: Pool,
        @Inject('WEB_DATABASE') private webDatabase: Pool
    )
    { }

    public async findByID(id: string, locale: Locale)
    {
        if (!Object.values(Locale)?.includes(locale))
            throw new BadRequestException({ statusCode: HttpStatus.BAD_REQUEST, message: 'Invalid Locale' });

        try
        {
            const [words] = await this.webDatabase.query(`SELECT words FROM poem_words WHERE id = ${ id }`);
            const [meaning] = await this.webDatabase.query(`SELECT meaning FROM poem_meaning WHERE id = ${ id }`);
            const [content] = await this.webDatabase.query(`SELECT id, content FROM poem_content WHERE id = ${ id }`);
            const [perception] = await this.webDatabase.query(`SELECT perception FROM poem_perception WHERE id = ${ id }`);
            const [explanation] = await this.webDatabase.query(`SELECT explanation FROM poem_explanation WHERE id = ${ id }`);

            return { statusCode: HttpStatus.OK, data: { poem: { ...content[0], ...meaning[0], ...words[0], ...explanation[0], ...perception[0] }}};
        }
        catch (exception)
        {
            return { statusCode: HttpStatus.CONFLICT, message: [{ field: 'all', code: '2030' }] };
        }
    }

    public async findAllAndOrder(locale: Locale, page = 1, limit = 20)
    {
        if (!Object.values(Locale)?.includes(locale))
            throw new BadRequestException({ statusCode: HttpStatus.BAD_REQUEST, message: 'Invalid Locale' });

        const [poems] = await this.webDatabase.query(`SELECT id, content FROM poem_content ORDER BY id ASC LIMIT ${ page - 1 }, ${ limit };`);
        const [poemsCount] = await this.webDatabase.query('SELECT COUNT(id) AS totals FROM `poem_content`');

        return { statusCode: HttpStatus.OK, data: { ...poemsCount[0], hasMore: Number(page) < Math.ceil(poemsCount[0].totals / Number(limit)), poems }};
    }

    public async searchInContent(locale: Locale, search: string, page = 1, limit = 20)
    {
        if (!Object.values(Locale)?.includes(locale))
            throw new BadRequestException({ statusCode: HttpStatus.BAD_REQUEST, message: 'Invalid Locale' });

        const [poems] = await this.webDatabase.query(`SELECT id, content FROM poem_content WHERE content LIKE '%${ search }%' LIMIT ${ page - 1 }, ${ limit }`);
        const [poemsCount] = await this.webDatabase.query('SELECT COUNT(id) AS totals FROM `poem_content`');

        return { statusCode: HttpStatus.OK, data: { ...poemsCount[0], hasMore: Number(page) < Math.ceil(poemsCount[0].totals / Number(limit)), poems } };
    }
}
