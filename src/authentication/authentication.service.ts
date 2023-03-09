import { Injectable,NotAcceptableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/schema/user.schema';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

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

    getPublic(): string {
        console.log(process.env.DBCONN);
        return 'This is a public resource. Welcome visitor!';
      }
      
      getPrivate(): string {
        return 'This is a protected resource. Welcome member';
      }

      create(): string {
        return 'This is another protected resource. Welcome member';
      }

      async validateUserCredentials(
        username: string,
        password: string,
      ): Promise<any> {
        console.log(username, password);
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

}
