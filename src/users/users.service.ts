import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto } from './dto/createuser.dto';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        private readonly httpService: HttpService,
      ) {}
    
      async createUser(email: string, password: string): Promise<User> {
        return this.userModel.create({
          email,
          password,
        });
      }
      async getUsers(): Promise<User[]> {
        return this.userModel.find().exec();
      }
    
      async getUser({ email, password }): Promise<User | undefined> {
        return this.userModel.findOne({
          email,
          password,
        });
      }
    
      async getMe(userId): Promise<User | undefined> {
        const user = await this.userModel.findById(userId);
        if (!user) {
          throw 'User not found';
        }
        return user;
      }
}
