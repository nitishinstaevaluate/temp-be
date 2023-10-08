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
  ) { }

  async createUser(username: string, password: string): Promise<User | any> {
    const user = await this.userModel.findOne({ username: username });
    if (user) {
      return {
        message : 'User already exists. Try resetting your password.',
        status : false 
      }
    } else {
      return this.userModel.create({
        username,
        password,
      });
    }
  }
  async getUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async getUserById(id: string): Promise<User> {
    return await this.userModel.findById(id);
  }

  async getUser(query): Promise<User | undefined> {
    return this.userModel.findOne(query);
  }

  async getMe(userId): Promise<User | undefined> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw 'User not found';
    }
    return user;
  }
}
