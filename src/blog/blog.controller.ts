import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
    Controller,
    Post,
    Body,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    ParseIntPipe,
    Param,
    Patch,
    Delete,
    Query,
    Get,
    Res
} from '@nestjs/common';

import { AuthGuard } from '@/auth/auth.guard';
import { AdminGuard } from '@/auth/admin.guard';

import { BlogFindAll, Locale } from '@/shared/enums';

import { AccountRole } from '@/account/account-role.enum';
import { Roles } from '@/account/account-role.decorator';
import { AccountDecorator } from '@/account/account.decorator';

import { BlogService } from './blog.service';

import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from '@/blog/dto/update-blog.dto';
import {Response} from 'express';
import {join} from 'path';

@Controller('blog')
@ApiTags('Blog')
export class BlogController
{
    constructor(private readonly blogService: BlogService)
    { }

    @Post('/create')
    @ApiSecurity('JsonWebToken')
    @UseGuards(AuthGuard)
    @UseGuards(AdminGuard)
    @Roles(AccountRole.ADMIN, AccountRole.MANAGER)
    @UseInterceptors(FileInterceptor('thumbnail'))
    @ApiConsumes('multipart/form-data')
    @ApiBody
    ({
        schema:
        {
            type: 'object',
            properties:
            {
                titleEN: { type: 'string' },
                titleDE: { type: 'string' },
                titleFA: { type: 'string' },
                metaTitleEN: { type: 'string' },
                metaTitleDE: { type: 'string' },
                metaTitleFA: { type: 'string' },
                slug: { type: 'string' },
                summaryEN: { type: 'string' },
                summaryDE: { type: 'string' },
                summaryFA: { type: 'string' },
                contentEN: { type: 'string' },
                contentDE: { type: 'string' },
                contentFA: { type: 'string' },
                published: { type: 'enum', enum: ['Confirmed', 'Rejected', 'Waiting'] },
                thumbnail: { type: 'string', format: 'binary' }
            }
        }
    })
    public async create(@AccountDecorator() accountID: number, @Body() createBlogDto: CreateBlogDto, @UploadedFile() thumbnail: Express.Multer.File)
    {
        return this.blogService.create(accountID, createBlogDto, thumbnail);
    }

    @Patch('update/:id')
    @ApiSecurity('JsonWebToken')
    @UseGuards(AuthGuard)
    @UseGuards(AdminGuard)
    @Roles(AccountRole.ADMIN, AccountRole.MANAGER)
    @UseInterceptors(FileInterceptor('thumbnail'))
    @ApiConsumes('multipart/form-data')
    @ApiBody
    ({
        schema:
        {
            type: 'object',
            properties:
            {
                titleEN: { type: 'string' },
                titleDE: { type: 'string' },
                titleFA: { type: 'string' },
                metaTitleEN: { type: 'string' },
                metaTitleDE: { type: 'string' },
                metaTitleFA: { type: 'string' },
                slug: { type: 'string' },
                summaryEN: { type: 'string' },
                summaryDE: { type: 'string' },
                summaryFA: { type: 'string' },
                contentEN: { type: 'string' },
                contentDE: { type: 'string' },
                contentFA: { type: 'string' },
                published: { type: 'enum', enum: ['Confirmed', 'Rejected', 'Waiting'] },
                thumbnail: { type: 'string', format: 'binary' }
            }
        }
    })
    public async update(@AccountDecorator() accountID: number, @Param('id', ParseIntPipe) id: number, @Body() updateBlogDto: UpdateBlogDto, @UploadedFile() thumbnail: Express.Multer.File)
    {
        return this.blogService.update(accountID, id, updateBlogDto, thumbnail);
    }

    @Post('/toggle-like/blog-id/:id')
    @ApiSecurity('JsonWebToken')
    @UseGuards(AuthGuard)
    public async toggleLike(@AccountDecorator() accountID: number, @Param('id', ParseIntPipe) blogID: number)
    {
        return await this.blogService.toggleLike(accountID, blogID);
    }

    @Delete('/delete/:id')
    @ApiSecurity('JsonWebToken')
    @UseGuards(AuthGuard)
    @UseGuards(AdminGuard)
    @Roles(AccountRole.ADMIN, AccountRole.MANAGER)
    public async remove(@Param('id', ParseIntPipe) id: number)
    {
        return this.blogService.remove(id);
    }

    @Get('/find-by-slug/:slug')
    public async findBySlug(@Param('slug') slug: string, @Query('accountID') accountID: number, @Query('locale') locale: Locale)
    {
        return this.blogService.findBySlug(slug, accountID, locale);
    }

    @Get('/find-all-and-order/:type')
    public async findAllAndOrder(@Query('locale') locale: Locale, @Param('type') type: BlogFindAll, @Query('page') page: number, @Query('limit') limit: number)
    {
        return this.blogService.findAllAndOrder(locale, type, page, limit);
    }

    @Get('/search-in-content-and-summary')
    public async searchInContentAndSummary(@Query('locale') locale: Locale, @Query('search') search: string, @Query('page') page: number, @Query('limit') limit: number)
    {
        return this.blogService.searchInContentAndSummary(locale, search, page, limit);
    }

    @Get('uploaded-image/:image')
    public async getAvatar(@Param('folder') folder: string, @Param('image') image: string, @Res() res: Response)
    {
        return res.sendFile(join(__dirname, '..', '..', `uploads/thumbnail/${ image }`));
    }
}
