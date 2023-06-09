import { Test, TestingModule } from '@nestjs/testing';
import { DataReferencesService } from './data-references.service';

describe('DataReferencesService', () => {
  let service: DataReferencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataReferencesService],
    }).compile();

    service = module.get<DataReferencesService>(DataReferencesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
