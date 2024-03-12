import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.auth';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthStrategy } from './strategies/jwtauth.strategy';
import { ConfigModule } from '@nestjs/config';
import {AuthorizationGuard} from './authorization/authorization.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { authenticationTokenSchema } from './schema/authentication-token.schema';
import { authenticationTokenService } from './authentication-token.service';
require('dotenv').config();
@Module({
    imports: [UsersModule,MongooseModule.forFeature([{name:'token', schema: authenticationTokenSchema}]),
      PassportModule.register({
        defaultStrategy: 'jwt',
      //   property: 'user',
      //   session: false,
      }),
      // JwtAuthStrategy,
      JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '24h' },
      })
    ],
       //.register({ defaultStrategy: 'jwt' })],
  providers: [AuthenticationService,
    LocalStrategy,JwtStrategy,
    AuthorizationGuard,
    authenticationTokenService
    // JwtAuthStrategy
  ],
  controllers : [AuthenticationController],
  exports: [AuthenticationService, authenticationTokenService],
})
export class AuthenticationModule {}

// https://github.com/bhaidar/nestjs-todo-app/blob/master/server/src/auth/auth.module.ts
