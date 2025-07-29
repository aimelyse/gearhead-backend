import { Test, TestingModule } from '@nestjs/testing';
import { GarageVehiclesController } from './garage-vehicles.controller';
import { GarageVehiclesService } from './garage-vehicles.service';

describe('GarageVehiclesController', () => {
  let controller: GarageVehiclesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GarageVehiclesController],
      providers: [GarageVehiclesService],
    }).compile();

    controller = module.get<GarageVehiclesController>(GarageVehiclesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
