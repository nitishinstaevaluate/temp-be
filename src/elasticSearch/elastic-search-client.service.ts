import { Injectable } from '@nestjs/common';
import { transports, format } from 'winston';
import { utilities as nestWinstonModuleUtilities, WinstonModule,  } from 'nest-winston';
import { Client } from '@elastic/elasticsearch';
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
export class ElasticSearchService {
    private connection: any;

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

    constructor() {
        this.logger.log(`[${this.currentDateIST}] { "message" : "Please wait, initializing elastic search connection" }`);
        this.establishElasticeSearchConnection();
    }

    async establishElasticeSearchConnection(): Promise<void> {
        this.connection = new Client({
            node: process.env.ELASTIC_SEARCH_INSTANCE,
            auth: {
                apiKey: process.env.ELASTIC_SEARCH_API_KEY
            }
        });

        const resp = await this.connection.info();

        if(!resp.cluster_name)
            return this.logger.error(`[${this.currentDateIST}] Error Response while elastic connectivity ${JSON.stringify({ error: resp })}`);
        return this.logger.log(`[${this.currentDateIST}] { "message" : "Elastic search connection initialized successfully" }`);
    }

    async search(index: string, query: any): Promise<any> {
        try {
          this.logger.log(`[${this.currentDateIST}] Elastic Search query { "query" : ${JSON.stringify({index,body: query})} }`);
          const { hits, aggregations } = await this.connection.search({
            index,
            body: query,
          });
          const data = hits.hits.map((hit) =>  hit._source);
          return {data, total:hits.total.value, aggregations}
        } catch (error) {
          this.logger.error(`[${this.currentDateIST}] Elastic search error response  ${JSON.stringify({ error: error.message })}`)
        }
      }

      async searchAll(index: string): Promise<any> {
        try {
          const { hits } = await this.connection.search({
            index,
            body: {
              query: {
                match_all: {},
              },
            },
          });
    
          return hits.hits.map((hit) => hit._source)
        } catch (error) {
          this.logger.error(`[${this.currentDateIST}] Elastic search method Search All error response  ${JSON.stringify({ error: error.message })}`)
          throw new Error('Failed to perform search.');
        }
      }

      async countTotal(index: string){
        try{
          const data = await this.connection.count({ index: index});
          return data;
        }
        catch(error){
          this.logger.error(`[${this.currentDateIST}] Elastic search method Count error response  ${JSON.stringify({ error: error.message })}`)
        }
      }
}
