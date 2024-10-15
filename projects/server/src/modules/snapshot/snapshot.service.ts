import {UserContext} from "@common/request-context.js";
import {VaultsService} from "@modules/vaults/vaults.service.js";
import {ItemsService} from "@modules/items/items.service.js";

// todo: move snapshot types into @localful/common package

export interface VersionSnapshot {
	id: string
	deletedAt?: string
}

export interface ItemSnapshot {
	id: string
	type: string
	deletedAt?: string
	latestVersion?: string
	versions?: VersionSnapshot[]
}

export type Snapshot = ItemSnapshot[]


export class SnapshotService {
	constructor(
		private readonly vaultsService: VaultsService,
		private readonly itemsService: ItemsService,
	) {}

	async getSnapshot(userContext: UserContext, vaultId: string) {
		// Fetch the vault to ensure the user has permissions to access the given vault.
		// todo: add separate permission for fetching vault snapshot?
		await this.vaultsService.get(userContext, vaultId);

		const items = await this.itemsService._getAllItems(vaultId)

		const snapshot: Snapshot = []
		for (const item of items) {
			const versions = await this.itemsService._getAllVersions(item.id)

			const itemSnapshot: ItemSnapshot = {
				id: item.id,
				type: item.type,
			}

			if (item.deletedAt) {
				itemSnapshot.deletedAt = item.deletedAt
			}
			if (versions.length) {
				itemSnapshot.latestVersion = versions[0].id
				itemSnapshot.versions = versions.map((version) => {
					const versionSnapshot: VersionSnapshot = {
						id: version.id,
					}
					if (version.deletedAt) {
						versionSnapshot.deletedAt = version.deletedAt
					}

					return versionSnapshot
				})
			}

			snapshot.push(itemSnapshot)
		}

		return snapshot
	}
}
