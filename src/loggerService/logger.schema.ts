import * as mongoose from 'mongoose';

export const LoggerSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  requestMethod: { type: String, required: true },
  requestBody: { type: Object,default:null},
  level: { type: String, required: true },
  error: { type: Object,default:null },
  apiUrl: { type: String, required: true },
  stack: { type:String,default:null},
  message: { type: String, required: true },
});


export interface Logger extends mongoose.Document {
  userId: string;
  requestMethod: string;
  requestBody: string;
  level: string;
  error: any;
  apiUrl: string;
  stack:string;
  message: string;
}