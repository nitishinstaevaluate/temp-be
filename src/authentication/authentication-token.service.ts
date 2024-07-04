import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { authenticationTokenDocument } from "./schema/authentication-token.schema";
import { authTokenDto, authUserDto } from "./dto/authentication.dto";
import { plainToClass } from "class-transformer";
import { KeyCloakAuthGuard } from "src/middleware/key-cloak-auth-guard";
import { getRequestAuth } from "src/excelFileServices/common.methods";
import { userRoles } from "src/library/enums/user-roles.enum";
const jwt = require('jsonwebtoken');

@Injectable()
export class authenticationTokenService {
    constructor(@InjectModel('token') private readonly authTokenModel: Model<authenticationTokenDocument>){}

    async fetchToken(auth){
        try{
            const findByToken = await this.authTokenModel.findOne({sessionState: auth.sessionState}).exec();
          return {
            data:findByToken,
            status:true,
            msg:"token fetched success"
          }
        }
        catch(error){
          throw new HttpException(
            {
              error: error,
              status: false,
              msg: 'token not found',
            },
            HttpStatus.NOT_FOUND,
          );
        }
      }
    
      async upsertAuthToken(authData: authTokenDto) {
        try {
          
          const existingDocument = await this.authTokenModel.findOne({ sessionState: authData?.sessionState });
    
          if (existingDocument) {
            const updatedDocument = await this.authTokenModel.findOneAndUpdate(
              { sessionState: authData?.sessionState },
              { $set: {...authData, updatedAt: new Date()} },
              { new: true } 
            );
            return updatedDocument;
          } else {
            const newDocument = await this.authTokenModel.create(authData);
            return newDocument;
          }
        } catch (error) {
          throw new HttpException(
            {
              error: error,
              status: false,
              msg: 'Error upserting auth token',
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }


      async refreshToken(request){
        try{
          const sessionState = request.headers.session_state;
          const KCGuard = new KeyCloakAuthGuard();
        return await KCGuard.refreshToken(sessionState).toPromise();
        }
        catch(error){
          throw new HttpException(
            {
              error: error.response.error,
              errorDescription: error.response.error_description,
              status: false,
              msg: error.response.message,
            },
            HttpStatus.UNAUTHORIZED,
          );
        }
      }

      async fetchUserDetails(request){
        try{
          const accessToken = request.headers.authorization;
          return plainToClass(authUserDto, jwt.decode(accessToken), {excludeExtraneousValues:true});
        }
        catch(error){
          throw new HttpException(
            {
              error: error,
              status: false,
              msg: 'User fetch failed',
            },
            HttpStatus.UNAUTHORIZED,
          );
        }
      }

      async entityAccess(parameter, request){
        try{
          const headers = {
            authorization: request.headers.authorization
          }
          const { roles } = await this.fetchUserInfo(headers);

        return await this.validateClaims(roles, parameter)        }
        catch(error){
          throw error;
        }
      }

      async fetchUserInfo(headers){
        const KCGuard = new KeyCloakAuthGuard();
        const roles = await KCGuard.fetchUserRoles(getRequestAuth(headers)).toPromise();

        return { roles };
      }

      async validateClaims(roles, parameter){
        if(!parameter?.role?.length) return false;
      
        const entityToBeChecked = parameter.role;
        let entityRoleArray = [];
        for await(const indRole of entityToBeChecked){
          if(userRoles[indRole]){
            entityRoleArray.push(
              {
                claim:userRoles[indRole]
              }
            )
          }
        }
        let roleExist = false;
        for await(const indRole of roles){
          roleExist = entityRoleArray.some(paramRole => indRole?.name === paramRole.claim)
          if(roleExist)
            break;
        }
        return roleExist
      }
    }