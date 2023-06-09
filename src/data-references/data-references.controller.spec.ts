import { Test, TestingModule } from '@nestjs/testing';
import { DataReferencesController } from './data-references.controller';

describe('DataReferencesController', () => {
  let controller: DataReferencesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataReferencesController],
    }).compile();

    controller = module.get<DataReferencesController>(DataReferencesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
