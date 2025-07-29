import { Test, TestingModule } from '@nestjs/testing';
import { CarspotsService } from './carspots.service';

describe('CarspotsService', () => {
  let service: CarspotsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarspotsService],
    }).compile();

    service = module.get<CarspotsService>(CarspotsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
