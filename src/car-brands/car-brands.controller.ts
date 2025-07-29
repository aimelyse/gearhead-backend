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
import { FirebaseAuthGuard } from 'src/firebase/firebase.guard';
import { CarBrandsService } from './car-brands.service';
import { CreateCarBrandDto } from './dto/create-car-brand.dto';
import { UpdateCarBrandDto } from './dto/update-car-brand.dto';

@Controller('car-brands')
export class CarBrandsController {
  constructor(private readonly carBrandsService: CarBrandsService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  create(@Body() createCarBrandDto: CreateCarBrandDto) {
    return this.carBrandsService.create(createCarBrandDto);
  }

  @Get()
  findAll(
    @Query('country') country?: string,
    @Query('search') search?: string,
  ) {
    if (search) {
      return this.carBrandsService.search(search);
    }
    if (country) {
      return this.carBrandsService.findByCountry(country);
    }
    return this.carBrandsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carBrandsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateCarBrandDto: UpdateCarBrandDto,
  ) {
    return this.carBrandsService.update(id, updateCarBrandDto);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  remove(@Param('id') id: string) {
    return this.carBrandsService.remove(id);
  }
}
