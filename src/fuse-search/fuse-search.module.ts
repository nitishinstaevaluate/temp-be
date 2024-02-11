import { Module } from '@nestjs/common';
import { FuseSearchService } from './fuse-search.service';
import { FuseSearchController } from './fuse-search.controller';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { UsersService } from 'src/users/users.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    providers:[FuseSearchService, AuthenticationService],
    controllers:[FuseSearchController],
    imports:[
      AuthenticationModule,
      UsersModule,
      JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '24h' },
      })
    ]
})
export class FuseSearchModule {}