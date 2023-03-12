import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Query,UploadedFile } from '@nestjs/common';
import { ImportService } from './import.service';
import { CreateImportDto } from './dto/create-import.dto';
import { UpdateImportDto } from './dto/update-import.dto';
import { MessageDto } from './dto/message.dto';
import { FileInterceptor, MulterModule } from '@nestjs/platform-express';
import { multerOptions,multerConfig } from 'src/middleware/file-upload.utils';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post()
//   create(@Body() createImportDto: CreateImportDto) {
//     return this.importService.create(createImportDto);
//   }

    // createMessage(@Body() message: MessageDto){
    // console.log(message);
    // return message;
    // }

    // async uploadFile(@Param('years') years:number,@Body() file: File) {
    //     return this.importService.uploadFile(years,file);
    //   }

      async uploadFiles(@Query('years') years:number) {
        return this.importService.uploadFiles(years);
      }
      
  @Post('/val')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async upload( @Query('projectionYrs') projectionYrs:number, 
  @Query('discountingPeriod') discountingPeriod:number, 
  @Query('discountingFactor') discountingFactor:number, 
  @Query('noOfEquityShares') noOfEquityShares:number, 
  @Query('otherAdjustments') otherAdjustments:number, 
  @UploadedFile() file) {
    // console.log(file.filename)
    return this.importService.calcFcfeVal(projectionYrs,discountingFactor,noOfEquityShares,otherAdjustments,file);
  }

  
  @Get()
//   findAll() {
//     return this.importService.findAll();
//   }
// getMessages(){
//     return 'hello world';
    // return this.importService.getQuotes();

  async getFiles(){
    return this.importService.getFiles();
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.importService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateImportDto: UpdateImportDto) {
    return this.importService.update(+id, updateImportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.importService.remove(+id);
  }

}
