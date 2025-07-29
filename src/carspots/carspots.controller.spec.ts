import { Test, TestingModule } from '@nestjs/testing';
import { CarspotsController } from './carspots.controller';
import { CarspotsService } from './carspots.service';

describe('CarspotsController', () => {
  let controller: CarspotsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarspotsController],
      providers: [CarspotsService],
    }).compile();

    controller = module.get<CarspotsController>(CarspotsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
