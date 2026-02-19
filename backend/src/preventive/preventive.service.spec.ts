import { Test, TestingModule } from '@nestjs/testing';
import { PreventiveService } from './preventive.service';

describe('PreventiveService', () => {
  let service: PreventiveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreventiveService],
    }).compile();

    service = module.get<PreventiveService>(PreventiveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
