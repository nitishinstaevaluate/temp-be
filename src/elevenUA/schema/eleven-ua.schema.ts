import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ElevenUa {}

export type ElevenUaDocument = ElevenUa & Document;
export const ElevenUaSchema = SchemaFactory.createForClass(ElevenUa);