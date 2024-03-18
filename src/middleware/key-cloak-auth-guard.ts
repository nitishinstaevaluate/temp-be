import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, LoggerService, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import axios, { HttpStatusCode } from 'axios';
import * as qs from 'qs';  
import moment = require('moment');
import { KEY_CLOAK_INTROSPECT, KEY_CLOAK_TOKEN } from 'src/library/interfaces/api-endpoints.prod';
import { utilities as nestWinstonModuleUtilities, WinstonModule,  } from 'nest-winston';
import { transports,format } from 'winston';
import { KCloginAuthDto, authTokenDto } from 'src/authentication/dto/authentication.dto';
const path = require('path');
import { Reflector } from '@nestjs/core';
import { axiosInstance, axiosRejectUnauthorisedAgent } from './axiosConfig';
import { CREATE_TOKEN, FETCH_TOKEN } from 'src/library/interfaces/api-endpoints.local';
const fs = require('fs');
require('dotenv').config();

const logDir = './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const combinedLog = path.join(logDir, 'combined.log');
const errorLog = path.join(logDir, 'error.log');
const now = Date.now();
const delay = Date.now() - now;

const logger = WinstonModule.createLogger({
transports: [
    new transports.File({ filename: combinedLog }),
    new transports.File({ filename: errorLog, level: 'error' }),
    new transports.Console({
    format: format.combine(
        format.ms(),
        nestWinstonModuleUtilities.format.nestLike('Ifin', {
        colors: true,
        prettyPrint: true,
        }),
    ),
    }),
],
});

@Injectable()
export class KeyCloakAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers['authorization'];

    const reflectorHandler = new Reflector();
    
    const requiredRoles = reflectorHandler.get<string[]>('roles', context.getHandler()) || [];

    if (!accessToken) {
      logger.error(
        `${moment(now)} | ${HttpStatusCode.NotFound} | Access Token Missing - ${delay}ms `,
      );
    }

    return this.validateToken(accessToken, requiredRoles);
  }

  private validateToken(accessToken: string, roles:Array<string>): Observable<boolean> {
    return from(
        axios.post(
          KEY_CLOAK_INTROSPECT,
          qs.stringify(
            { 
              token: accessToken,
              client_secret: process.env.KEY_CLOAK_CLIENT_SECRET,
              client_id: process.env.KEY_CLOAK_CLIENT_ID,
            }
          ),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
      ).pipe(
        switchMap((response:any) => {
            const method = response.config.method;
            const url = response.config.url;

            if(!response.data.active)
              throw new UnauthorizedException({error:response,message:'Invalid access token'});

            const realAccessRoles = response.data.realm_access.roles;
            const hasRequiredRole = roles.some(role => realAccessRoles.includes(role));
            if (!hasRequiredRole && roles?.length) {
              throw new UnauthorizedException({error:response,message:'Insufficient role'});
            }
            // logger.log(
            //     `${moment(now)} | ${response.status} | Authentication | [${method.toUpperCase()}] ${url} - ${delay}ms ${JSON.stringify(
            //       response.data,
            //     )}`,
            //   );
            return [true];

        }),
        catchError((error:any) => {
          logger.error(
            `${moment(now)} | ${error.status} | [${error.config?.method?.toUpperCase() ||  error?.response?.error.config.method.toUpperCase()}] ${error.config?.url || error.response.error.config.url} - ${delay}ms ${JSON.stringify(
              {token:error.config?.data  || error.response.error.config.data},
            )} ${JSON.stringify(error.config?.data || error.response.error.data)} | ${JSON.stringify({message:error?.response?.message || error?.response?.message})}`,
          );
          throw new UnauthorizedException(
            {
              status: false,
              msg: error.response.message,
            }
          );
        })
      );
  }

  authoriseKCUser(KCAuth: KCloginAuthDto) {
    return from(
      axios.post(
          KEY_CLOAK_TOKEN, 
          qs.stringify(this.createLoginKCStructure(KCAuth)), 
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        )
      ).
      pipe(
        switchMap((loginResponse) => {
          const tokenLog = new authTokenDto();
          tokenLog.sessionState = loginResponse.data.session_state;
          tokenLog.accessToken = loginResponse.data.access_token;
          tokenLog.refreshToken = loginResponse.data.refresh_token;
          
      return from(
        axiosInstance.put(`${CREATE_TOKEN}`, tokenLog, { httpsAgent: axiosRejectUnauthorisedAgent })
          ).
          pipe(
            switchMap((authCreate)=>{
              logger.log(
                `${moment(now)} | Authentication | [POST] ${KEY_CLOAK_TOKEN} - ${delay}ms ${JSON.stringify(
                  {access_token:loginResponse.data.access_token,...KCAuth}
                )}` ,
              );
              return of({
                access_token:loginResponse.data.access_token,
                refreshToken:loginResponse.data.refresh_token,
                session_state:loginResponse.data.session_state
              });
            }),
            catchError((error) => {
              throw new UnauthorizedException({message:'Token creation failed, contact administrator',...error.response.data});
            }
            )
          );
        }
      ),
        catchError((error) => {
          throw new UnauthorizedException({message:'Login failed, contact administrator',...error.response.data});
        }
      )
    );
  }

  refreshToken(session_state){
      return from(
        axiosInstance.get(
          `${FETCH_TOKEN}/${session_state}`,
          { 
            httpsAgent: axiosRejectUnauthorisedAgent 
          }
        )
      ).pipe(
        switchMap((authFetchToken)=>{
          const refreshTokenDetails = authFetchToken?.data?.data;
          return from(
            axios.post(
            KEY_CLOAK_TOKEN,
            qs.stringify(this.createRefreshTokenStructure(refreshTokenDetails)), 
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            }
          )).pipe(
            switchMap((authRefreshTokenDetails:any)=>{
              const tokenLog = new authTokenDto();
              tokenLog.sessionState = authRefreshTokenDetails.data.session_state;
              tokenLog.accessToken = authRefreshTokenDetails.data.access_token;
              tokenLog.refreshToken = authRefreshTokenDetails.data.refresh_token;
              return from(
                axiosInstance.put(`${CREATE_TOKEN}`, tokenLog, { httpsAgent: axiosRejectUnauthorisedAgent })
              ).
              pipe(
                switchMap((authCreate)=>{
                  return of({accessToken:authCreate.data.accessToken,sessionState:authCreate.data.sessionState})
                }),
                catchError((error) => {
                  throw new UnauthorizedException({message:'Token upsertion failed, contact administrator',error});
                }));
            }),
            catchError((error)=>{
              throw new UnauthorizedException({message:'Token refresh failed, contact administrator',...error.response});
            }))
        }),
        catchError((error)=>{
          logger.error(
            `${moment(now)} | ${error.status} | [GET] ${error.config?.url} - ${delay}ms ${JSON.stringify(
              {token:error.config?.data},
            )} ${JSON.stringify(error.response?.data)} | ${JSON.stringify({message:error?.response?.message})}`,
          );
          throw new UnauthorizedException({message:'Token fetch failed - (db error), contact administrator',...error.response.data});
        }))
  }

  fetchAuthUser(request){
    const token = request.headers.authorization;
      
    if (!token) {
      return { status:false, msg: 'Unauthorized' };
    }

    return from(
      axios.post(
        KEY_CLOAK_INTROSPECT,
        qs.stringify(
          { 
            token: token,
            client_secret: process.env.KEY_CLOAK_CLIENT_SECRET,
            client_id: process.env.KEY_CLOAK_CLIENT_ID,
          }
        ),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
    ).pipe(
      switchMap((response:any) => {
          const method = response.config.method;
          const url = response.config.url;

          if(!response.data.active)
            throw new UnauthorizedException({error:response,message:'Invalid access token'});

          logger.log(
              `${moment(now)} | ${response.status} | Authentication | [${method.toUpperCase()}] ${url} - ${delay}ms ${JSON.stringify(
                response.data,
              )}`,
            );
          return of({...response.data,status:true,userId:response.data.sub});
          
      }),
      catchError((error:any) => {
        logger.error(
          `${moment(now)} | ${error.status} | [${error.response.error.config.method.toUpperCase()}] ${error.response.error.config.url} - ${delay}ms ${JSON.stringify(
            {token:error.response.error.config.data},
          )} ${JSON.stringify(error.response.error.data)} | ${JSON.stringify({message:error.response.message})}`,
        );
        throw new UnauthorizedException(
          {
            status: false,
            msg: error.response.message,
          }
        );
      })
    );
  }

  private createLoginKCStructure(KCAuth){
    return {
      client_id: process.env.KEY_CLOAK_CLIENT_ID,
      client_secret: process.env.KEY_CLOAK_CLIENT_SECRET,
      grant_type: 'password',
      username:KCAuth.userName,
      password:KCAuth.password
    }
  }

  private createRefreshTokenStructure(authToken){
    return {
      client_id: process.env.KEY_CLOAK_CLIENT_ID,
      client_secret: process.env.KEY_CLOAK_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token:authToken.refreshToken
    }
  }
}
