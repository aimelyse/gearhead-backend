import { Test, TestingModule } from '@nestjs/testing';
import { ProjectUpdatesController } from './project-updates.controller';
import { ProjectUpdatesService } from './project-updates.service';

describe('ProjectUpdatesController', () => {
  let controller: ProjectUpdatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectUpdatesController],
      providers: [ProjectUpdatesService],
    }).compile();

    controller = module.get<ProjectUpdatesController>(ProjectUpdatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
