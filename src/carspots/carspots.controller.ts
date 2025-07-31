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
  Request,
} from '@nestjs/common';
import { FirebaseAuthGuard } from 'src/firebase/firebase.guard';
import { CarspotsService } from './carspots.service';
import { CreateCarspotDto } from './dto/create-carspot.dto';
import { UpdateCarspotDto } from './dto/update-carspot.dto';

@Controller('carspots')
@UseGuards(FirebaseAuthGuard)
export class CarspotsController {
  constructor(private readonly carspotsService: CarspotsService) {}

  @Post()
  create(@Body() createCarspotDto: CreateCarspotDto, @Request() req) {
    return this.carspotsService.create(createCarspotDto, req.user.uid);
  }

  @Get()
  findAll() {
    return this.carspotsService.findAll();
  }

  @Get('my-spots')
  getMySpots(@Request() req) {
    return this.carspotsService.findByUser(req.user.uid);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carspotsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCarspotDto: UpdateCarspotDto,
    @Request() req,
  ) {
    return this.carspotsService.update(id, updateCarspotDto, req.user.uid);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.carspotsService.remove(id, req.user.uid);
  }

  @Post(':id/like')
  likeCarspot(@Param('id') id: string) {
    return this.carspotsService.likeCarspot(id);
  }
}
