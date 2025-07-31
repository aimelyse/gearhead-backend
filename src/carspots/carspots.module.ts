import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarspotsService } from './carspots.service';
import { CarspotsController } from './carspots.controller';
import { Carspot, CarspotSchema } from './entities/carspot.entity';
import { UsersModule } from 'src/users/users.module';
import { User, UserSchema } from 'src/users/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Carspot.name, schema: CarspotSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
  ],
  controllers: [CarspotsController],
  providers: [CarspotsService],
  exports: [CarspotsService],
})
export class CarspotsModule {}
