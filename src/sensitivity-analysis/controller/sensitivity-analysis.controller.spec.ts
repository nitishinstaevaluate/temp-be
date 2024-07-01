import { Test, TestingModule } from '@nestjs/testing';
import { SensitivityAnalysisController } from './sensitivity-analysis.controller';

describe('SensitivityAnalysisController', () => {
  let controller: SensitivityAnalysisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SensitivityAnalysisController],
    }).compile();

    controller = module.get<SensitivityAnalysisController>(SensitivityAnalysisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
