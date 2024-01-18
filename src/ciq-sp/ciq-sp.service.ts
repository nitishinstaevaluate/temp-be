import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToClass } from 'class-transformer';
import { Model } from 'mongoose';
import { CiqindustryhierarchyDto, CiqIndustryListDto, CiqSegmentDescriptionDto } from './dto/ciq-sp.dto';
import { SnowflakeClientServiceService } from 'src/snowflake/snowflake-client-service.service';
import { ciqcompanystatustypeDocument, ciqcompanytypeDocument, ciqindustryhierarchyDocument, ciqsimpleindustryDocument } from './schema/ciq-sp.chema';
import { RedisService } from 'src/middleware/redisConfig';
import { ProcessStatusManagerService } from 'src/processStatusManager/process-status-manager.service';
import { axiosInstance } from 'src/middleware/axiosConfig';
import { CAPITALIQ_MARKET } from 'src/interfaces/api-endpoints.prod';
import { convertToNumberOrOne, convertToNumberOrZero } from 'src/excelFileServices/common.methods';
import { BETA_SUB_TYPE, BETA_TYPE, MNEMONICS_ARRAY, MNEMONICS_ARRAY_2, MNEMONIC_ENUMS, RATIO_TYPE } from 'src/constants/constants';
require('dotenv').config();

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
    private readonly snowflakeClientService: SnowflakeClientServiceService,
    private readonly redisService: RedisService,
    private processStateManagerService:ProcessStatusManagerService
    ){}

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
          await this.snowflakeClientService.executeSnowflakeQuery(`USE WAREHOUSE ${process.env.SNOWFLAKE_WAREHOUSE};`);
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
          
          await this.snowflakeClientService.executeSnowflakeQuery(`USE WAREHOUSE ${process.env.SNOWFLAKE_WAREHOUSE};`);
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
          let decodeLocation, decodeIndustry, businessDescriptor, industryValueFromDb;
          let modifiedData;

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

          //#region fetch by industry [Level - 3 Industries]
          if(data.industryName){
            decodeIndustry= await this.ciqsimpleindustrymodel.findOne({simpleindustrydescription:data.industryName}).select('simpleindustryid').exec();
          }
          //#endregion

          //#region fetch by location
          if(data?.location){
            decodeLocation = data.location;
          }
          //#endregion

          //#region fetch by business descriptor
          if(data?.businessDescriptor){
            businessDescriptor = data.businessDescriptor;
          }
          //#endregion

          const redisCacheExist = await this.redisService.getValueByKey('businessdescriptor');
          const businessDescriptionArray = redisCacheExist ?  JSON.parse(redisCacheExist) : []; 

          let filteredDescriptorDetails = [];
          if(redisCacheExist && businessDescriptionArray?.length ){

            if(businessDescriptor){
              for await(const descriptors of businessDescriptionArray ){
                if(descriptors.SEGMENTDESCRIPTION.toLowerCase().includes(businessDescriptor.toLowerCase().trim()))
                {
                  filteredDescriptorDetails.push(descriptors.COMPANYID)
                }
              }
            }
            else{
              filteredDescriptorDetails = []
            }
            const payload = {
              decodeIndustry,
              companyStatusType,
              companyType,
              industryName:data.industryName,
              industryId,
              decodeLocation,
              companyIdArray:filteredDescriptorDetails
            }
            const modifiedData:any = await this.fetchAggregateIndustryList(payload);
            return {
              data:modifiedData.data,
              status:true,
              msg:'SP industry fetch success',
              total:modifiedData.data.length
            }
          }

          await this.saveBusinessDescription();

          const payload = {
            decodeIndustry,
            companyStatusType,
            companyType,
            industryName:data.industryName,
            industryId,
            decodeLocation,
            companyIdArray:[]
          }
           modifiedData = await this.fetchAggregateIndustryList(payload);
              
          return {
            data:modifiedData.data,
            status:true,
            msg:'SP industry list fetch success',
            total:modifiedData.data.length
          }
        }
        catch(error){
          return {
            error:error,
            msg:'SP industry list fetch failed',
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

    async saveBusinessDescription(){
      try{
        // let descriptionQuery;
        await this.snowflakeClientService.executeSnowflakeQuery(`USE WAREHOUSE ${process.env.SNOWFLAKE_WAREHOUSE};`);

        const isAdminConnectionActive = await this.snowflakeClientService.isLocalConnectionActive();
        if(isAdminConnectionActive){
          await this.executeDefaultAdminRights();
        }
        let descriptionQuery = await this.snowflakeClientService.executeSnowflakeQuery(
          `SELECT 
          company.companyid, 
          description.segmentdescription 
         FROM 
          ${isAdminConnectionActive ? 'ciqsegmentdescriptionind' : 'ciqsegmentdescription'} AS description
         JOIN 
          ${isAdminConnectionActive ? 'ciqcompanyind' : 'ciqcompany'} AS company 
         ON 
          description.companyId = company.companyid
         JOIN 
          ciqCountryGeo AS geo 
         ON 
          geo.countryId = company.countryId
         WHERE 
          description.segmentdescription IS NOT NULL 
         AND 
          geo.country = 'India'` // default location as India
        )
  
        const businessDescriptorDetails = await plainToClass(CiqSegmentDescriptionDto, descriptionQuery, {excludeExtraneousValues:true});

        this.redisService.setKeyValue('businessdescriptor',JSON.stringify(businessDescriptorDetails))

        return {
          data:businessDescriptorDetails,
          status:true,
          msg:"Business descriptor stored successfully"
        }
      }
      catch(error){
        return {
          msg:"Segment description store failed",
          status:false,
          error:error
        }
      }
    }

    async fetchAggregateIndustryList(payload){
      try{
        await this.snowflakeClientService.executeSnowflakeQuery(`USE WAREHOUSE ${process.env.SNOWFLAKE_WAREHOUSE};`);
        const isAdminConnectionActive = await this.snowflakeClientService.isLocalConnectionActive();

        if(isAdminConnectionActive){
          await this.executeDefaultAdminRights();
        }
          const locationCondition = payload.decodeLocation ? `AND geo.country = '${payload.decodeLocation}'` : '';
          const companyStatusTypeCondition = payload.companyStatusType.length ? `AND cmpny.companystatustypeid IN (${payload.companyStatusType})` : '';
          const companyTypeCondition = payload.companyType.length ? `AND cmpny.companytypeid IN (${payload.companyType})` : '';
          const industryIdCondition = payload.industryId.length ? `AND cmpnyIndstry.industryid IN (${payload.industryId})` : '';
          const decodeIndustryCondition = payload.decodeIndustry ? `AND cmpny.simpleindustryid = ${payload.decodeIndustry.simpleindustryid}` : '';

          const formattedQuery = `
            ${locationCondition}
            ${companyStatusTypeCondition}
            ${companyTypeCondition}
            ${industryIdCondition}
            ${decodeIndustryCondition}
          `;

          const companyIdArrayCondition = payload?.companyIdArray?.length
            ? `AND 
            cmpny.companyid IN 
                (
                  SELECT 
                    company.companyId 
                    FROM 
                    ${isAdminConnectionActive ? 'ciqcompanyind' : 'ciqcompany'} AS company 
                    JOIN 
                    ${isAdminConnectionActive ? 'ciqsegmentdescriptionind' : 'ciqsegmentdescription'} AS businessDesc ON businessDesc.companyId = company.companyid 
                    WHERE 
                    company.companyid IN (${payload?.companyIdArray.join(',')}) 
                      AND businessDesc.segmentdescription IS NOT NULL
                )`
            : '';

          let ciqIndustryBasedCompany = await this.snowflakeClientService.executeSnowflakeQuery(
            `SELECT 
              cmpny.*, 
              cmpnyIndstry.*, 
              industry.*
            FROM
              ${isAdminConnectionActive ? 'ciqcompanyind' : 'ciqcompany'} AS cmpny
            JOIN
              ciqCountryGeo AS geo ON geo.countryId = cmpny.countryId
            JOIN
              ${isAdminConnectionActive ? 'ciqCompanyIndustryInd' : 'ciqCompanyIndustry'} AS cmpnyIndstry ON cmpnyIndstry.companyId = cmpny.companyId
            JOIN
              ciqsimpleindustry AS industry ON cmpny.simpleindustryid = industry.simpleindustryid
            WHERE 1=1
              ${formattedQuery}
              ${companyIdArrayCondition}
              ${!payload.industryName ? `LIMIT 20` : ''};`
            );

          const modifiedData = plainToClass(CiqIndustryListDto, ciqIndustryBasedCompany, {excludeExtraneousValues : true});
          
        return {
          data:modifiedData,
          msg:"Industry list fetch success",
          status:true
        }
      }
      catch(error){
        return {
          error:error,
          msg:"Industry list fetch failed",
          status:false
        }
      }
    }

    async executeDefaultAdminRights(){
      try{
        await this.snowflakeClientService.executeSnowflakeQuery(`USE ROLE ${process.env.SNOWFLAKE_ROLE};`);
        await this.snowflakeClientService.executeSnowflakeQuery(`USE DATABASE ${process.env.SNOWFLAKE__LOCAL_DATABASE};`);
      }
      catch(error){
        return error
      }
    }

    //#region beta calculation starts
    async calculateBetaAggregate(data:any){
      try{

        if(!data.industryAggregateList || !data.taxRate || !data.betaType || !data.betaSubType)
          throw new NotFoundException({
            message: 'Incorrect input for beta calculation',
            status: false,
          })

        const taxRate = parseFloat(data.taxRate?.replace("%", ""))/100 ?? parseFloat(data.taxRate)/100;
        const betaType = data.betaType;
        const betaSubType = data.betaSubType;
        
        const headers = {
          'Content-Type': 'application/json'
        }

        const auth = {
          username: process.env.CAPITALIQ_API_USERNAME,
          password: process.env.CAPITALIQ_API_PASSWORD
        }

        const createPayloadStructure = await this.createPayloadStructure(data.industryAggregateList)
        const axiosBetaResponse = await axiosInstance.post(CAPITALIQ_MARKET, createPayloadStructure, {headers, auth});
        const betaData = await this.calculateCapitalIqBeta(axiosBetaResponse, taxRate, betaSubType, betaType);

        return {
          data:axiosBetaResponse.data,
          msg:"beta calculation success",
          status:true,
          total:betaData.beta,
          deRatio:betaData.deRatio,
          betaSubType:data.betaSubType
        }
      }
      catch(error){
        return {
          error:error,
          msg:"beta calculation failed",
          status:false
        }
      }
    }

    async createPayloadStructure(data){
      const payloadStruc = [
        ...await this.calculateDebtInCurrentLiabilites(data), 
        ...await this.calculateLongTermDebt(data), 
        ...await this.calculateTotalBookValueOfPreferred(data), 
        ...await this.calculatePricePerShare(data), 
        ...await this.calculateFullyDilutedWeightedAverage(data), 
        ...await this.calculateBetaValue(data)
      ];
      return {inputRequests:payloadStruc};
    }

    async calculateDebtInCurrentLiabilites(data:any){
      const iqCurrentPortDetails = await this.iqCreateStructure(data,MNEMONIC_ENUMS.IQ_CURRENT_PORT);
      const iqStDebtDetails = await this.iqCreateStructure(data,MNEMONIC_ENUMS.IQ_ST_DEBT);
      const iqFinDivDebtCurrentDetails = await this.iqCreateStructure(data, MNEMONIC_ENUMS.IQ_FIN_DIV_DEBT_CURRENT);
      const iqCurrentPortionLeaseLiabilitiesDetails = await this.iqCreateStructure(data, MNEMONIC_ENUMS.IQ_CURRENT_PORTION_LEASE_LIABILITIES);
      return [...iqCurrentPortDetails.data, ...iqStDebtDetails.data, ...iqFinDivDebtCurrentDetails.data, ...iqCurrentPortionLeaseLiabilitiesDetails.data]
    }

    async calculateLongTermDebt(data:any){
      const iqLtDebtDetails = await this.iqCreateStructure(data, MNEMONIC_ENUMS.IQ_LT_DEBT);
      const iqCapitalLeaseDetails = await this.iqCreateStructure(data, MNEMONIC_ENUMS.IQ_CAPITAL_LEASES);
      const iqFinDivDebtLtDetails = await this.iqCreateStructure(data, MNEMONIC_ENUMS.IQ_FIN_DIV_DEBT_LT);
      const iqLtPortionLeaseLiabilitiesDetails = await this.iqCreateStructure(data, MNEMONIC_ENUMS.IQ_LT_PORTION_LEASE_LIABILITIES);
      return [...iqLtDebtDetails.data, ...iqCapitalLeaseDetails.data, ...iqFinDivDebtLtDetails.data, ...iqLtPortionLeaseLiabilitiesDetails.data]
    }

    async calculateTotalBookValueOfPreferred(data:any){
      const iqPrefEquityDetails = await this.iqCreateStructure(data, MNEMONIC_ENUMS.IQ_PREF_EQUITY);
      return iqPrefEquityDetails.data;
    }

    async calculateFullyDilutedWeightedAverage(data:any){
      const iqDilutedWeightageDetails = await this.iqCreateStructure(data, MNEMONIC_ENUMS.IQ_DILUT_WEIGHT);
      return iqDilutedWeightageDetails.data;
    }

    async calculatePricePerShare(data:any){
      const iqLastSalePriceDetails =  await this.iqCreateStructure(data,MNEMONIC_ENUMS.IQ_LASTSALEPRICE);
      return iqLastSalePriceDetails.data;
    }

    async calculateBetaValue(data:any){
      const iqBetaDetails =  await this.iqCreateStructure(data,MNEMONIC_ENUMS.IQ_CUSTOM_BETA);
      return iqBetaDetails.data;
    }

    async calculateCapitalIqBeta(axiosBetaResponse, taxRate, betSubType, betaType) {
      try {
        if (!axiosBetaResponse.data) {
          throw new NotFoundException({
            message: 'Axios beta list not found',
            status: false,
          });
        }

        const result = {};
        let maxLength = 0
        for await (const betaDetails of axiosBetaResponse.data.GDSSDKResponse) {
          if (!betaDetails.ErrMsg) {
            for await (const mnemonic of MNEMONICS_ARRAY) {
              if (betaDetails.Headers.includes(mnemonic)) {
                result[mnemonic] = result[mnemonic] || [];
                result[mnemonic].push(...await this.extractValues(betaDetails, mnemonic));

                const currentLength = result[mnemonic].length;
                if (currentLength > maxLength) {
                  maxLength = currentLength;
                }
              }
            }
          }
          else{
            result[betaDetails.Mnemonic] = [];
          }
        }
        
        const getDebtToCapitalAndMarketValue = await  this.calculateDebtToCapitalAndMarketValue(result, maxLength);
        
        const calculateAdjstdBetaByMarshallBlume = await this.calculateAdjustedBeta(result,maxLength);

        let calculateTotalAdjustedBeta, calculateTotalDebtToCapital, calculateTotalEquityToCapital;

        calculateTotalAdjustedBeta =  await this.calculateBetaMetric(calculateAdjstdBetaByMarshallBlume, betSubType, maxLength);
        calculateTotalDebtToCapital = await this.calculateBetaMetric(getDebtToCapitalAndMarketValue.calculateTotalDebtToCapital, betSubType, maxLength);
        calculateTotalEquityToCapital = await this.calculateBetaMetric(getDebtToCapitalAndMarketValue.calculateTotalEquityToCapital,  betSubType, maxLength);

        const deRatio = calculateTotalDebtToCapital/calculateTotalEquityToCapital ?? 1;

        if(betaType === BETA_TYPE[0]){
          const unleveredBeta = await this.calculateUnleveredBeta(calculateTotalAdjustedBeta, calculateTotalDebtToCapital, calculateTotalEquityToCapital, taxRate, maxLength);
          return {beta: await this.calculateReleveredBeta(unleveredBeta, calculateTotalDebtToCapital, calculateTotalEquityToCapital, taxRate, maxLength), deRatio};
        }
        else{
          return {beta: await this.calculateUnleveredBeta(calculateTotalAdjustedBeta, calculateTotalDebtToCapital, calculateTotalEquityToCapital, taxRate, maxLength), deRatio};
        }
        
      } 
      catch (error) {
        console.error(error);
        return {
          error: error,
          msg: "Error while fetching data from axios",
          status: false,
        };
      }
    }

    async calculateBetaMetric(data, method, maxLength) {
      try{
        const result = (method === BETA_SUB_TYPE[0])
        ? await this.calculateMean(data, maxLength)
        : await this.calculateMedian(data);
    
        return result;
      }
      catch(error){
        return {
          error:error,
          status:false,
          msg:"beta median/mean calculation failed"
        }
      }
    };

    async calculateAdjustedBeta(result,maxLength){
      try{
        // Adjusted beta with Marshall Blume formula ( Ba = 0.371+0.635*Bh)
        let adjustedBetaArray = [];

        for (let i = 0; i < maxLength; i++){
          adjustedBetaArray.push(
            0.371 + 0.635 * result[MNEMONIC_ENUMS.IQ_CUSTOM_BETA][i]
          )
        }
        return adjustedBetaArray;
      }
      catch(error){
        return {
          error:error,
          status:false,
          msg:"Adjusted beta calculation failed"
        }
      }
    }
    async calculateUnleveredBeta(adjustedBeta, debtToCapital, equityToCapital, taxRate, maxLength){
      try{
        // Be4 = M12/(1+(1-L12)*J12/K12)
        
        let unleveredBeta;
        unleveredBeta =  adjustedBeta / (1 + (1 - taxRate) * debtToCapital/equityToCapital)
        return unleveredBeta;
      }
      catch(error){
        return {
          error:error,
          status:false,
          msg:"Beta unlever calculation for beta failed"
        }
      }
    }

    async calculateReleveredBeta(betaUnleveredArray,debtToCapital, equityToCapital, taxRate, maxLength){
      try{
        // Relevered Equity Beta = Be4 * (1 + (1-Tax Rate) * Debt to Equity)
        
        let releveredBeta;
        releveredBeta =  betaUnleveredArray * (1 + (1 - taxRate) * debtToCapital/equityToCapital)
        return releveredBeta;
      }
      catch(error){
        return {
          error:error,
          msg:"Beta relever calculation for beta failed"
        }
      }
    }

    async calculateDebtToCapitalAndMarketValue(result ,maxLength){
      try{
        let calculateTotalDebtInCurrentLiabilities = [], calculateTotalLongTermDebt = [], calculateTotalBookValue = [], 
          calculateTotalMarketValueOfEquity = [], calculateTotalMarketValueOfCapital = [], calculateTotalDebtToCapital = [], calculateTotalEquityToCapital = [];

        for (let i = 0; i < maxLength; i++){

          // calculate debt in current liabilities
          calculateTotalDebtInCurrentLiabilities.push(
            convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_CURRENT_PORT][i]) + 
            convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_ST_DEBT][i]) + 
            convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_FIN_DIV_DEBT_CURRENT][i]) - 
            convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_CURRENT_PORTION_LEASE_LIABILITIES][i])
          ) 

          // calculate long term debt
          calculateTotalLongTermDebt.push(
            convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_LT_DEBT][i]) +
            convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_CAPITAL_LEASES][i]) +
            convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_FIN_DIV_DEBT_LT][i]) -
            convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_LT_PORTION_LEASE_LIABILITIES][i])
          )

          // calculate total book value of debt
          calculateTotalBookValue.push(
            convertToNumberOrZero(calculateTotalDebtInCurrentLiabilities[i]) + 
            convertToNumberOrZero(calculateTotalLongTermDebt[i])
          )

          // calculate total market value of equity 
          calculateTotalMarketValueOfEquity.push(
            convertToNumberOrOne(result[MNEMONIC_ENUMS.IQ_DILUT_WEIGHT][i]) *
            convertToNumberOrOne(result[MNEMONIC_ENUMS.IQ_LASTSALEPRICE][i])
          )

          // calculate total market value of capital
          calculateTotalMarketValueOfCapital.push(
            calculateTotalBookValue[i] + 
            convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_PREF_EQUITY][i]) + 
            calculateTotalMarketValueOfEquity[i]
          )

          // calculate debt to capital
          calculateTotalDebtToCapital.push(
            (
              (
                calculateTotalBookValue[i] + convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_PREF_EQUITY][i])
              ) / calculateTotalMarketValueOfCapital[i]
            ) * 100
          )

          // calculate equity to capital
          calculateTotalEquityToCapital.push(
            (calculateTotalMarketValueOfEquity[i] / calculateTotalMarketValueOfCapital[i]) * 100
          )
          
        }

        return {
          calculateTotalDebtToCapital,
          calculateTotalEquityToCapital
        }
      }
      catch(error){
        return {
          error:error,
          status:false,
          msg:"calculation failed for debt to capital and market value functions"
        }
      }
    }
    //#endregion beta calculation ends

    async calculateCompaniesMeanMedianRatio(data){
      try{
        if(!data.industryAggregateList)
          throw new NotFoundException({
            message: 'Industry list for Pe Ratio calculation not found',
            status: false,
          })

        const ratioType = data.ratioType;
        const headers = {
          'Content-Type': 'application/json'
        }

        const auth = {
          username: process.env.CAPITALIQ_API_USERNAME,
          password: process.env.CAPITALIQ_API_PASSWORD
        }

        const createPayloadStructure = await this.createRatioWisePayloadStructure(data.industryAggregateList);
        const axiosResponse = await axiosInstance.post(CAPITALIQ_MARKET, createPayloadStructure, {headers, auth});
        const ratioResponse = await this.calculateMeanMedian(axiosResponse,data.industryAggregateList, ratioType);

        return {
          data:ratioResponse,
          msg:"mean and median calculation success",
          status:true,
          ratioType:ratioType
        }
      }
      catch(error){
        return {
          error:error,
          status:false,
          msg:'mean and median calculation failed'
        }
      }
    }

    async createRatioWisePayloadStructure(data){
      try{
        const concatPayload = [
          ...(await this.createPriceToBookValStructure(data)).data, 
          ...(await this.createPriceToSalesValStructure(data)).data, 
          ...(await this.createEbitdaStructure(data)).data, 
          ...(await this.createPriceToEquityStructure(data)).data
        ] 
        return {inputRequests:concatPayload};
      }
      catch(error){
        return {
          error:error,
          status:false,
          msg:"Payload creation failed"
        }
      }
    }

    async calculateMeanMedian(axiosResponse,inputData,type){
      try{
        if (!axiosResponse.data) {
          throw new NotFoundException({
            message: 'Axios response not found',
            status: false,
          });
        }

        const result = {};
        let maxLength = 0
        for await (const details of axiosResponse.data.GDSSDKResponse) {
          if (!details.ErrMsg) {
            for await (const mnemonic of MNEMONICS_ARRAY_2) {
              if (details.Headers.includes(mnemonic)) {
                result[mnemonic] = result[mnemonic] || [];
                result[mnemonic].push(...await this.extractValues(details, mnemonic));

                const currentLength = result[mnemonic].length;
                if (currentLength > maxLength) {
                  maxLength = currentLength;
                }
              }
            }
          }
          else{
            result[details.Mnemonic] = [];
          }
        }
        const serialiseRatio:any =await this.searializeRatioList(result, inputData, maxLength);

        let meanRatio = {}, medianRatio = {};
        const calculatePeRatio:any = await this.calculateRatioMetric(result[MNEMONIC_ENUMS.IQ_PE_NORMALIZED], type, maxLength);
        const calculatePbvRatio:any = await this.calculateRatioMetric(result[MNEMONIC_ENUMS.IQ_PBV], type, maxLength);
        const calculateEbitdaRatio:any = await this.calculateRatioMetric(result[MNEMONIC_ENUMS.IQ_TEV_EBITDA], type, maxLength);
        const calculatePsRatio:any = await this.calculateRatioMetric(result[MNEMONIC_ENUMS.IQ_PRICE_SALES], type, maxLength);
        
        if(type === RATIO_TYPE[0]){
          meanRatio = {
            company: "Average",
            peRatio: calculatePeRatio.mean,
            pbRatio: calculatePbvRatio.mean, 
            ebitda:  calculateEbitdaRatio.mean, 
            sales: calculatePsRatio.mean
          }
          medianRatio = {
            company: "Median",
            peRatio: calculatePeRatio.median, 
            pbRatio: calculatePbvRatio.median, 
            ebitda: calculateEbitdaRatio.median, 
            sales: calculatePsRatio.median
          }
          return [...serialiseRatio,meanRatio, medianRatio]
        }
        else{
          meanRatio = {
            company: "Average",
            peRatio: calculatePeRatio.mean,
            pbRatio: calculatePbvRatio.mean, 
            ebitda:  calculateEbitdaRatio.mean, 
            sales: calculatePsRatio.mean
          }
          return [...serialiseRatio,meanRatio]
        }
      }
      catch(error){
        return {
          error:error,
          status:false,
          msg:"mean and median computaion failed"
        }
      }
    }

    async searializeRatioList(data, inputList, maxLength){
      try{
        let array = [];
        for(let i = 0; i < maxLength; i++){
          array.push(
            {
              company: inputList[i].COMPANYNAME,
              companyId: inputList[i].COMPANYID,
              peRatio: data[MNEMONIC_ENUMS.IQ_PE_NORMALIZED][i],
              pbRatio: data[MNEMONIC_ENUMS.IQ_PBV][i],
              sales: data[MNEMONIC_ENUMS.IQ_PRICE_SALES][i],
              ebitda: data[MNEMONIC_ENUMS.IQ_TEV_EBITDA][i],
            }
          )
        }
        return array;
      }
      catch(error){
        return{
          error:error,
          status:false,
          msg:"Serialisation failed"
        }
      }
    }

    async calculateRatioMetric(data, method, maxLength){
      try{
        const result = (method === RATIO_TYPE[0])
        ? {mean: await this.calculateMean(data, maxLength), median: await this.calculateMedian(data)}
        : {mean: await this.calculateMean(data, maxLength)};
    
        return result;
      }
      catch(error){
        return {
          error:error,
          status:false,
          msg:"beta median/mean calculation failed"
        }
      }
    }

    async extractValues(betaDetails: any, mnemonic: any) {
      try {
        return betaDetails.Rows.map((innerBetaRows: any) => {
          const value = innerBetaRows?.Row[0];
          return !isNaN(parseInt(value)) && !`${value}`.includes('-') && value !== "0"
            ? parseFloat(value)
            : null;
        });
      } 
      catch (error) {
        return {
          error: error,
          status: false,
          msg: `Beta extraction failed for ${mnemonic}`,
        };
      }
    }

    async iqCreateStructure(data,mnemonic){
      if(mnemonic === MNEMONIC_ENUMS.IQ_DILUT_WEIGHT)
        return {
          "data":data.map((elements)=>{
            return {
              "function":"GDSP",
              "mnemonic":`${MNEMONIC_ENUMS.IQ_DILUT_WEIGHT}`,
              "identifier":`IQ${elements.COMPANYID}`,
              "properties":{
                "periodType":"IQ_FQ",
                "restatementTypeId":"LFR",
                // "asOfDate": '12/31/21',
                "currencyId":"INR",
                "filingMode" : "P",
                "consolidatedFlag":"CON",
                "currencyConversionModeId" : "H",
              }
            }
          })
        }

      if(mnemonic === MNEMONIC_ENUMS.IQ_CUSTOM_BETA)
        return {
          "data":data.map((elements)=>{
            return {
              "function":"GDSP",
              "mnemonic":`${MNEMONIC_ENUMS.IQ_CUSTOM_BETA}`,
              "identifier":`IQ${elements.COMPANYID}`,
              "properties":{
                "asOfDate": `${this.getOneDayBeforeDate()}`,
                "startDate": "01/01/2018",
            //   "secondaryIdentifier": "^SPX",
                "endDate": "12/31/2023",
                "frequency": "Monthly"
              }
            }
          })
        }

      if(mnemonic === MNEMONIC_ENUMS.IQ_LASTSALEPRICE)
        return {
          "data":data.map((elements)=>{
            return {
              "function":"GDSP",
              "mnemonic":`${MNEMONIC_ENUMS.IQ_LASTSALEPRICE}`,
              "identifier":`IQ${elements.COMPANYID}`,
              "properties":{
                "currencyConversionModeId" : "H",
                "currencyId" : "INR",
                // "asOfDate": '12/31/21'
              }
            }
          })
        }


      return {
        "data":data.map((elements)=>{
          return {
            "function":"GDSP",
            "mnemonic":`${mnemonic}`,
            "identifier":`IQ${elements.COMPANYID}`,
            "properties":{
              "periodType":"IQ_LTM",
              "restatementTypeId":"LFR",
              "filingMode" : "P",
              "currencyConversionModeId" : "H",
              "currencyId" : "INR",
              // "asOfDate": '12/31/21'
            }
          }
        })
      }
    }

    async createPriceToBookValStructure(data:any){
      return {
        "data":data.map((elements)=>{
          return {
            "function":"GDSP",
            "mnemonic":`${MNEMONIC_ENUMS.IQ_PBV}`,
            "identifier":`IQ${elements.COMPANYID}`,
            "properties":{
              "periodType":"IQ_CY"
            }
          }
        })
      }
    }

    async createPriceToSalesValStructure(data){
      return {
        "data":data.map((elements)=>{
          return {
            "function":"GDSP",
            "mnemonic":`${MNEMONIC_ENUMS.IQ_PRICE_SALES}`,
            "identifier":`IQ${elements.COMPANYID}`,
            "properties":{
              "periodType":"IQ_CY"
            }
          }
        })
      }
    }

    async createEbitdaStructure(data){
      return {
        "data":data.map((elements)=>{
          return {
            "function":"GDSP",
            "mnemonic":`${MNEMONIC_ENUMS.IQ_TEV_EBITDA}`,
            "identifier":`IQ${elements.COMPANYID}`,
            "properties":{
              "periodType":"IQ_CY"
            }
          }
        })
      }
    }
    
    async createPriceToEquityStructure(data){
      return {
        "data":data.map((elements)=>{
          return {
            "function":"GDSP",
            "mnemonic":`${MNEMONIC_ENUMS.IQ_PE_NORMALIZED}`,
            "identifier":`IQ${elements.COMPANYID}`,
            "properties":{
              "periodType":"IQ_CY"
            }
          }
        })
      }
    }

    async calculateMean(data, maxLength){
      try{
        let total = 0
        for await (const items of data){
          total += convertToNumberOrZero(items);
        }
        return total/maxLength;
      }
      catch(error){
        return {
          error:error,
          msg:"mean calculation failed",
          status:false
        }
      }
    }

    async calculateMedian(data){
      try{
        let median;
        const sortedData = [...data].sort((a, b) => convertToNumberOrZero(a) - convertToNumberOrZero(b));
        const middleIndex = Math.floor(sortedData.length / 2);
        
        if (sortedData.length % 2 === 0) {
          median =  (sortedData[middleIndex - 1] + sortedData[middleIndex]) / 2;
        } 
        else {
          median =  sortedData[middleIndex];
        }
        return median;
      }
      catch(error){
        return {
          error:error,
          status:false,
          msg:"Median calculation failed"
        }
      }
    }

    getOneDayBeforeDate(){
      try{
        const currentDate = new Date();
        const oneDayBefore = new Date(currentDate);
        oneDayBefore.setDate(currentDate.getDate() - 1);
        const formattedDate = `${(oneDayBefore.getMonth() + 1).toString().padStart(2, '0')}/${oneDayBefore.getDate().toString().padStart(2, '0')}/${oneDayBefore.getFullYear()}`;

        return formattedDate
      }
      catch(error){
        return{
          error:error,
          msg:"Date not found",
          status:false
        }
      }
    }
}