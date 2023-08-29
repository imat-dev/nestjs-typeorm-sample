import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Attendee } from "./attendee.entity";

@Entity({ name: "event" })
export class Event {
	@PrimaryGeneratedColumn() //Autoincrement int, if you want to use other primarykey(cellphone #, SSS, CCnumber), you can use @PrimaryColumn decorator
	id: number;

	@Column()
	name: string;

	@Column()
	description: string;

	@Column()
	when: Date;

	@Column()
	address: string;

	//1st arg is function that return the Type of the relation
	//2nd arg is the property that points to the relation
	//3rd args can be { eager: true } will make the query return all related table// can be memory exhausting.
	@OneToMany(() => Attendee, (attendee) => attendee.event, { eager: false })
	attendees: Attendee[];

	//virtual column, won't be read or save to DB
	attendeeCount?: number;
	attendeeRejected?: number;
	attendeeMaybe?: number;
	attendeeAccepted?: number;
}
