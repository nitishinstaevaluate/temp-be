import * as mongoose from 'mongoose';

export const LoggerSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  requestMethod: { type: String, required: true },
  requestBody: { type: String,default:null},
  level: { type: String, required: true },
  error: { type: Object,default:null },
  model: { type: String, required: true },
  service: { type: String, required: true },
  apiUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  message: { type: String, required: true },
  dateTime: { type: Date, default: Date.now },
});


export interface Logger extends mongoose.Document {
  userId: string;
  requestMethod: string;
  requestBody: string;
  level: string;
  error: any;
  model: string;
  service: string;
  apiUrl: string;
  fileName: string;
  message: string;
  dateTime: Date;
}