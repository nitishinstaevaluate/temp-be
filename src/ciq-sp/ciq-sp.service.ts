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
import { CAPITALIQ_MARKET_BETA } from 'src/interfaces/api-endpoints.prod';
import { convertToNumberOrOne, convertToNumberOrZero } from 'src/excelFileServices/common.methods';
import { throwError } from 'rxjs';
import { BETA_SUB_TYPE, MNEMONICS_ARRAY, MNEMONIC_ENUMS } from 'src/constants/constants';
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

    async calculateBetaAggregate(data:any){
      try{

        if(!data.industryAggregateList)
          throw new NotFoundException({
            message: 'Industry List not found',
            status: false,
          })

        if(!data.taxRate)
          throw new NotFoundException({
            message: 'Tax rate not found',
            status: false,
          })

        const taxRate = parseFloat(data.taxRate?.replace("%", "")) ?? parseFloat(data.taxRate);
        
        const headers = {
          'Content-Type': 'application/json'
        }

        const auth = {
          username: process.env.CAPITALIQ_API_USERNAME,
          password: process.env.CAPITALIQ_API_PASSWORD
        }

        const capBeta = await axiosInstance.post(CAPITALIQ_MARKET_BETA, await this.createBetaStructure(data.industryAggregateList), {headers, auth});

        let total, totalBeta = 0, medianBetaArray = [];

        if(capBeta.data){
          if(data.betaSubType === BETA_SUB_TYPE[0]){
            let counter = 0;
            capBeta.data?.GDSSDKResponse.map((axiosBetaResponse=>{  
              if(!axiosBetaResponse.ErrMsg){
                axiosBetaResponse?.Rows.map((innerRows)=>{
                  if(!isNaN(parseInt(innerRows.Row[0])) && !`${innerRows.Row[0]}`.includes('-') && innerRows.Row[0] !== "0"){
                    counter++
                    totalBeta += convertToNumberOrZero(innerRows.Row[0])
                  }
                })
              }
            }))
            total = totalBeta/counter;
          }
          else{
            capBeta.data?.GDSSDKResponse.map((axiosBetaResponse=>{  
              if(!axiosBetaResponse.ErrMsg){
                axiosBetaResponse?.Rows.map((innerRows)=>{
                  if(!isNaN(parseInt(innerRows.Row[0])) && !`${innerRows.Row[0]}`.includes('-') && innerRows.Row[0] !== "0"){
                    medianBetaArray.push(parseFloat(innerRows.Row[0]))
                  }
                })
              }
            }))

            const sortedData = [...medianBetaArray].sort((a, b) => a - b);
            const middleIndex = Math.floor(sortedData.length / 2);
            
            if (sortedData.length % 2 === 0) {
              total =  (sortedData[middleIndex - 1] + sortedData[middleIndex]) / 2;
            } 
            else {
              total =  sortedData[middleIndex];
            }
          }

          // Beta calculation based on different mnemonics
          const createPayloadStructure = await this.createPayloadStructure(data.industryAggregateList)
          const axiosBetaResponse = await axiosInstance.post(CAPITALIQ_MARKET_BETA, createPayloadStructure, {headers, auth});
          const betaData = await this.calculateCapitalIqBeta(axiosBetaResponse, taxRate);

          return {
            data:axiosBetaResponse.data,
            msg:"beta calculation success",
            status:true,
            total,
            betaSubType:data.betaSubType
          }
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
      const payloadStruc = [...await this.calculateDebtInCurrentLiabilites(data), ...await this.calculateLongTermDebt(data), ...await this.calculateTotalBookValueOfPreferred(data), ...await this.calculatePricePerShare(data), ...await this.calculateFullyDilutedWeightedAverage(data)];
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

    async createBetaStructure(data){
      return {
        "inputRequests":data.map((elements)=>{
          return {
            "function":"GDSP",
            "mnemonic":`${MNEMONIC_ENUMS.IQ_CUSTOM_BETA}`,
            "identifier":`IQ${elements.COMPANYID}`,
            "properties":{
              "periodType":"IQ_CV"
            }
          }
        })
      }
    }

    async calculateCapitalIqBeta(axiosBetaResponse, taxRate) {
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

        const unleveredBeta = await this.calculateUnleveredBeta(getDebtToCapitalAndMarketValue.calculateTotalDebtToCapital, getDebtToCapitalAndMarketValue.calculateTotalEquityToCapital, taxRate, maxLength);
        console.log(unleveredBeta,"unlevered beta")

        const releveredBeta = await this.calculateReleveredBeta(unleveredBeta, getDebtToCapitalAndMarketValue.calculateTotalDebtToCapital, getDebtToCapitalAndMarketValue.calculateTotalEquityToCapital, taxRate, maxLength);
        console.log(releveredBeta,"relevered beta")
        
        return result;
      } catch (error) {
        console.error(error);
        return {
          error: error,
          msg: "Error while fetching data from axios",
          status: false,
        };
      }
    }

    async calculateUnleveredBeta(debtToCapital, equityToCapital, taxRate, maxLength){
      try{
        // Be4 = M12/(1+(1-L12)*J12/K12)
        const tempLeveredBetaArray = [0.80, 1.82, 1.24, 1.46, 1.51, 1.44, 0.84, 0.96, 1.23, 0.543, 0.234, 1.23]; // array length should be equal to the total number of companies
        let unleveredBetaArray = []
        for (let i = 0; i < maxLength; i++){
          unleveredBetaArray.push(
            tempLeveredBetaArray[i] / (1 + (1 - taxRate) * debtToCapital[i]/equityToCapital[i])
          )
        }
        return unleveredBetaArray;
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
        let releveredBetaArray = []
        for(let i = 0; i < maxLength; i++){
          releveredBetaArray.push(
            betaUnleveredArray[i] * (1 + (1 - taxRate) * debtToCapital[i]/equityToCapital[i])
          )
        }
        return releveredBetaArray;
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

        // periodType, asOfDate, currencyId, restatementTypeId, filingMode, consolidatedFlag, currencyConversionModeId

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

    async createPriceToBookValStructure(data){
      return {
        "inputRequests":data.map((elements)=>{
          return {
            "function":"GDSP",
            "mnemonic":`${MNEMONIC_ENUMS.IQ_PBV}`,
            "identifier":`IQ${elements.COMPANYID}`,
            "properties":{
              "periodType":"IQ_CV"
            }
          }
        })
      }
    }

    async createPriceToSalesValStructure(data){
      return {
        "inputRequests":data.map((elements)=>{
          return {
            "function":"GDSP",
            "mnemonic":`${MNEMONIC_ENUMS.IQ_PRICE_SALES}`,
            "identifier":`IQ${elements.COMPANYID}`,
            "properties":{
              "periodType":"IQ_CV"
            }
          }
        })
      }
    }

    async createEbitdaStructure(data){
      return {
        "inputRequests":data.map((elements)=>{
          return {
            "function":"GDSP",
            "mnemonic":`${MNEMONIC_ENUMS.IQ_TEV_EBITDA}`,
            "identifier":`IQ${elements.COMPANYID}`,
            "properties":{
              "periodType":"IQ_CV"
            }
          }
        })
      }
    }
    
    async createPriceToEquityStructure(data){
      return {
        "inputRequests":data.map((elements)=>{
          return {
            "function":"GDSP",
            "mnemonic":`${MNEMONIC_ENUMS.IQ_PE_EXCL_FWD_REUT}`,
            "identifier":`IQ${elements.COMPANYID}`,
            "properties":{
              "periodType":"IQ_CV"
            }
          }
        })
      }
    }
}