import {
	Body,
	Controller,
	Delete,
	Get,
	Logger,
	NotFoundException,
	Param,
	Patch,
	Post,
	Query,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { CreateEventDTO } from './inputs/createEvent.dto';
import { Like, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { Attendee } from './attendee.entity';
import EventsService from './events.service';
import { UpdateEventsDTO } from './inputs/updateEvent.dto';
import { ListEvents } from './inputs/list.events';

@Controller('/events')
export class EventsController {
	private readonly logger = new Logger(EventsController.name);

	constructor(
		@InjectRepository(Event)
		private readonly repository: Repository<Event>,

		@InjectRepository(Attendee)
		private readonly attendeeRepository: Repository<Attendee>,

		private readonly eventsService: EventsService
	) {}

	//Response http status codes are automatically set by Nest
	//If there's unhandled excetions, it will be handled by Nest
	@Get()
	@UsePipes(new ValidationPipe({ transform: true })) // make query classes populated by default
	async findAll(@Query() filter: ListEvents) {
		// this.logger.debug(filter);
		const result =
			this.eventsService.getEventsWithAttendeeCountFilteredPaginated(
				filter,
				{
					total: true,
					currentPage: filter.page,
					limit: 2,
				}
			);
		return result;
	}

	@Get(':id')
	async findOne(@Param('id') id) {
		this.logger.debug(id);
		const event = await this.eventsService.getEvent(id);
		if (!event) {
			throw new NotFoundException(); //Look for more built in https://docs.nestjs.com/exception-filters
		}

		return event;
	}

	@Post()
	async create(@Body() input: CreateEventDTO) {
		const event = {
			...input,
			when: new Date(input.when),
		};

		return await this.repository.save(event);
	}

	@Patch(':id')
	async update(@Param('id') id, @Body() input: UpdateEventsDTO) {
		const event = await this.repository.findOneBy({ id: id });

		if (!event) {
			throw new NotFoundException();
		}

		const updatedEvent = {
			...event,
			...input,
			when: input.when ? new Date(input.when) : event.when,
		};

		return await this.repository.save(updatedEvent);
	}

	@Delete(':id')
	async remove(@Param('id') id) {
		//find first the row
		const result = await this.eventsService.deleteEvent(id);

		//return delete object, if affected rows is not equal 1, meaning there's no deleted
		if (result?.affected !== 1) {
			throw new NotFoundException();
		}
	}

	//move up to make this work
	@Get('practice')
	async practice() {
		//read documentation here for more filters
		// https://orkhan.gitbook.io/typeorm/docs/find-options
		//Select * from events where id=2
		// let params = {
		//   where: { id: 2 },
		// };

		//SElect * from events where (id > 3 AND when > 2021-02-12T13:00:00) OR description LIKE '%meet%'
		let params = {
			where: [
				{
					id: MoreThan(2),
					when: MoreThan(new Date('2021-02-12T13:00:00')),
				},
				{ description: Like('%meet%') },
			],
			take: 2, //limit
			skip: 2, //offset
			order: {
				id: 'DESC',
			},
		};

		// return await this.repository.find(params);
	}

	//move up to make this work
	@Get('practice2')
	async practice2() {
		console.log('hey');
		// { relation: ['attendees']}/ get related table using the property define in OneToMany Decorator
		// const result = await this.repository.find({ relations: ['attendees'] });
		// return result;

		//inserting data to table with foreign key 1st option
		//get the event row first
		const event = await this.repository.findOneBy({ id: 1 });

		const attendee = new Attendee();
		attendee.name = 'Imat';
		attendee.event = event;

		//inserting data to table with foreign key 2nd option
		const attendee2 = new Attendee();
		const event2 = new Event();
		event2.id = 2;
		attendee2.name = 'hey';
		attendee2.event = event2;

		return await this.attendeeRepository.save(attendee2);
	}
}
