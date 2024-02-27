import { Injectable } from "@nestjs/common";
import { ConvertAPI } from "convertapi";
import * as fs from 'fs';
import * as path from 'path';
import { AWS_STAGING, DOCUMENT_UPLOAD_TYPE } from "src/constants/constants";
import { SYNC_FUSION_DOC_CONVERT, IFIN_REPORT, IFIN_FINANCIAL_SHEETS } from "src/library/interfaces/api-endpoints.prod";
import { axiosInstance } from "src/middleware/axiosConfig";
const FormData = require('form-data');
require('dotenv').config()
@Injectable()
export class thirdpartyApiAggregateService {

    async upsertReportInS3(data,filename){
        try{
            const headers = {
            'x-api-key': process.env.AWS_S3_API_KEY,
            "Content-Type": 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            }
            
            const upsertReport = await axiosInstance.put(`${IFIN_REPORT}${AWS_STAGING.PROD}/${DOCUMENT_UPLOAD_TYPE.VALUATION_REPORT}/${filename}`,data,{headers});
            if(upsertReport.status === 200){
                return { filename } 
            }
            else{
                return {
                    status:false,
                    msg:'Report upload failed',
                }
            }
        }
        catch(error){
          throw error
        }
      }

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

       async fetchFinancialSheetFromS3(fileName){
        try{
          if(fileName){
      
            const headers = {
              'x-api-key': process.env.AWS_S3_API_KEY,
              "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
      
           const fetchFinancialSheet = await axiosInstance.get(`${IFIN_FINANCIAL_SHEETS}${AWS_STAGING.PROD}/${DOCUMENT_UPLOAD_TYPE.FINANCIAL_EXCEL}/${fileName}`,{headers})
           if(fetchFinancialSheet.status === 200){
            if(Buffer.from(fetchFinancialSheet.data, 'base64').toString('base64') !== fetchFinancialSheet.data.trim()){
              throw new Error('The specified key does not exist');
            }
            else{
              const uploadDir = path.join(process.cwd(),'uploads');
      
              const buffer = Buffer.from(fetchFinancialSheet.data, 'base64');
              const filePath = path.join(uploadDir, fileName);
      
              const saveFile = async () => {
                try {
                  if (!fs.existsSync(uploadDir)) {
                    await fs.promises.mkdir(uploadDir, { recursive: true });
                  }
                  await fs.promises.writeFile(filePath, buffer);
                  return filePath;
                } catch (error) {
                  throw error;
                }
              };
      
              return saveFile();
            }
           }
           else{
            return {
              status:false,
              msg:'financial sheet fetch failed',
            }
           }
        
          }
        }
        catch(error){
          return {
            error:error,
            status:false,
            msg:'Financial sheet upload failed'
          }
        }
      }

      async upsertExcelInS3(data,filename){
        try{
            const headers = {
            'x-api-key': process.env.AWS_S3_API_KEY,
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
            const upsertExcel = await axiosInstance.put(`${IFIN_FINANCIAL_SHEETS}${AWS_STAGING.PROD}/${DOCUMENT_UPLOAD_TYPE.FINANCIAL_EXCEL}/${filename}`,data,{headers});
            
            if(upsertExcel.status === 200){
                return { excelSheetId: `${filename}` } 
            }
            else{
                return {
                status:false,
                msg:'financial sheet upload failed',
                }
            }
        }
        catch(error){
                throw error
            }
        }

        async convertDocxToPdf(docxFileName,pdfFilePath){
            try{
                const { dir: directory, base: filename } = path.parse(docxFileName);
                
                await this.fetchReportFromS3(filename);

                const convertapi = new ConvertAPI(process.env.CONVERTAPISECRET);
                const conversion = await  convertapi.convert('pdf', { File: `${docxFileName}`},'docx');
                await conversion.file.save(pdfFilePath);

                return (await fs.readFileSync(pdfFilePath));
            }
            catch(error){
                return{
                    msg:'conversion from docx to pdf failed',
                    status:false,
                    error:error.message
                }
            }
        }
}