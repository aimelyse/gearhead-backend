import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { FirebaseModule } from './firebase/firebase.module';
import { SkillsModule } from './skills/skills.module';
import { CarBrandsModule } from './car-brands/car-brands.module';
import { CarsModule } from './cars/cars.module';
import { CarspotsModule } from './carspots/carspots.module';
import { GaragesModule } from './garages/garages.module';
import { GarageVehiclesModule } from './garage-vehicles/garage-vehicles.module';
import { ProjectUpdatesModule } from './project-updates/project-updates.module';
import { EventsModule } from './events/events.module';
import { QuestsModule } from './quests/quests.module';
import { CommentsModule } from './comments/comments.module';
import { BusinessesModule } from './businesses/businesses.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AchievementsModule } from './achievements/achievements.module';
import { ChallengesModule } from './challenges/challenges.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env'],
    }),
    DatabaseModule,
    UsersModule,
    FirebaseModule,
    SkillsModule,
    CarBrandsModule,
    CarsModule,
    CarspotsModule,
    GaragesModule,
    GarageVehiclesModule,
    ProjectUpdatesModule,
    EventsModule,
    QuestsModule,
    CommentsModule,
    BusinessesModule,
    NotificationsModule,
    AchievementsModule,
    ChallengesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
