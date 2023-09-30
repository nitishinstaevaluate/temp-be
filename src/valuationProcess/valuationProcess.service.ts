import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Valuation, ValuationDocument } from './schema/valuation.schema';
//Valuations Service
@Injectable()
export class ValuationsService {
  constructor(
    @InjectModel('valuation')
    private readonly valuationModel: Model<ValuationDocument>,
  ) {}

  async createValuation(valuation: object): Promise<string> {
    try {
      const createdFoo = await this.valuationModel.create(valuation);
      return createdFoo._id;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getValuationById(id: string): Promise<Valuation> {
    return this.valuationModel.findById(id);
  }

  async getValuationsByUserId(userId: string): Promise<Valuation[]> {
    return this.valuationModel.find({ userId: userId }).select('company model valuation createdAt').exec();
  }
  //excel update function ---> need to work on that
  // async updateExcel(inputData:any,workbook){
  //   console.log(inputData,"inside excel data")
  //   // Loop through the updates and modify the worksheet accordingly
  //   inputData?.excelEditedData?.editedValues.forEach(update => {
  //     const { subHeader, columnName, newValue } = update;

  //     const worksheet = workbook.getWorksheet('P&L');
  //     const rowIndex = worksheet.getColumn(1).values.indexOf(subHeader);
  //     console.log(rowIndex,"row index")

  //     // Find the column index based on columnName (assuming the headers are in row 1)
  //     const colIndex = workbook.getRow(1).values.indexOf(columnName) + 1;
  //     console.log(colIndex,"col Index")

  //     // Update the cell with the new value
  //     workbook.getCell(rowIndex, colIndex).value = newValue;
  //   });

  //   // Save the updated workbook
  //   // await workbook.xlsx.writeFile(filePath);
  // }
  
}
