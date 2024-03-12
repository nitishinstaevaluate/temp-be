import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, versionKey:false })
export class authenticationToken {
  @Prop()
  sessionState: string;

  @Prop()
  accessToken: string;

  @Prop()
  refreshToken: string;
}

export type authenticationTokenDocument = authenticationToken & Document;
export const authenticationTokenSchema = SchemaFactory.createForClass(authenticationToken);