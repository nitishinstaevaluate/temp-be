import { Model } from 'mongoose';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto } from './dto/createuser.dto';
import { authenticationTokenService } from 'src/authentication/authentication-token.service';
import { KeyCloakAuthGuard } from 'src/middleware/key-cloak-auth-guard';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('user') private readonly userModel: Model<UserDocument>,
    private authenticationTokenService:authenticationTokenService
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

  async getUserData(request){
    return await this.authenticationTokenService.fetchUserDetails(request);
  }

  async createKeyCloakUser(payload){
    try{
      payload.enabled = true;   //If enabled is not set to true flag, created user will be set as disabled by default
      const KCGuard = new KeyCloakAuthGuard();
      await KCGuard.createAuthUser(payload).toPromise();
      return {
        status:true,
        msg:"user creation success",
      }
    }
    catch(error){
      throw new HttpException(
        {
          error: error,
          status: false,
          msg: 'User creation failed',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async resetKeyCloakUserPassword(payload){
    try{
      const KCGuard = new KeyCloakAuthGuard();
      const resetPayload = {
        email:payload.email,
        cred:{
          type:"password",
          temporary:false,
          value:payload.password
        }
      }
      await KCGuard.resetPassword(resetPayload).toPromise();
      return {
        status:true,
        msg:"password reset success",
      }
    }
    catch(error){
      throw new HttpException(
        {
          error: error,
          status: false,
          msg: 'password reset failed',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
