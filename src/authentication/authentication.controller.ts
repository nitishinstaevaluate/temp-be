import {
  Body,
  Controller,
  Delete,
  Get,Req,Res,
  Param,
  Post,
  Request,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthGuard } from '@nestjs/passport';
import { config } from 'process';
import { Response} from 'express';
// import { authconfig } from '../middleware/auth0';
// const { auth } = require('express-openid-connect');
// import { Client, Account, ID } from "appwrite";

// const client = new Client();
// const account = new Account(client);



@Controller('authentication')
export class AuthenticationController {

  constructor(private authenticationService: AuthenticationService) { }

  @Get('/public')
  getPublic(): string {
    // client
    // .setEndpoint('http://localhost/v1') // Your API Endpoint
    // .setProject('6408d4a7c842244b3c9d') // Your project ID  5df5acd0d48c2
    // ;

    // const promise = account.create('downlz', 'email@example.com', 'password');

    // promise.then(function (response) {
    //     console.log(response); // Success
    // }, function (error) {
    //     console.log(error); // Failure
    // });

    // Register User
      // account.create(
      //   ID.unique(),
      //   'me@example.com',
      //   'password',
      //   'Jane Doe'
      // ).then(response => {
      //   console.log(response);
      // }, error => {
      //   console.log(error);
      // });

    return this.authenticationService.getPublic();
  }
  
  

  @UseGuards(AuthGuard('jwt'))
  @Get('/private')
  getProtected(@Req() req: Request, @Res() res: Response) {
    const outRes = this.authenticationService.getPrivate();
    if (outRes) {
      res.send(outRes);
    } else {
      res.status(400).send({
        msg: 'Output response not found'
      });
    }
  }

  // @UseGuards(AuthGuard('jwt'))
  // @Post('/post')
  // // async create(@Body('item') item: Item): Promise<void> {
  // async postProtected(): Promise<void> {
  //   this.authenticationService.create();
  // }

  // @UseGuards(AuthGuard('local'))
  // @Post('/login')
  // async login(@Request() req) {
  //   console.log(req.user);
  //   return this.authenticationService.loginWithCredentials(req.user);
  // }

  @UseGuards(AuthGuard('local'))
    @Post('/login')
    async login(@Request() req) {
        return this.authenticationService.login(req.user);
    }

}
