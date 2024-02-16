import { Module } from '@nestjs/common';
import { ElevenUaService } from './eleven-ua.service';
import { ElevenUaController } from './eleven-ua.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ElevenUaSchema } from './schema/eleven-ua.schema';
import { ExcelSheetService } from 'src/excelFileServices/uploadExcel.service';
import { ValuationsService } from 'src/valuationProcess/valuationProcess.service';
import { FCFEAndFCFFService } from 'src/valuationProcess/fcfeAndFCFF.service';
import { ValuationSchema } from 'src/valuationProcess/schema/valuation.schema';
import { IndustryService } from 'src/industry/industry.service';
import { CustomLogger } from 'src/loggerService/logger.service';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { UsersService } from 'src/users/users.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { UsersModule } from 'src/users/users.module';
import { utilsService } from 'src/utils/utils.service';
import { ProcessManagerSchema } from 'src/processStatusManager/schema/process-status-manager.schema';
import { DataCheckListSchema } from 'src/utils/schema/dataCheckList.schema';

@Module({
  providers: [ElevenUaService,ExcelSheetService,ValuationsService,FCFEAndFCFFService,IndustryService,CustomLogger,AuthenticationService, utilsService],
  controllers: [ElevenUaController],
  imports:[MongooseModule.forFeature([
    { name:'ruleelevenua',schema:ElevenUaSchema },
    { name: 'valuation', schema: ValuationSchema },
    { name: 'processManager', schema: ProcessManagerSchema },
    { name: 'dataChecklist', schema: DataCheckListSchema }
  ]),
  UsersModule,
  JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '24h' },
  })
]
})
export class ElevenUaModule {}
