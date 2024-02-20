import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { CIQ_ELASTIC_SEARCH_LISTED_COMPANIES_LIST } from 'src/library/interfaces/api-endpoints.local';
import { axiosInstance, axiosRejectUnauthorisedAgent } from 'src/middleware/axiosConfig';
import { error } from 'winston';
const Fuse = require("fuse.js")

@Injectable()
export class FuseSearchService {
    axiosResponse;
    constructor(private readonly authenticationService: AuthenticationService){}
    async fuseSearchByCompanyName(request,companyName:any){
        try{

            if(!this.axiosResponse?.data){
                const bearerToken = await this.authenticationService.extractBearer(request);
                
                if(!bearerToken.status)
                return bearerToken;
            
                const headers = { 
                    'Authorization':`${bearerToken.token}`,
                    'Content-Type': 'application/json'
                }

                this.axiosResponse = await axiosInstance.get(`${CIQ_ELASTIC_SEARCH_LISTED_COMPANIES_LIST}`, {httpsAgent: axiosRejectUnauthorisedAgent,headers});
            }

            if(!this.axiosResponse.data?.data?.length)
                throw new HttpException(
                    {
                    error: error,
                    status: false,
                    msg: 'Company not found',
                    },
                    HttpStatus.NOT_FOUND,
                );

            const companyList = this.axiosResponse.data.data;

            const options = {
                includeScore: true,
                keys: ['COMPANYNAME'],
                shouldSort:true,
                threshold:0.5,
                distance:10
              }

            const fuse = new Fuse(companyList, options);
              
            const result = fuse.search(companyName).slice(0, 20);

            const companyDetails = result.map((elements)=>{
                return elements.item;
            })
            
            return {
                companyDetails,
                total:companyDetails.length,
                status:true,
                msg:"company name found"
            }
        }
        catch(error){
            console.log(error,"error")
            return {
                error:error,
                status:false,
                msg:"Fuse search failed"
            }
        }
    }
}
