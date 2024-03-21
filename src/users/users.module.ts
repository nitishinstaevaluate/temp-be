import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schema/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { authenticationTokenService } from 'src/authentication/authentication-token.service';
import { authenticationTokenSchema } from 'src/authentication/schema/authentication-token.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'user',schema: UserSchema },
    {name:'token', schema: authenticationTokenSchema}
  ])],
  controllers: [UsersController],
  providers: [UsersService, authenticationTokenService],
  exports: [UsersService],
})
export class UsersModule {}