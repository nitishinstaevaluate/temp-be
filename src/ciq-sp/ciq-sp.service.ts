import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToClass } from 'class-transformer';
import { Model } from 'mongoose';
import { CiqindustryhierarchyDto, CiqIndustryListDto } from './dto/ciq-sp.dto';
import { SnowflakeClientServiceService } from 'src/snowflake/snowflake-client-service.service';
import { ciqindustryhierarchyDocument, ciqsimpleindustryDocument } from './schema/ciq-sp.chema';

@Injectable()
export class CiqSpService {
    constructor( @InjectModel('ciqsimpleindustry') 
    private readonly ciqsimpleindustrymodel : Model<ciqsimpleindustryDocument>,
    @InjectModel('ciqindustryhierarchy')
    private readonly ciqindustryhierarchymodel: Model<ciqindustryhierarchyDocument>,
    private readonly snowflakeClientService: SnowflakeClientServiceService){}

    async fetchSPHierarchyBasedIndustry(){
        try{
          // await this.snowflakeClientService.executeSnowflakeQuery('USE WAREHOUSE IFINLITE');
          // return await this.snowflakeClientService.executeSnowflakeQuery('SELECT * FROM ciqsimpleindustry');  // execute these queries if data is not present in db
          const industryData = plainToClass(CiqindustryhierarchyDto, await this.ciqindustryhierarchymodel.find({childLevel:3}).sort({GICSDescriptor:1}).exec(),{ excludeExtraneousValues: true});

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
    
      async fetchAllSPIndustry(){
        try{
          await this.snowflakeClientService.executeSnowflakeQuery('USE WAREHOUSE IFINLITE');
          const ciqIndustryBasedCompany = await this.snowflakeClientService.executeSnowflakeQuery(
            `SELECT a.companyid, a.companyname, b.* 
             FROM ciqCompany a 
             JOIN ciqsimpleindustry b ON a.simpleindustryid = b.simpleindustryid 
             where b.simpleindustrydescription like '%Commercial Services and Supplies%' 
             LIMIT 20`
             );

          const modifiedData = plainToClass(CiqIndustryListDto, ciqIndustryBasedCompany, {excludeExtraneousValues : true});

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

      async fetchSPIndustryListByName(industryName:string,location:string){
        try{
          const decodeIndustry = industryName.replace(/%20/g, ' ');
          const decodeLocation = location.replace(/%20/g, ' ');

          const simpleIndustryDetails= await this.ciqsimpleindustrymodel.findOne({simpleindustrydescription:decodeIndustry}).select('simpleindustryid').exec();
          
          await this.snowflakeClientService.executeSnowflakeQuery('USE WAREHOUSE IFINLITE');
          const ciqIndustryBasedCompany = await this.snowflakeClientService.executeSnowflakeQuery(
           `SELECT company.companyid, company.companyname, industry.*
            FROM ciqCompany AS company
            JOIN ciqCountryGeo AS geo ON geo.countryId = company.countryId
            JOIN ciqsimpleindustry AS industry ON company.simpleindustryid = industry.simpleindustryid 
            WHERE 1=1
            AND geo.country = '${decodeLocation}'
            AND company.simpleindustryid = ${simpleIndustryDetails.simpleindustryid}
            LIMIT 20;`
          );
 
          const modifiedData = plainToClass(CiqIndustryListDto, ciqIndustryBasedCompany, {excludeExtraneousValues : true});

          return {
            data:modifiedData,
            status:true,
            msg:'SP industry fetch success',
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