import { Injectable } from '@nestjs/common';
import * as snowflake from 'snowflake-sdk';
import { transports, format } from 'winston';
import { utilities as nestWinstonModuleUtilities, WinstonModule,  } from 'nest-winston';
const path = require('path');
const fs = require('fs');
require('dotenv').config()

const logDir = './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const combinedLog = path.join(logDir, 'combined.log');
const errorLog = path.join(logDir, 'error.log');

@Injectable()
export class SnowflakeClientServiceService {
    private connection: any;
    connected = false;

    constructor() {
            // this.logger.log(`[${this.currentDateIST}] { "message" : "Please wait, initializing snowflake connection" }`);
            // this.connectToSnowflake();
      }

    private logger = WinstonModule.createLogger({
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
        
    private  currentDateIST = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
    });


    async onModuleInit() {
        // if (!this.connected) {
            this.logger.log(`[${this.currentDateIST}] { "message" : "Please wait, initializing snowflake connection" }`);

            await this.connectToSnowflake();
            // this.connected = await this.isConnectionActive();
        //   } 
    }

    

    async connectToSnowflake(): Promise<void> {
    // return new Promise((resolve, reject) => {
        this.connection = snowflake.createConnection({
            account: process.env.SNOWFLAKE_ACCOUNT_NAME,
            username: process.env.SNOWFLAKE_USERNAME,
            password: process.env.SNOWFLAKE_PASSWORD,
            database: process.env.SNOWFLAKE_DATABASE,
            warehouse: process.env.SNOWFLAKE_WAREHOUSE,
            schema: process.env.SNOWFLAKE_SCHEMA,
            streamResult: true
        });

        this.connection.connect((err, conn) => {
            if (err) {
                this.logger.error(`[${this.currentDateIST}] Error Response ${err.response.status} ${err.response.config?.method?.toUpperCase()} ${err.response.config?.url}  ${JSON.stringify({ error: err.response.config?.data })}`);
    
            } else {
                this.logger.log(`[${this.currentDateIST}] { "message" : "Snowflake connection initialized successfully" }`);
            }
        });
    // });
    }
    
     isConnectionActive() {
            return  this.connection.isValidAsync();
    }

     async executeSnowflakeQuery(sqlQuery: string){
        if (!this.isConnectionActive() || !this.connection) {
             await this.connectToSnowflake();
        }
        return new Promise((resolve, reject) => {
            const allRows = [];
        
            this.connection.execute({
                sqlText: `${sqlQuery}`,
                complete: function (err, stmt, rows) {
                    if (err) {
                        this.logger.error(`[${this.currentDateIST}] Error Response ${err}`)
                        reject(err); 
                    }
                    
                    stmt.streamRows()
                    .on('error', (err) => {
                        this.logger.error(`[${this.currentDateIST}] Consumation Failed ${err}`)
                        reject(err); 
                    })
                    .on('data', (row) => {
                        allRows.push(row);
                    })
                    .on('end', () => {
                        resolve(allRows);
                    });
                }
            });
        });
    }
}
