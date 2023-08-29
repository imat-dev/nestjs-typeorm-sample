import { PartialType } from "@nestjs/mapped-types";
import { CreateEventDTO } from "./createEvent.dto";

//create a class wit same prop in CreateEventDTO, but it makes all prop optional
export class UpdateEventsDTO extends PartialType(CreateEventDTO) {}
