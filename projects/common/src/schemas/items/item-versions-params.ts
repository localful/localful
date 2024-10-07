import {z} from "zod";
import {createIdField} from "../common/fields";
import {ResourceListingParams} from "../common/params";
import {ItemVersionDto} from "./item-versions";

export const ItemVersionsURLParams = z.object({
  versionId: createIdField("versionId"),
}).strict();
export type ItemVersionsURLParams = z.infer<typeof ItemVersionsURLParams>;

export const ItemVersionsQueryParams =
  z.union([
    ResourceListingParams.extend({
      ids: z.array(ItemVersionDto.shape.id).optional()
    }).strict(),
    ResourceListingParams.extend({
      deviceNames: z.array(ItemVersionDto.shape.deviceName).optional(),
      itemIds: z.array(ItemVersionDto.shape.itemId).optional(),
    }).strict(),
  ])
export type ItemVersionsQueryParams = z.infer<typeof ItemVersionsQueryParams>;
