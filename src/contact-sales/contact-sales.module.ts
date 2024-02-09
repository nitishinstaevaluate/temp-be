import { Module } from '@nestjs/common';
import { ContactSalesService } from './contact-sales.service';

@Module({
  providers: [ContactSalesService]
})
export class ContactSalesModule {}
