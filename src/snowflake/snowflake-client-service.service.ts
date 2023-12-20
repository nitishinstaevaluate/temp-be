import { Injectable } from '@nestjs/common';
import * as snowflake from 'snowflake-sdk';
import { transports, format } from 'winston';
import { utilities as nestWinstonModuleUtilities, WinstonModule,  } from 'nest-winston';
const path = require('path');
const fs = require('fs');

const logDir = './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const combinedLog = path.join(logDir, 'combined.log');
const errorLog = path.join(logDir, 'error.log');

@Injectable()
export class SnowflakeClientServiceService {
    private connection: any;
    private connected: boolean = false;

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
        this.logger.log(`[${this.currentDateIST}] { "message" : "Please wait, initializing snowflake connection" }`);
        await this.connectToSnowflake();
    }

    // async connectToSnowflake() {
    //     this.connection = snowflake.createConnection({
    //       account: 'your_account',
    //       username: 'your_username',
    //       password: 'your_password',
    //       database: 'your_database',
    //       warehouse: 'your_warehouse',
    //     });
    //     const currentDateIST = new Date().toLocaleString('en-US', {
    //         timeZone: 'Asia/Kolkata',
    //       });
    //     this.connection.connect((err, conn) => {
    //       if (err) {
    //         console.log(err,"snowflake error--->")
    //         // this.logger.error(`[${currentDateIST}] Error Response ${conn.config.method.toUpperCase()} ${conn.config.url} ${conn.status} ${JSON.stringify({ error: conn.config.data })}`);

    //       } else {
    //         this.connected = true; // Set connection status to true on successful connection
    //         console.log('Connected to Snowflake!');
    //         this.logger.log(`[${currentDateIST}] Response ${conn.config.method.toUpperCase()} ${conn.config.url} ${conn.status} ${conn.config.data}`);
    //       }
    //     });
    //   }

    async connectToSnowflake(): Promise<void> {
    // return new Promise((resolve, reject) => {
        this.connection = snowflake.createConnection({
            account: 'your_account',
            username: 'your_username',
            password: 'your_password',
            database: 'your_database',
            warehouse: 'your_warehouse',
            streamResult: true
        });
        
        // this.connection.configure({
        //    jsonColumnVariantParser: rawColumnValue => eval("(" + rawColumnValue + ")")
        // }); 

        this.connection.connect((err, conn) => {
            if (err) {
                this.logger.error(`[${this.currentDateIST}] Error Response ${err.response.config?.method?.toUpperCase()} ${err.response.config?.url} ${err.response.status} ${JSON.stringify({ error: err.response.config?.data })}`);
    
            } else {
                this.connected = true;
                console.log('Connected to Snowflake!');
                this.logger.log(`[${this.currentDateIST}] Response ${conn.response.config.method.toUpperCase()} ${conn.response?.config?.url} ${conn.response?.status} ${conn.response?.config?.data}`);
            }
        });
    // });
    }
    
    isConnectionActive(): boolean {
    // return this.connection && this.connected;
    return this.connection.isValidAsync();
    }

    executeSnowflakeQuery(sqlQuery: string): Promise<any> {
        return new Promise((resolve, reject) => {
        this.connection.execute({
            sqlText: sqlQuery,
            streamResult:true,
            complete: (err, stmt, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
            },
        });
        });
    }
}
