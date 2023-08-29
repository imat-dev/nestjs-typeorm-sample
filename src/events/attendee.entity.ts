import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Event } from "./event.entity";
import { NotAcceptableException } from "@nestjs/common";

export enum AttendeeAnswerEnum {
	Accepted = 1,
	Maybe,
	Rejected,
}

@Entity()
export class Attendee {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	//1st arg is function that return the Type of the relation
	//2nd arg is the property that points to the relation
	//can add 3rd args,   {nullable: false} make sure that eventId(foreign key) can't have  a null value ,
	// @JoinColumn({
	//     name: 'event_id' //change the name of the foreign key to table
	// })
	@ManyToOne(() => Event, (event) => event.attendees)
	event: Event;

	@Column("enum", {
		enum: AttendeeAnswerEnum,
		default: AttendeeAnswerEnum.Accepted,
	})
	answer: AttendeeAnswerEnum;
}
