import { Module } from '@nestjs/common';
import { Pool, createPool } from 'mysql2/promise';

@Module
({
    providers:
    [
        {
            provide: 'AUTH_DATABASE',
            useFactory: async(): Promise<Pool> =>
            {
                return createPool
                ({
                    host: process.env.AUTH_DATABASE_HOST,
                    port: +process.env.AUTH_DATABASE_PORT,
                    database: process.env.AUTH_DATABASE_NAME,
                    user: process.env.AUTH_DATABASE_USERNAME,
                    password: process.env.AUTH_DATABASE_PASSWORD
                });
            }
        },
        {
            provide: 'WEB_DATABASE',
            useFactory: async(): Promise<Pool> =>
            {
                return createPool
                ({
                    host: process.env.WEB_DATABASE_HOST,
                    port: +process.env.WEB_DATABASE_PORT,
                    database: process.env.WEB_DATABASE_NAME,
                    user: process.env.WEB_DATABASE_USERNAME,
                    password: process.env.WEB_DATABASE_PASSWORD
                });
            }
        }
    ],
    exports: ['AUTH_DATABASE', 'WEB_DATABASE']
})
export class DatabaseModule
{

}
