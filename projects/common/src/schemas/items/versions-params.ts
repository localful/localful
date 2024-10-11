import {z} from "zod";
import {createIdField} from "../common/fields";
import {ResourceListingParams} from "../common/listings";
import {VersionDto} from "./versions";

export const VersionsURLParams = z.object({
  versionId: createIdField("versionId"),
}).strict();
export type VersionsURLParams = z.infer<typeof VersionsURLParams>;

export const VersionsQueryByIdsParams = z.object({
  ids: z.array(VersionDto.shape.id)
}).strict()
export type VersionsQueryByIdsParams = z.infer<typeof VersionsQueryByIdsParams>;

export const VersionsQueryByFiltersParams = ResourceListingParams.extend({
  vaultId: createIdField("vaultId"),
  createdOn: z.array(VersionDto.shape.createdOn).optional(),
  itemId: z.array(VersionDto.shape.itemId).optional(),
}).strict()
export type VersionsQueryByFiltersParams = z.infer<typeof VersionsQueryByFiltersParams>;

export const VersionsQueryParams = z.union([VersionsQueryByIdsParams, VersionsQueryByFiltersParams])
export type VersionsQueryParams = z.infer<typeof VersionsQueryParams>;
