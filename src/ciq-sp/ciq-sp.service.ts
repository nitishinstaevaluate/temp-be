import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToClass } from 'class-transformer';
import { Model } from 'mongoose';
import { CiqindustryhierarchyDto, CiqIndustryListDto } from './dto/ciq-sp.dto';
import { SnowflakeClientServiceService } from 'src/snowflake/snowflake-client-service.service';
import { ciqcompanystatustypeDocument, ciqcompanytypeDocument, ciqindustryhierarchyDocument, ciqsimpleindustryDocument } from './schema/ciq-sp.chema';

@Injectable()
export class CiqSpService {
    constructor( @InjectModel('ciqsimpleindustry') 
    private readonly ciqsimpleindustrymodel : Model<ciqsimpleindustryDocument>,
    @InjectModel('ciqindustryhierarchy')
    private readonly ciqindustryhierarchymodel: Model<ciqindustryhierarchyDocument>,
    @InjectModel('ciqcompanystatustype') 
    private readonly ciqcompanystatustypemodel: Model<ciqcompanystatustypeDocument>,
    @InjectModel('ciqcompanytype') 
    private readonly ciqcompanytypemodel: Model<ciqcompanytypeDocument>,
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

      async fetchSPIndustryListByName(industryName:string,location:string){ // redundant function (not in use)
        try{
          const decodeIndustry = industryName.replace(/%20/g, ' ');
          const decodeLocation = location.replace(/%20/g, ' ');

          const simpleIndustryDetails= await this.ciqsimpleindustrymodel.findOne({simpleindustrydescription:decodeIndustry}).select('simpleindustryid').exec();
          
          await this.snowflakeClientService.executeSnowflakeQuery('USE WAREHOUSE IFINLITE');
          const ciqIndustryBasedCompany = await this.snowflakeClientService.executeSnowflakeQuery(
           `SELECT company.companyid, company.companyname, industry.*, company.city
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

      async fetchSPLevelFourIndustryBasedList(descriptor:string){
        try{
          const industryData = plainToClass(CiqindustryhierarchyDto, await this.ciqindustryhierarchymodel.findOne({GICSDescriptor:descriptor,childLevel:3}).select('subTypeId').exec(),{ excludeExtraneousValues: true});

          const levelFourIndustyList = plainToClass(CiqindustryhierarchyDto, await this.ciqindustryhierarchymodel.find({subParentId:industryData.subTypeId,childLevel:4}).sort({GICSDescriptor:1}).exec(), { excludeExtraneousValues : true});

          return {
            data:levelFourIndustyList,
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

      async fetchSPIndustryListByLevelFourIndustries(data){
        try{
          let industryId = [];
          let companyType = [];
          let companyStatusType = [];
          let decodeLocation, decodeIndustry, businessDescriptor;

          //#region fetch by company status types
          if(data?.companyStatusType){
            for await (const companyStatusTypes of data.companyStatusType){
              if(companyStatusTypes){
                const id = await this.ciqcompanystatustypemodel.findOne({companystatustypename:companyStatusTypes}).exec();
                if(!id)  
                  return {
                    msg:"Company Status type not exist",
                    status:false
                  }
                  companyStatusType.push(id.companystatustypeid);
              }
            }
          }
          //#endregion

          //#region fetch by company type
          if(data?.companyType){
            for await (const companyTypes of data.companyType){
              if(companyTypes){
                const id = await this.ciqcompanytypemodel.findOne({companytypename:companyTypes}).exec();
                if(!id)  
                  return {
                    msg:"Company type not exist",
                    status:false
                  }
                  companyType.push(id.companytypeid);
              }
            }
          }
          //#endregion

          //#region fetch by Industries List [Level - 4]
          if(data?.levelFourIndustries){
            for await (const levelFourIndustry of data.levelFourIndustries){
              if(levelFourIndustry){
                const id = await this.ciqindustryhierarchymodel.findOne({GICSDescriptor:levelFourIndustry}).exec();
                if(!id)  
                  return {
                    msg:"level four industry does not exist",
                    status:false
                  }
                industryId.push(id.subTypeId);
              }
            }
          }
          //#endregion

          // #region fetch by industry [Levek - 3 Industries]
          if(data.industryName){
            decodeIndustry= await this.ciqsimpleindustrymodel.findOne({simpleindustrydescription:data.industryName}).select('simpleindustryid').exec();
          }
          //#endregion

          // #region fetch by location
          if(data?.location){
            decodeLocation = data.location;
          }
          //#endregion

          //#region fetch by business descriptor
          if(data?.businessDescriptor){
            businessDescriptor = data.businessDescriptor;
          }
          //#endregion

          await this.snowflakeClientService.executeSnowflakeQuery('USE WAREHOUSE IFINLITE');
          const ciqIndustryBasedCompany = await this.snowflakeClientService.executeSnowflakeQuery(
           `SELECT DISTINCT cmpny.*, cmpnyIndstry.*, industry.*
            FROM ciqCompany AS cmpny
            JOIN ciqCountryGeo AS geo ON geo.countryId = cmpny.countryId
            JOIN ciqCompanyIndustry cmpnyIndstry ON cmpnyIndstry.companyId = cmpny.companyId
            JOIN ciqsimpleindustry AS industry ON cmpny.simpleindustryid = industry.simpleindustryid
            JOIN ciqsegmentdescription AS cmpnyDesc ON cmpnyDesc.companyId = cmpny.companyId 
            WHERE 1=1
            ${decodeLocation ? `AND geo.country = '${decodeLocation}'` : ''}
            ${companyStatusType.length ? `AND cmpny.companystatustypeid IN (${companyStatusType})` : ''}
            ${companyType.length ? `AND cmpny.companytypeid IN (${companyType})` : ''}
            ${industryId.length ? `AND cmpnyIndstry.industryid IN (${industryId})` : ''}
            ${decodeIndustry ? `AND cmpny.simpleindustryid = ${decodeIndustry.simpleindustryid}` : ''}
            ${businessDescriptor ? `AND cmpnyDesc.segmentdescription  LIKE '%${businessDescriptor}%'` : ''}
            AND cmpnyDesc.segmentdescription IS NOT NULL
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

      async fetchSPCompanyStatusType(){
        try{
          const companyStatusTypeData = await this.ciqcompanystatustypemodel.find().exec();
          return {
            data:companyStatusTypeData,
            status:true,
            msg:"company status type fetched successfully"
          }
        }
        catch(error){
          return {
            error:error,
            status:false,
            msg:"company status type fetch failed"
          }
        }
      }

      async fetchSPCompanyType(){
        try{
          const companyTypeData = await this.ciqcompanytypemodel.find().exec();
          return {
            data:companyTypeData,
            status:true,
            msg:"company type fetched successfully"
          }
        }
        catch(error){
          return {
            error:error,
            status:false,
            msg:"company status type fetch failed"
          }
        }
      }
}