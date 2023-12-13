import axios from 'axios';
import { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { utilities as nestWinstonModuleUtilities, WinstonModule,  } from 'nest-winston';
import { XML_FORMAT } from 'src/constants/constants';
import { transports,format } from 'winston';
const path = require('path');
const fs = require('fs');

const logDir = './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const combinedLog = path.join(logDir, 'combined.log');
const errorLog = path.join(logDir, 'error.log');

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

const setupAxiosInterceptor = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      const currentDateIST = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
      });
          if (XML_FORMAT.test(response.data)) {
            logger.error(`[${currentDateIST}] Error Response ${response.config.method?.toUpperCase()} ${response.config.url} ${response.status} ${JSON.stringify({ error: response.data })}`);
          } else {
            logger.log(`[${currentDateIST}] Response ${response.config.method?.toUpperCase()} ${response.config.url} ${response.status}`);
          }
      return response;
    },
    (error: AxiosError) => {
      const currentDateIST = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
      });
      if (error.response) {
        logger.error(`[${currentDateIST}] Error Response ${error.response.status} ${error.config.method?.toUpperCase()} ${error.config.url}`);
      } else if (error.request) {
        logger.error(`[${currentDateIST}] Request Error ${error.response.status} ${error.config.method?.toUpperCase()} ${error.config.url} ${error.request}`);
      } else {
        logger.error(`[${currentDateIST}] Error ${error.response.status} ${error.config.method?.toUpperCase()} ${error.config.url} ${error.message}`);
      }
      return Promise.reject(error);
    }
  );
};

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create();
  setupAxiosInterceptor(instance);
  return instance;
};

const axiosInstance = createAxiosInstance();
export {axiosInstance};
