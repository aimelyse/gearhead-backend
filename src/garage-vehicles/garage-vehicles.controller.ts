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
import { GarageVehiclesService } from './garage-vehicles.service';
import { CreateGarageVehicleDto } from './dto/create-garage-vehicle.dto';
import { UpdateGarageVehicleDto } from './dto/update-garage-vehicle.dto';
import { FirebaseAuthGuard } from 'src/firebase/firebase.guard';

@Controller('garage-vehicles')
@UseGuards(FirebaseAuthGuard)
export class GarageVehiclesController {
  constructor(private readonly garageVehiclesService: GarageVehiclesService) {}

  @Post()
  create(@Body() createGarageVehicleDto: CreateGarageVehicleDto) {
    return this.garageVehiclesService.create(createGarageVehicleDto);
  }

  @Get()
  findAll(@Query('garageId') garageId?: string) {
    if (garageId) {
      return this.garageVehiclesService.findByGarage(garageId);
    }
    return this.garageVehiclesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.garageVehiclesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGarageVehicleDto: UpdateGarageVehicleDto,
  ) {
    return this.garageVehiclesService.update(id, updateGarageVehicleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.garageVehiclesService.remove(id);
  }

  @Post(':id/modifications')
  addModification(
    @Param('id') id: string,
    @Body('modification') modification: string,
  ) {
    return this.garageVehiclesService.addModification(id, modification);
  }

  @Post(':id/images')
  addImage(@Param('id') id: string, @Body('imageUrl') imageUrl: string) {
    return this.garageVehiclesService.addImage(id, imageUrl);
  }

  @Patch(':id/spending')
  updateSpending(@Param('id') id: string, @Body('amount') amount: number) {
    return this.garageVehiclesService.updateSpending(id, amount);
  }
}
