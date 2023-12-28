import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToClass } from 'class-transformer';
import { Model } from 'mongoose';
import { CiqindustryhierarchyDto, CiqIndustryBasedCompanyDto } from './dto/ciq-sp.dto';
import { SnowflakeClientServiceService } from 'src/snowflake/snowflake-client-service.service';
import { ciqindustryhierarchyDocument, ciqsimpleindustryDocument } from './schema/ciq-sp.chema';

@Injectable()
export class CiqSpService {
    constructor( @InjectModel('ciqsimpleindustry') 
    private readonly ciqsimpleindustrymodel : Model<ciqsimpleindustryDocument>,
    @InjectModel('ciqindustryhierarchy')
    private readonly ciqindustryhierarchymodel: Model<ciqindustryhierarchyDocument>,
    private readonly snowflakeClientService: SnowflakeClientServiceService){}

    async fetchSPIndustryList(){
        try{
          // await this.snowflakeClientService.executeSnowflakeQuery('USE WAREHOUSE IFINLITE');
          // return await this.snowflakeClientService.executeSnowflakeQuery('SELECT * FROM ciqsimpleindustry');  // execute these queries if data is not present in db
          const industryData = plainToClass(CiqindustryhierarchyDto, await this.ciqindustryhierarchymodel.find({childLevel:4}).sort({GICSDescriptor:1}).exec(),{ excludeExtraneousValues: true});

          return {
            data:industryData,
            status:true,
            msg:'Ciqsimpleindustry fetch success'
          }
        }
        catch(err){
          return {
            error:err,
            status:false,
            msg:'Ciqsimpleindustry fetch failed'
          }
        }
      }
    
      async fetchSPCompanyBasedIndustry(){
        try{
          await this.snowflakeClientService.executeSnowflakeQuery('USE WAREHOUSE IFINLITE');
          const ciqIndustryBasedCompany = await this.snowflakeClientService.executeSnowflakeQuery(`SELECT a.companyid, a.companyname, b.* FROM ciqCompany a JOIN ciqsimpleindustry b ON a.simpleindustryid = b.simpleindustryid where b.simpleindustrydescription like '%Commercial Services and Supplies%' LIMIT 20`);

          const modifiedData = plainToClass(CiqIndustryBasedCompanyDto, ciqIndustryBasedCompany, {excludeExtraneousValues : true});

          return {
            data:modifiedData,
            status:true,
            msg:'Company based industry fetch success',
          }
        }
        catch(error){
          return {
            error:error,
            msg:'Company based industry fetch failed',
            status:false
        }
        }
      }
}