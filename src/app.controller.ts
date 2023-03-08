import { Controller, Get,Req,Res } from '@nestjs/common';
import { AppService } from './app.service';
import {Request, Response} from 'express';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  
  @Get('/')
  getHello(): string {
    return this.appService.getHello();
  }

  // @Get('/test')
  // testHello(@Req() req: Request, @Res() res: Response,) {
  //   const helloMsg = this.appService.getHello();
  //   // res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
  //   return helloMsg;
  // }
}
