import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { expressJwtSecret } from 'jwks-rsa';
import { promisify } from 'util';
import {expressjwt,GetVerificationKey} from 'express-jwt';
require('dotenv').config();
@Injectable()
export class AuthorizationGuard implements CanActivate {
    
    async canActivate(context: ExecutionContext): Promise<any> {  
        const req = context.getArgByIndex[0];
        const res = context.getArgByIndex[1];
        const checkJwt = promisify(
            expressjwt({
              secret: expressJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `${process.env.AUTH0_ISSUER_URL}.well-known/jwks.json`,
              }) as GetVerificationKey,
              audience: process.env.AUTH0_AUDIENCE,
              issuer: `${process.env.AUTH0_ISSUER_URL}`,
              algorithms: ['RS256']
            })
          );
        try {
            await checkJwt(req, res);
            return true;
        } catch (error) {
            console.log(error);
            return new UnauthorizedException(() => error);
        }
    }
};