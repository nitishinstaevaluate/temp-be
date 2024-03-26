import {
    Body,
    Controller,
    Post,
    UseGuards,
    Get,
    UploadedFile,
    UseInterceptors,
    Param,
    ParseFilePipe,
    FileTypeValidator,
    MaxFileSizeValidator,
    Req,
    ValidationPipe,
    UsePipes,
  } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { User } from './schema/user.schema';
import * as bcrypt from 'bcrypt';
import { KeyCloakAuthGuard } from 'src/middleware/key-cloak-auth-guard';
import { KCcreatUserDto } from './dto/createuser.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Post()
    async createUser(
      @Body('username') username: string,
      @Body('password') password: string,
    ) : Promise<User> {
        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltOrRounds);
        const result = await this.userService.createUser(
            username,
            hashedPassword,
        );
        return result;
    }
    //   return this.userService.createUser(email, password);
    
  
    @UseGuards(KeyCloakAuthGuard)
    @Get()
    async getAllUsers() {
      return this.userService.getUsers();
    }
    
    @UseGuards(KeyCloakAuthGuard)
    @Get('fetch-user')
    async getUserDetails(@Req() request: Request) {
      return await this.userService.getUserData(request);
    }

    @Post('create-user')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true}))
    async createKCUser(@Body(ValidationPipe) payload: KCcreatUserDto) {
      return await this.userService.createKeyCloakUser(payload);
    }

    @UseGuards(KeyCloakAuthGuard)
    @Get(':id')
    async getMe(@Param() params) {
      return this.userService.getMe(params.id);
    }
}
