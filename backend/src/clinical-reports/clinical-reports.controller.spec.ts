import { Test, TestingModule } from '@nestjs/testing';
import { ClinicalReportsController } from './clinical-reports.controller';

describe('ClinicalReportsController', () => {
  let controller: ClinicalReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClinicalReportsController],
    }).compile();

    controller = module.get<ClinicalReportsController>(ClinicalReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
