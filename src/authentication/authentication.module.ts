import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
// import { JwtStrategy } from '../middleware/jwt.strategy';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
// import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.auth';
import { ConfigModule } from '@nestjs/config';
require('dotenv').config();
@Module({
    imports: [UsersModule,
      PassportModule,
      JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1h' },
      })],
       //.register({ defaultStrategy: 'jwt' })],
  providers: [AuthenticationService,LocalStrategy],
  controllers : [AuthenticationController],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
