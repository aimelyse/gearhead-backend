import { Test, TestingModule } from '@nestjs/testing';
import { GarageVehiclesService } from './garage-vehicles.service';

describe('GarageVehiclesService', () => {
  let service: GarageVehiclesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GarageVehiclesService],
    }).compile();

    service = module.get<GarageVehiclesService>(GarageVehiclesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
