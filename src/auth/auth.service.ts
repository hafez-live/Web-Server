import { Pool } from 'mysql2/promise';
import { Response, Request } from 'express';
import { sign, verify } from 'jsonwebtoken';
import { BadRequestException, ConflictException, HttpStatus, Inject, Injectable, UnauthorizedException }  from '@nestjs/common';

import { SRP6 } from '@/utils/SRP6.util';
import { Helper } from '@/utils/helper.util';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService
{
    constructor(
        @Inject('AUTH_DATABASE') private authDatabase: Pool,
        @Inject('WEB_DATABASE') private webDatabase: Pool
    )
    { }

    /**
     *
     * @param registerDto
     *
     * @return { statusCode, message }
     *
     * @description
     *      code:
     *          1000 - Must be longer than or equal to 2 and shorter than or equal to 30 characters
     *          1001 - must be an email
     *          1002 - Must be longer than or equal to 8 and shorter than or equal to 30 characters
     *          2000 - Email address already exists
     *          2001 - This Username already exists
     *          2002 - Password does not match
     *          2023 - Account created successfully
     */
    public async register(registerDto: RegisterDto)
    {
        const { firstName, lastName, username, email, password, confirmPassword } = registerDto;

        const [emailExists] = await this.authDatabase.query('SELECT `email` FROM `account` WHERE `email` = ?', [email]);
        if (emailExists[0]?.email)
            throw new ConflictException([{ field: 'email', code: '2000' }]);

        const [usernameExists] = await this.authDatabase.query('SELECT `username` FROM `account` WHERE `username` = ?', [username]);
        if (usernameExists[0]?.username)
            throw new ConflictException([{ field: 'username', code: '2001' }]);

        if (confirmPassword !== password)
            throw new BadRequestException([{ field: 'confirmPassword', code: '2002' }]);

        const [salt, verifier] = SRP6.GetSRP6RegistrationData(username, password);

        await this.authDatabase.execute('INSERT INTO `account` (`username`, `salt`, `verifier`, `email`, `reg_mail`) VALUES (?, ?, ?, ?, ?)', [username.toUpperCase(), salt, verifier, email.toUpperCase(), email.toUpperCase()]);

        const [accountID] = await this.authDatabase.query('SELECT `id` FROM `account` WHERE `username` = ?', [username]);

        await this.webDatabase.execute('INSERT INTO `account_information` (`id`, `first_name`, `last_name`) VALUES (?, ?, ?)', [accountID[0].id, firstName, lastName]);

        return { statusCode: HttpStatus.OK, message: [{ field: 'successfully', code: '2023' }] };
    }

    /**
     *
     * @param loginDto
     * @param response
     *
     * @return { statusCode, message, data: { accessToken } }
     *
     * @description
     *      code:
     *          1000 - Must be longer than or equal to 2 and shorter than or equal to 30 characters
     *          1002 - Must be longer than or equal to 8 and shorter than or equal to 30 characters
     *          2003 - Incorrect username or password
     *          2024 - You are logged in successfully
     */
    public async login(loginDto: LoginDto, response: Response)
    {
        const { username, password } = loginDto;
        const [account] = await this.authDatabase.query('SELECT `id`, `salt`, `verifier` FROM `account` WHERE `username` = ?', [username]);

        if (!account[0] || !SRP6.verifySRP6(username, password, account[0]?.salt, account[0]?.verifier))
            throw new BadRequestException([{ field: 'all', code: '2003' }]);

        const accessToken = await Helper.generateAndSetToken(account, response, this.webDatabase);

        return { statusCode: HttpStatus.OK, message: [{ field: 'successfully', code: '2024' }], data: { accessToken } };
    }

    /**
     *
     * @param request
     * @param response
     *
     * @description
     *      code:
     *          2025 - You are already logged out
     */
    public async logout(request: Request, response: Response)
    {
        const refreshToken: string = request.cookies.refreshToken;
        if (!refreshToken)
            throw new UnauthorizedException('You are not logged in! Please log in to get access.');

        const [account] = await this.webDatabase.query('SELECT `id`, `refresh_token` FROM `account_information` WHERE `refresh_token` = ?', [refreshToken]);
        if (!account[0])
        {
            response.clearCookie('refreshToken', { httpOnly: true, sameSite: 'none', secure: true });
            return { statusCode: HttpStatus.OK, message: [{ field: 'successfully', code: '2025' }] };
        }

        await this.webDatabase.execute('UPDATE `account_information` SET `refresh_token` = NULL WHERE `id` = ?', [account[0].id]);

        response.clearCookie('refreshToken', { httpOnly: true, sameSite: 'none', secure: true });
        return { statusCode: HttpStatus.OK, message: [{ field: 'successfully', code: '2025' }] };
    }

    /**
     *
     * @param request
     *
     * @description
     *      code:
     *          2026 - Invalid Token. Please log in again!
     */
    public async refresh(request: Request)
    {
        const refreshToken: string = request.cookies.refreshToken;
        if (!refreshToken)
            throw new UnauthorizedException('You are not logged in! Please log in to get access.');

        const [account] = await this.webDatabase.query('SELECT `id`, `refresh_token` FROM `account_information` WHERE `refresh_token` = ?', [refreshToken]);
        if (!account[0])
            throw new UnauthorizedException([{ field: 'all', code: '2026' }]);

        const verifyRefreshToken: any = verify(refreshToken, process.env.JWT_REFRESH_KEY);
        if (!verifyRefreshToken || account[0]?.id !== verifyRefreshToken.id)
            throw new UnauthorizedException([{ field: 'all', code: '2026' }]);

        const accessToken: string = sign({ id: account[0].id }, process.env.JWT_ACCESS_KEY, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN });
        return { statusCode: HttpStatus.OK, data: accessToken };
    }
}
