import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Event } from './event.entity';
import { AttendeeAnswerEnum } from './attendee.entity';
import { ListEvents, WhenEventFilter } from './inputs/list.events';
import { PaginateOptions, paginate } from 'src/pagination/paginator';

@Injectable()
class EventsService {
	private readonly logger = new Logger(EventsService.name);

	constructor(
		@InjectRepository(Event)
		private readonly eventsRepository: Repository<Event>
	) {}

	private getEventsBaseQuery() {
		return this.eventsRepository
			.createQueryBuilder('e')
			.orderBy('e.id', 'DESC');

		//other sample
		// createQueryBuilder("attendance")
		// .innerJoin("attendance.child", "child")
		// .select(["attendance.childId","child.class","CONCAT(child.firstName, child.lastName)"])
		// .where("attendance.id= :id", { id: id })
		// .getQuery();
	}

	public async getEvent(id: number): Promise<Event | undefined> {
		const query = await this.getEventsWithAttendeeCountQuery()
			.andWhere('e.id = :id', { id })
			.printSql()
			.getOne();

		return query;
	}

	public getEventsWithAttendeeCountQuery() {
		const query = this.getEventsBaseQuery()
			.loadRelationCountAndMap('e.attendeeCount', 'e.attendees')
			.loadRelationCountAndMap(
				'e.attendeeAccepted',
				'e.attendees',
				'attendee', //alias
				(qb) =>
					qb.where('attendee.answer = :answer', {
						answer: AttendeeAnswerEnum.Accepted,
					})
			)
			.loadRelationCountAndMap(
				'e.attendeeRejected',
				'e.attendees',
				'attendee', //alias
				(qb) =>
					qb.where('attendee.answer = :answer', {
						answer: AttendeeAnswerEnum.Rejected,
					})
			)
			.loadRelationCountAndMap(
				'e.attendeeMaybe',
				'e.attendees',
				'attendee', //alias
				(qb) =>
					qb.where('attendee.answer = :answer', {
						answer: AttendeeAnswerEnum.Maybe,
					})
			);

		return query;
	}

	public getEventsWithAttendeeCountFiltered(filter?: ListEvents) {
		let query = this.getEventsWithAttendeeCountQuery();

		if (!filter) {
			return query;
		}

		if (filter.when) {
			if (filter.when == WhenEventFilter.Today) {
				query = query.andWhere(
					`e.when >= CURDATE() AND e.when <= CURDATE() + INTERVAL 1 DAY`
				);
			}
			if (filter.when == WhenEventFilter.Tomorrow) {
				query = query.andWhere(
					`e.when >= CURDATE() + INTERVAL 1 DAY AND e.when <= CURDATE() + INTERVAL 2 DAY`
				);
			}
			if (filter.when == WhenEventFilter.ThisWeek) {
				query = query.andWhere(
					`YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1)`
				);
			}
			if (filter.when == WhenEventFilter.NextWeek) {
				query = query.andWhere(
					`YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1 + 1)`
				);
			}
		}
		return query;
	}

	public async getEventsWithAttendeeCountFilteredPaginated(
		filter: ListEvents,
		paginateOptions: PaginateOptions
	) {
		return await paginate(
			this.getEventsWithAttendeeCountFiltered(filter),
			paginateOptions
		);
	}

	public async deleteEvent(id: number) : Promise<DeleteResult> {
		return await this.eventsRepository
		.createQueryBuilder('e')
		.delete()
		.where('id=:id', {id})
		.execute();
	}
}

export default EventsService;
