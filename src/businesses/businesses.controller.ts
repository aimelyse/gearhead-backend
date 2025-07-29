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
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  create(@Body() createBusinessDto: CreateBusinessDto, @Request() req) {
    return this.businessesService.create(createBusinessDto, req.user.uid);
  }

  @Get()
  findAll(
    @Query('type') type?: string,
    @Query('location') location?: string,
    @Query('serviceId') serviceId?: string,
    @Query('verified') verified?: string,
    @Query('topRated') topRated?: string,
    @Query('search') search?: string,
  ) {
    if (search) {
      return this.businessesService.search(search);
    }
    if (verified === 'true') {
      return this.businessesService.findVerified();
    }
    if (topRated === 'true') {
      const limit = parseInt(topRated) || 10;
      return this.businessesService.findTopRated(limit);
    }
    if (type) {
      return this.businessesService.findByType(type);
    }
    if (location) {
      return this.businessesService.findByLocation(location);
    }
    if (serviceId) {
      return this.businessesService.findByService(serviceId);
    }
    return this.businessesService.findAll();
  }

  @Get('my-businesses')
  @UseGuards(FirebaseAuthGuard)
  getMyBusinesses(@Request() req) {
    return this.businessesService.findByOwner(req.user.uid);
  }

  @Get(':id/stats')
  getBusinessStats(@Param('id') id: string) {
    return this.businessesService.getBusinessStats(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @Request() req,
  ) {
    return this.businessesService.update(id, updateBusinessDto, req.user.uid);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.businessesService.remove(id, req.user.uid);
  }

  @Post(':id/rate')
  @UseGuards(FirebaseAuthGuard)
  rateBusiness(@Param('id') id: string, @Body('rating') rating: number) {
    return this.businessesService.updateRating(id, rating);
  }

  @Post(':id/services')
  @UseGuards(FirebaseAuthGuard)
  addService(
    @Param('id') id: string,
    @Body('serviceId') serviceId: string,
    @Request() req,
  ) {
    return this.businessesService.addService(id, serviceId, req.user.uid);
  }

  @Delete(':id/services/:serviceId')
  @UseGuards(FirebaseAuthGuard)
  removeService(
    @Param('id') id: string,
    @Param('serviceId') serviceId: string,
    @Request() req,
  ) {
    return this.businessesService.removeService(id, serviceId, req.user.uid);
  }

  @Post(':id/verify')
  @UseGuards(FirebaseAuthGuard)
  toggleVerification(@Param('id') id: string) {
    return this.businessesService.toggleVerification(id);
  }
}
