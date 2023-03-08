import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/schema/user.schema';
import { UsersService } from '../users/users.service';
// require('dotenv').config();


@Injectable()
export class AuthenticationService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
      ) {}

    getPublic(): string {
        console.log(process.env.AUTHO_DOMAIN);
        return 'This is a public resource. Welcome visitor!';
      }
      
      getPrivate(): string {
        return 'This is a protected resource. Welcome member';
      }

      create(): string {
        return 'This is another protected resource. Welcome member';
      }

      async validateUserCredentials(
        email: string,
        password: string,
      ): Promise<any> {
        console.log(email, password);
        const user = await this.usersService.getUser({ email, password });
    
        return user ?? null;
      }
    
      async loginWithCredentials(user: User) {
        const payload = { username: user.email };
    
        return {
          username: user.email,
          access_token: this.jwtService.sign(payload),
          expiredAt: Date.now() + 60000,
        };
      }

}
