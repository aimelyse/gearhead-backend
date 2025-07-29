import { Test, TestingModule } from '@nestjs/testing';
import { ProjectUpdatesService } from './project-updates.service';

describe('ProjectUpdatesService', () => {
  let service: ProjectUpdatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectUpdatesService],
    }).compile();

    service = module.get<ProjectUpdatesService>(ProjectUpdatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
