import { IsDateString, IsString, IsNotEmpty, Length } from "class-validator";

export class CreateEventDTO {
	@IsNotEmpty()
	@IsString()
	@Length(3, 255, { message: "Name input should be at least 3 characters." })
	name: string;

	@IsNotEmpty()
	@Length(5, 255)
	description: string;

	@IsNotEmpty()
	@IsDateString()
	when: string;

	@IsNotEmpty()
	@Length(5, 255)
	address: string;
}
