import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectUpdatesService } from './project-updates.service';
import { CreateProjectUpdateDto } from './dto/create-project-update.dto';
import { UpdateProjectUpdateDto } from './dto/update-project-update.dto';
import { FirebaseAuthGuard } from 'src/firebase/firebase.guard';

@Controller('project-updates')
@UseGuards(FirebaseAuthGuard)
export class ProjectUpdatesController {
  constructor(private readonly projectUpdatesService: ProjectUpdatesService) {}

  @Post()
  create(@Body() createProjectUpdateDto: CreateProjectUpdateDto) {
    return this.projectUpdatesService.create(createProjectUpdateDto);
  }

  @Get()
  findAll(@Query('garageVehicleId') garageVehicleId?: string) {
    if (garageVehicleId) {
      return this.projectUpdatesService.findByGarageVehicle(garageVehicleId);
    }
    return this.projectUpdatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectUpdatesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectUpdateDto: UpdateProjectUpdateDto,
  ) {
    return this.projectUpdatesService.update(id, updateProjectUpdateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectUpdatesService.remove(id);
  }

  @Post(':id/like')
  likeUpdate(@Param('id') id: string) {
    return this.projectUpdatesService.likeUpdate(id);
  }
}
