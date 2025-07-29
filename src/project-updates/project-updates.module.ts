import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectUpdatesService } from './project-updates.service';
import { ProjectUpdatesController } from './project-updates.controller';
import {
  ProjectUpdate,
  ProjectUpdateSchema,
} from './entities/project-update.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProjectUpdate.name, schema: ProjectUpdateSchema },
    ]),
  ],
  controllers: [ProjectUpdatesController],
  providers: [ProjectUpdatesService],
  exports: [ProjectUpdatesService],
})
export class ProjectUpdatesModule {}
