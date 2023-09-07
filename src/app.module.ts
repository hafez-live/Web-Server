import { Module } from '@nestjs/common';
import { memoryStorage } from 'multer';

import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MulterModule } from '@nestjs/platform-express';

import { AuthModule } from '@/auth/auth.module';
import { PoemModule } from '@/poem/poem.module';
import { BlogModule } from '@/blog/blog.module';
import { AccountModule } from '@/account/account.module';
import { AccountPasswordModule } from '@/account-password/account-password.module';

@Module
({
    imports:
    [
        ConfigModule.forRoot({ envFilePath: ['.env'] }),
        ThrottlerModule.forRoot({ ttl: 60, limit: 10 }),
        MulterModule.register({ storage: memoryStorage() }),
        AuthModule,
        AccountModule,
        AccountPasswordModule,
        BlogModule,
        PoemModule
    ]
})

export class AppModule
{

}
