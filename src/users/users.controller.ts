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
  } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { User } from './schema/user.schema';
import * as bcrypt from 'bcrypt';
import { KeyCloakAuthGuard } from 'src/middleware/key-cloak-auth-guard';

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
    @Get(':id')
    async getMe(@Param() params) {
      return this.userService.getMe(params.id);
    }
}
