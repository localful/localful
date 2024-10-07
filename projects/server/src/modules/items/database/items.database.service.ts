import {DatabaseService} from "@services/database/database.service.js";
import {ErrorIdentifiers, ItemDto, ItemVersionDto} from "@localful/common";
import Postgres from "postgres";
import {PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION} from "@services/database/database-error-codes.js";
import {ResourceRelationshipError} from "@services/errors/resource/resource-relationship.error.js";
import {SystemError} from "@services/errors/base/system.error.js";
import {ResourceNotFoundError} from "@services/errors/resource/resource-not-found.error.js";
import {
	InternalDatabaseItem, InternalDatabaseItemVersion,
	InternalDatabaseItemVersionWithOwner, InternalDatabaseItemWithOwner,
	ItemDtoWithOwner,
	ItemVersionDtoWithOwner,
} from "@modules/items/database/database-item.js";


export class ItemsDatabaseService {
	constructor(
		private readonly databaseService: DatabaseService
	) {}

	private static mapItemApplicationField(fieldName: string): string {
		switch (fieldName) {
			case "vaultId":
				return "vault_id"
			case "itemType":
				return "item_type"
			case "createdAt":
				return "created_at";
			case "deletedAt":
				return "deleted_at";
			default:
				return fieldName;
		}
	}

	private static mapItemVersionApplicationField(fieldName: string): string {
		switch (fieldName) {
			case "itemId":
				return "item_id"
			case "deviceName":
				return "device_name"
			case "protectedData":
				return "protected_data";
			case "createdAt":
				return "created_at";
			case "deletedAt":
				return "deleted_at";
			default:
				return fieldName;
		}
	}

	private static convertDatabaseItemWithOwnerToDto(item: InternalDatabaseItemWithOwner): ItemDtoWithOwner {
		return {
			id: item.id,
			vaultId: item.vault_id,
			type: item.item_type,
			createdAt: item.created_at,
			deletedAt: item.deleted_at,
			ownerId: item.owner_id,
		}
	}

	private static convertDatabaseItemToDto(item: InternalDatabaseItem): ItemDto {
		return {
			id: item.id,
			vaultId: item.vault_id,
			type: item.item_type,
			createdAt: item.created_at,
			deletedAt: item.deleted_at,
		}
	}

	private static convertDatabaseItemVersionWithOwnerToDto(version: InternalDatabaseItemVersionWithOwner): ItemVersionDtoWithOwner {
		return {
			id: version.id,
			itemId: version.item_id,
			createdBy: version.created_by,
			protectedData: version.protected_data,
			createdAt: version.created_at,
			deletedAt: version.deleted_at,
			ownerId: version.owner_id
		}
	}

	private static convertDatabaseItemVersionToDto(version: InternalDatabaseItemVersion): ItemVersionDto {
		return {
			id: version.id,
			itemId: version.item_id,
			createdBy: version.created_by,
			protectedData: version.protected_data,
			createdAt: version.created_at,
			deletedAt: version.deleted_at,
		}
	}

	private static getDatabaseError(e: any) {
		if (e instanceof Postgres.PostgresError && e.code) {
			if (e.code === PG_FOREIGN_KEY_VIOLATION) {
				if (e.constraint_name === "items_vault") {
					return new ResourceRelationshipError({
						identifier: ErrorIdentifiers.VAULT_NOT_FOUND,
						applicationMessage: "Attempted to add item referencing vault that doesn't exist."
					})
				}
				if (e.constraint_name === "item_versions_item") {
					return new ResourceRelationshipError({
						identifier: ErrorIdentifiers.RESOURCE_NOT_FOUND, // todo: add unique item/version identifiers
						applicationMessage: "Attempted to add version referencing item that doesn't exist."
					})
				}
			}
			if (e.code === PG_UNIQUE_VIOLATION) {
				if (e.constraint_name === "items_pk") {
					return new ResourceRelationshipError({
						identifier: ErrorIdentifiers.RESOURCE_NOT_UNIQUE,
						applicationMessage: "Item with given id already exists."
					})
				}
				if (e.constraint_name === "item_versions_pk") {
					return new ResourceRelationshipError({
						identifier: ErrorIdentifiers.RESOURCE_NOT_UNIQUE,
						applicationMessage: "Item version with given id already exists."
					})
				}
			}
		}

		return new SystemError({
			message: "Unexpected error while executing item/version query",
			originalError: e
		})
	}

	async getItem(itemId: string): Promise<ItemDtoWithOwner> {
		const sql = await this.databaseService.getSQL();

		let result: InternalDatabaseItemWithOwner[] = [];
		try {
			result = await sql<InternalDatabaseItemWithOwner[]>`
				select items.*, vaults.owner_id from items
				join vaults on items.vault_id = vaults.id
				where items.id = ${itemId}
			`;
		}
		catch (e: any) {
			throw ItemsDatabaseService.getDatabaseError(e);
		}

		if (result.length > 0) {
			return ItemsDatabaseService.convertDatabaseItemWithOwnerToDto(result[0]);
		}
		else {
			throw new ResourceNotFoundError({
				identifier: ErrorIdentifiers.RESOURCE_NOT_FOUND,
				applicationMessage: "The requested item could not be found."
			})
		}
	}

	async createItem(itemDto: ItemDto): Promise<ItemDto> {
		const sql = await this.databaseService.getSQL();

		let result: InternalDatabaseItem[] = [];
		try {
			result = await sql<InternalDatabaseItem[]>`
          INSERT INTO items(id, item_type, created_at, deleted_at, vault_id)
          VALUES (${itemDto.id}, ${itemDto.type}, ${itemDto.createdAt}, ${itemDto.deletedAt}, ${itemDto.vaultId})
          RETURNING *;
			`;
		}
		catch (e: any) {
			throw ItemsDatabaseService.getDatabaseError(e);
		}

		if (result.length > 0) {
			return ItemsDatabaseService.convertDatabaseItemToDto(result[0]);
		}
		else {
			throw new SystemError({
				message: "Unexpected error returning item after creation",
			})
		}
	}

	async deleteItem(itemId: string): Promise<void> {
		const sql = await this.databaseService.getSQL();

		let deleteResult: Postgres.RowList<Postgres.Row[]>;
		try {
			deleteResult = await sql`
          UPDATE vaults
          SET deleted_at = now()
          WHERE id = ${itemId}
          RETURNING *;
			`;

			// Delete all versions as they aren't needed anymore.
			await sql`DELETE FROM item_versions WHERE item_id = ${itemId}`;
		}
		catch (e: any) {
			throw ItemsDatabaseService.getDatabaseError(e);
		}

		// If there's a count then rows were affected and the deletion was a success
		// If there's no count but an error wasn't thrown then the entity must not exist
		if (deleteResult && deleteResult.count) {
			return;
		}
		else {
			throw new ResourceNotFoundError({
				identifier: ErrorIdentifiers.RESOURCE_NOT_FOUND,
				applicationMessage: "The requested item could not be found."
			})
		}
	}

	async purgeItem(itemId: string): Promise<void> {
		const sql = await this.databaseService.getSQL();

		let result: Postgres.RowList<Postgres.Row[]>;
		try {
			result = await sql`DELETE FROM items WHERE id = ${itemId}`;
		}
		catch (e: any) {
			throw ItemsDatabaseService.getDatabaseError(e);
		}

		// If there's a count then rows were affected and the deletion was a success
		// If there's no count but an error wasn't thrown then the entity must not exist
		if (result && result.count) {
			return;
		}
		else {
			throw new ResourceNotFoundError({
				identifier: ErrorIdentifiers.RESOURCE_NOT_FOUND,
				applicationMessage: "The requested item could not be found."
			})
		}
	}

	async getVersion(versionId: string): Promise<ItemVersionDtoWithOwner> {
		const sql = await this.databaseService.getSQL();

		let result: InternalDatabaseItemVersionWithOwner[] = [];
		try {
			result = await sql<InternalDatabaseItemVersionWithOwner[]>`
				select item_versions.*, vaults.owner_id from item_versions
				join items on item_versions.item_id = item_versions.item_id
				join vaults on items.vault_id = vaults.id
				where item_versions.id = ${versionId}
			`;
		}
		catch (e: any) {
			throw ItemsDatabaseService.getDatabaseError(e);
		}

		if (result.length > 0) {
			return ItemsDatabaseService.convertDatabaseItemVersionWithOwnerToDto(result[0]);
		}
		else {
			throw new ResourceNotFoundError({
				identifier: ErrorIdentifiers.RESOURCE_NOT_FOUND,
				applicationMessage: "The requested version could not be found."
			})
		}
	}

	async createVersion(itemVersionDto: ItemVersionDto): Promise<ItemVersionDto> {
		const sql = await this.databaseService.getSQL();

		let result: InternalDatabaseItemVersion[] = [];
		try {
			result = await sql<InternalDatabaseItemVersion[]>`
          INSERT INTO item_versions(id, created_at, created_by, protected_data, item_id)
          VALUES (${itemVersionDto.id}, ${itemVersionDto.createdAt}, ${itemVersionDto.createdBy}, ${itemVersionDto.protectedData}, ${itemVersionDto.itemId})
          RETURNING *;
			`;
		}
		catch (e: any) {
			throw ItemsDatabaseService.getDatabaseError(e);
		}

		if (result.length > 0) {
			return ItemsDatabaseService.convertDatabaseItemVersionToDto(result[0]);
		}
		else {
			throw new SystemError({
				message: "Unexpected error returning item after creation",
			})
		}
	}

	async deleteVersion(versionId: string): Promise<void> {
		const sql = await this.databaseService.getSQL();

		let deleteResult: Postgres.RowList<Postgres.Row[]>;
		try {
			deleteResult = await sql`
          UPDATE item_versions
          SET (deleted_at, protected_data) = (now(), NULL)
          WHERE id = ${versionId}
          RETURNING *;
			`;
		}
		catch (e: any) {
			throw ItemsDatabaseService.getDatabaseError(e);
		}

		// If there's a count then rows were affected and the deletion was a success
		// If there's no count but an error wasn't thrown then the entity must not exist
		if (deleteResult && deleteResult.count) {
			return;
		}
		else {
			throw new ResourceNotFoundError({
				identifier: ErrorIdentifiers.RESOURCE_NOT_FOUND,
				applicationMessage: "The requested version could not be found."
			})
		}
	}

	async purgeVersion(versionId: string): Promise<void> {
		const sql = await this.databaseService.getSQL();

		let result: Postgres.RowList<Postgres.Row[]>;
		try {
			result = await sql`DELETE FROM item_versions WHERE id = ${versionId}`;
		}
		catch (e: any) {
			throw ItemsDatabaseService.getDatabaseError(e);
		}

		// If there's a count then rows were affected and the deletion was a success
		// If there's no count but an error wasn't thrown then the entity must not exist
		if (result && result.count) {
			return;
		}
		else {
			throw new ResourceNotFoundError({
				identifier: ErrorIdentifiers.RESOURCE_NOT_FOUND,
				applicationMessage: "The requested version could not be found."
			})
		}
	}
}
