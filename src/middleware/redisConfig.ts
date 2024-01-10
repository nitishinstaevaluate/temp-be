import { Injectable } from '@nestjs/common';
import { utilities as nestWinstonModuleUtilities, WinstonModule,  } from 'nest-winston';
import {createClient} from 'redis';
import { transports, format } from 'winston';
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const logDir = './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const combinedLog = path.join(logDir, 'combined.log');
const errorLog = path.join(logDir, 'error.log');

@Injectable()
export class RedisService {
  private readonly client:any = createClient( //redis cloud auth
    {
      url: process.env.REDISCONN
    }
  );
  private readonly DEFAULT_EXPIRATION_TIME = 60 * 60 * 24;
  private readonly logger = WinstonModule.createLogger({
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

  private readonly currentDateIST = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
  });

  constructor() {
    this.initializeRedisConnection()
  }

  async initializeRedisConnection(){
    this.client.on('connect', () => {
      console.log('connected to redis cloud')
    });
    
    this.client.on('error', (err) => {
        console.log('Redis Connection Error')
    });
    
    await this.client.connect();
  }

  async setKeyValue(key: string, value: string): Promise<any> {
    try {
      let reply;
      this.client.set(key, value, 'EX', this.DEFAULT_EXPIRATION_TIME, (err, response) => {
        if (err) {
          console.error('Redis Error:', err);
          return false
        } else {
          reply = response
        }
      });
      return reply;
    } catch (error) {
      console.error('Error setting value in Redis:', error);
      throw error;
    }
  }
  
  async getValueByKey(key: string): Promise<any> {
    try {
      const value = await this.client.get(key);
      return value;
    } catch (error) {
        console.error('Error fetching value from Redis:', error);
        return null;
    }
  }
}