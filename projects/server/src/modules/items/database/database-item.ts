import {ItemDto, VersionDto} from "@localful/common";

// todo: make sure internal dtos between modules (users etc) is consistent.

export interface InternalDatabaseItem {
	id: string
	vault_id: string
	item_type: string
	created_at: string
	deleted_at: string
}

export interface InternalDatabaseItemWithOwner extends InternalDatabaseItem {
	owner_id: string
}

export interface ItemDtoWithOwner extends ItemDto {
	ownerId: string
}

export interface InternalDatabaseItemVersion {
	id: string
	item_id: string
	device_name: string
	protected_data: string
	created_at: string
	deleted_at: string
	owner_id: string
}

export interface InternalDatabaseItemVersionWithOwner extends InternalDatabaseItemVersion {
	owner_id: string
}

export interface ItemVersionDtoWithOwner extends VersionDto {
	ownerId: string
}
