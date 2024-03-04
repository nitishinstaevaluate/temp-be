import { HttpException, HttpStatus, Injectable,NotAcceptableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/schema/user.schema';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { KeyCloakAuthGuard } from 'src/middleware/key-cloak-auth-guard';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthenticationService {

    constructor(
        private readonly usersService: UsersService,
        private jwtService: JwtService,
      ) {}

      async validateUser(username: string, password: string): Promise<any> {
        const user = await this.usersService.getUser({ username });
        if (!user) return null;
        const passwordValid = await bcrypt.compare(password, user.password)
        if (!user) {
            throw new NotAcceptableException('could not find the user');
        }
        if (user && passwordValid) {
            return user;
        }
        return null;
    }


    async login(user: any) {
        const payload = { username: user.username, sub: user._id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

     async loginVersionTwo(request){
      try{
        const response = new KeyCloakAuthGuard(new Reflector());
        return await response.authoriseKCUser(request).toPromise();
      }
      catch(error){
        throw new HttpException(
          {
            error: error.response,
            status: false,
            msg: error.response.message,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    getPublic(): string {
        // console.log(process.env.DBCONN);
        return 'This is a public resource. Welcome visitor!';
      }
      
      getPrivate(): string {
        return 'This is a protected resource. Welcome member';
      }

      create(): string {
        return 'This is another protected resource. Welcome member. Use this sample to validate tokens';
      }

      async validateUserCredentials(
        username: string,
        password: string,
      ): Promise<any> {
        // console.log(username, password);
        const user = await this.usersService.getUser({ username, password });
    
        return user ?? null;
      }
    
      async loginWithCredentials(user: User) {
        // console.log('i am here');
        // const payload = { username: user.username };
    
        // return {
        //   username: user.username,
        // //   userId: user._id,
        //   access_token: this.jwtService.sign(payload),
        //   expiredAt: Date.now() + 60000,
        // };
      }

      async extractUserId (req) {
        const token = req.headers.authorization;
      
        if (!token || !token.startsWith('Bearer ')) {
          return { status:false, msg: 'Unauthorized' };
        }
        const authToken = token.split(' ')[1];

        const decodedToken =  this.jwtService.verify(authToken);
        return {
          userId:decodedToken.sub,
          status:true,
          msg:"Extraction successful"
        };
      };


      async extractUser (req) {
        const token = req.headers.authorization;
      
        if (!token || !token.startsWith('Bearer ')) {
          return { status:false, msg: 'Unauthorized' };
        }
        const authToken = token.split(' ')[1];

        const decodedToken =  this.jwtService.verify(authToken);
        return {
          userId:decodedToken,
          status:true,
          msg:"Extraction successful"
        };
      };

      async extractBearer(req){
          const token = req.headers.authorization;
          if (!token || !token.startsWith('Bearer ')) {
            return { status:false, msg: 'Unauthorized' };
          }

          return {
            token,
            status:true,
            msg:"token found"
          }
      }
}
