import { Response, Request } from 'express';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';

import { AuthGuard } from './auth.guard';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController
{
    constructor(private readonly authService: AuthService)
    {
    }

    @Post('register')
    public async register(@Body() registerDto: RegisterDto)
    {
        return this.authService.register(registerDto);
    }

    @Post('login')
    public async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response)
    {
        return this.authService.login(loginDto, response);
    }

    @Get('logout')
    @ApiSecurity('JsonWebToken')
    @UseGuards(AuthGuard)
    public async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response)
    {
        return this.authService.logout(request, response);
    }

    @Get('refresh')
    public async refresh(@Req() request: Request)
    {
        return this.authService.refresh(request);
    }
}
