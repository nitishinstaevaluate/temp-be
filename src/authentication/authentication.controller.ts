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
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthGuard } from '@nestjs/passport';
import { config } from 'process';
import { Response } from 'express';
import {AuthorizationGuard} from './authorization/authorization.guard';
// import { authconfig } from '../middleware/auth0';
// const { auth } = require('express-openid-connect');
// import { Client, Account, ID } from "appwrite";

// const client = new Client();
// const account = new Account(client);



@Controller('authentication')
export class AuthenticationController {

  constructor(private authenticationService: AuthenticationService) { }

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

}
