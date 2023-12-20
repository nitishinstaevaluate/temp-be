import { Module } from '@nestjs/common';
import { SnowflakeClientServiceService } from './snowflake-client-service.service';

@Module({
    providers: [SnowflakeClientServiceService],
    imports:[],
    exports:[SnowflakeClientServiceService]
})
export class SnowflakeClientModule {}
