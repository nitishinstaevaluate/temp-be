import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() 
  {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://dev-m5j25rojmoxblkh0.us.auth0.com/.well-known/jwks.json',
      }),
    
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: 'http://localhost:3000',
      issuer: 'https://dev-m5j25rojmoxblkh0.us.auth0.com/',
      algorithms: ['RS256'],
    });
  }
  
  validate(payload: unknown): unknown {
    return payload;
  }
}