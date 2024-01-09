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
    // {
    // password: process.env.REDIS_PASSWORD,
    // socket: {
    //     host: process.env.REDIS_HOST,
    //     port: +process.env.REDIS_PORT
    //   }
    // }
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
      // this.logger.log(`[${this.currentDateIST}] Redis connection initialized on port ${process.env.REDIS_PORT}`);
      this.logger.log(`[${this.currentDateIST}] Redis connection initialized on port 6379`);
    });
    
    this.client.on('error', (err) => {
        // this.logger.error(`[${this.currentDateIST}] Redis connection failed on port ${process.env.REDIS_PORT} ${JSON.stringify({error:err})}`);
        this.logger.error(`[${this.currentDateIST}] Redis connection failed on port 6379 ${JSON.stringify({error:err})}`);
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
      this.logger.log(`[${this.currentDateIST}] Fetch request to Redis [cache-manager invoked] ${JSON.stringify({redisKey:key})}`);
      const value = await this.client.get(key);
      return value;
    } catch (error) {
        console.error('Error fetching value from Redis:', error);
        return null;
    }
}
}