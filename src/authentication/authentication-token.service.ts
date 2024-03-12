import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { authenticationTokenDocument } from "./schema/authentication-token.schema";
import { authTokenDto } from "./dto/authentication.dto";
import { plainToClass } from "class-transformer";
import { KeyCloakAuthGuard } from "src/middleware/key-cloak-auth-guard";

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
}