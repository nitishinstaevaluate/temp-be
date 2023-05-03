import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto } from './dto/createuser.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('user') private readonly userModel: Model<UserDocument>,
        // private readonly httpService: HttpService,
      ) {}
    
      async createUser(username: string, password: string): Promise<User> {
        return this.userModel.create({
            username,
            password,
        });
    }
      async getUsers(): Promise<User[]> {
        return this.userModel.find().exec();
      }

      async getUserById(id: string): Promise<User> {
        return await this.userModel.findById(id);
      }
    
      async getUser(query: object): Promise<User | undefined> {
        return this.userModel.findOne({
          query
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
