import { verify } from 'jsonwebtoken';
import { Pool } from 'mysql2/promise';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate
{
    private decoded: any;

    constructor(
        @Inject('AUTH_DATABASE') private authDatabase: Pool,
        @Inject('WEB_DATABASE') private webDatabase: Pool
    )
    { }

    async canActivate(context: ExecutionContext): Promise<boolean>
    {
        const request = GqlExecutionContext.create(context).getContext().req;

        let token: string;

        if (request.headers.authorization && request.headers.authorization.startsWith('Bearer'))
            token = request.headers.authorization.split(' ')[1];
        else
            token = request.cookies.accessToken;

        if (!token)
            throw new UnauthorizedException('You are not logged in! Please log in to get access.');

        this.decoded = verify(token, process.env.JWT_ACCESS_KEY);

        const [accountExists] = await this.authDatabase.query('SELECT `role` FROM `account` WHERE `id` = ?', [this.decoded.id]);

        if (accountExists[0]?.role === 'USER')
            throw new UnauthorizedException('You are not allowed to do this!');

        return true;
    }
}
