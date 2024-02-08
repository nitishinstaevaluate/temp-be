import { Injectable } from "@nestjs/common";
import { ConvertAPI } from "convertapi";
import * as fs from 'fs';
import * as path from 'path';
import { AWS_STAGING, DOCUMENT_UPLOAD_TYPE } from "src/constants/constants";
import { SYNC_FUSION_DOC_CONVERT, IFIN_REPORT } from "src/interfaces/api-endpoints.prod";
import { axiosInstance } from "src/middleware/axiosConfig";
const FormData = require('form-data');
require('dotenv').config()


@Injectable()
export class thirdPartyReportService{
    async convertDocxToSyncfusionDocumentFormat(docxpath,fileExist?){
        try{
          if(fileExist){
            const { dir: directory, base: filename } = path.parse(docxpath);
            await this.fetchReportFromS3(filename);
          }
          const htmlContent = fs.readFileSync(docxpath);
          const formData = new FormData();
          formData.append('file', htmlContent, {
            filename: docxpath,
            contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          });
        
          const response = await axiosInstance.post(SYNC_FUSION_DOC_CONVERT, formData);
          return response.data;
         }
         catch(error){
          console.log(error)
        return {
          msg:'something went wrong',
          status:false,
          error:error.message
        }
         }
       }

       async fetchReportFromS3(fileName){
        try{
          if(fileName){
    
          const headers = {
            'x-api-key': process.env.AWS_S3_API_KEY,
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          }
    
          const fetchReport = await axiosInstance.get(`${IFIN_REPORT}${AWS_STAGING.PROD}/${DOCUMENT_UPLOAD_TYPE.VALUATION_REPORT}/${fileName}`,{headers});
    
          if(fetchReport.status === 200){
            if (Buffer.from(fetchReport.data, 'base64').toString('base64') !== fetchReport.data.trim()) {
              throw new Error('The specified key does not exist');
            } else {
    
              const uploadDir = path.join(process.cwd(),'pdf');
      
              const buffer = Buffer.from(fetchReport.data, 'base64')
      
              const filePath = path.join(uploadDir, fileName);
      
              if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
              }
              fs.writeFileSync(filePath, buffer);
              
              return filePath;
            }
          }
          else{
            throw new Error('Report fetching from S3 failed');
          }
        }
        }catch(error){
          return {
            error:error,
            status:false,
            msg:'Report fetch from S3 failed'
          }
        }
      }

      async convertPdfToDocx(filePath,savePath){
        try{
          const convertapi = new ConvertAPI(process.env.CONVERTAPISECRET);
          const conversion = await  convertapi.convert('docx', { File: `${filePath}`},'pdf');
          console.log(savePath,"path saved")
          return conversion.file.save(savePath);
        }
        catch(error){
          return{
            msg:'conversion from pdf to docx failed',
            status:false,
            error:error.message
          }
        }
       }
}