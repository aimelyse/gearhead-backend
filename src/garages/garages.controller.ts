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
import { GaragesService } from './garages.service';
import { CreateGarageDto } from './dto/create-garage.dto';
import { UpdateGarageDto } from './dto/update-garage.dto';
import { FirebaseAuthGuard } from 'src/firebase/firebase.guard';

@Controller('garages')
@UseGuards(FirebaseAuthGuard)
export class GaragesController {
  constructor(private readonly garagesService: GaragesService) {}

  @Post()
  create(@Body() createGarageDto: CreateGarageDto, @Request() req) {
    return this.garagesService.create(createGarageDto, req.user.uid);
  }

  @Get()
  findAll(@Query('ownerId') ownerId?: string) {
    if (ownerId) {
      return this.garagesService.findByOwner(ownerId);
    }
    return this.garagesService.findAll();
  }

  @Get('my-garages')
  getMyGarages(@Request() req) {
    return this.garagesService.findByOwner(req.user.uid);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.garagesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGarageDto: UpdateGarageDto,
    @Request() req,
  ) {
    return this.garagesService.update(id, updateGarageDto, req.user.uid);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.garagesService.remove(id, req.user.uid);
  }
}
