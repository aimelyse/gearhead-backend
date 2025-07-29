import { Test, TestingModule } from '@nestjs/testing';
import { GaragesController } from './garages.controller';
import { GaragesService } from './garages.service';

describe('GaragesController', () => {
  let controller: GaragesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GaragesController],
      providers: [GaragesService],
    }).compile();

    controller = module.get<GaragesController>(GaragesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
