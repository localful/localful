import {ItemDto, VersionDto} from "@localful/common";

export interface ItemDtoWithOwner extends ItemDto {
	ownerId: string
}

export interface VersionDtoWithOwner extends VersionDto {
	ownerId: string
}
