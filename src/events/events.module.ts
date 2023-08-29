import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { Attendee } from './attendee.entity';
import EventsService from './events.service';
import { Profile } from 'src/auth/profile.entity';
import { User } from 'src/auth/user.entity';

//use cli.$ nest generate module events
@Module({
	//repository here. //for feature makes Events Repository Injetable in Controller
	imports: [TypeOrmModule.forFeature([Event, Attendee, Profile, User])],
	controllers: [EventsController],
	providers: [EventsService],
})
export class EventsModule {}
