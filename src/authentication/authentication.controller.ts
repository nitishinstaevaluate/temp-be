import {
  Body,
  Controller,
  Delete,
  Get, Req, Res,
  Param,
  Post,
  Request,
  Put,
  UseGuards,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthGuard } from '@nestjs/passport';
import { config } from 'process';
import { Response } from 'express';
import {AuthorizationGuard} from './authorization/authorization.guard';
import { KCloginAuthDto, authTokenDto, roleDto } from './dto/authentication.dto';
import { authenticationTokenService } from './authentication-token.service';
// import { authconfig } from '../middleware/auth0';
// const { auth } = require('express-openid-connect');
// import { Client, Account, ID } from "appwrite";

// const client = new Client();
// const account = new Account(client);



@Controller('authentication')
export class AuthenticationController {

  constructor(private authenticationService: AuthenticationService, private authenticationTokenService: authenticationTokenService) { }

  // @UseGuards(AuthorizationGuard)
  @Get('/public')
  getPublic(): string {
    return this.authenticationService.getPublic();
  }

  @UseGuards(AuthorizationGuard)
  @Get('/private')
  async private(@Request() req) {
    return this.authenticationService.getPrivate();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/loginchk')
  async loginchk(@Request() req) {
    return this.authenticationService.create();
  }

  @UseGuards(AuthGuard('local'))
  @Post('/login')
  async login(@Request() req) {
    return this.authenticationService.login(req.user);
  }

  @Get('/logout')
  logout(@Request() req): any {
    req.session.destroy();
    return { msg: 'The user session has ended' }
  }

  @Get('/extractUser')
  async extractUser(@Request() req){
    return this.authenticationService.extractUserId(req)
  }

  @Post('/v2/login')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true}))
  async loginVersionTwo(@Body() payload:KCloginAuthDto) {
    return await this.authenticationService.loginVersionTwo(payload);
  }


  @Put('/create-token')
  async insertToken(@Body() payload:authTokenDto) {
    return await this.authenticationTokenService.upsertAuthToken(payload);
  }

  @Get('/get-token/:sessionState')
  async fetchToken(@Param() sessionState) {
    return await this.authenticationTokenService.fetchToken(sessionState);
  }

  @Get('/refresh-token')
  async refreshToken(@Req() request) {
    return await this.authenticationTokenService.refreshToken(request);
  }

  @Post('/role-mapping')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true}))
  async verifyRole(
    @Body() payload: roleDto,
    @Req() request
  ){
    return await this.authenticationTokenService.entityAccess(payload, request);
  }
}
