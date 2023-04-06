import { Injectable } from '@nestjs/common';

@Injectable()
export class IndustryService {
  private readonly value: number = 2;

  getDiscountingFactor(): number {
    return this.value;
  }
}