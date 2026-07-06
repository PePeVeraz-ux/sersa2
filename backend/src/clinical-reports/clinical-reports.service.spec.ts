import { Test, TestingModule } from '@nestjs/testing';
import { ClinicalReportsService } from './clinical-reports.service';

describe('ClinicalReportsService', () => {
  let service: ClinicalReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClinicalReportsService],
    }).compile();

    service = module.get<ClinicalReportsService>(ClinicalReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
