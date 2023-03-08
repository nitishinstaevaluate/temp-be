import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
// import { JwtStrategy } from '../middleware/jwt.strategy';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
    imports: [PassportModule,
      JwtModule.register({
        secret: 'SECRET_KEY',
        signOptions: { expiresIn: '1h' },
      })],
       //.register({ defaultStrategy: 'jwt' })],
  providers: [AuthenticationService,JwtStrategy,LocalStrategy],
  controllers : [AuthenticationController],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
