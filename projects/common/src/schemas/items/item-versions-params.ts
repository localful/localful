import {z} from "zod";
import {createIdField} from "../common/fields";
import {ResourceListingParams} from "../common/params";
import {ItemVersionDto} from "./item-versions";

export const ItemVersionsURLParams = z.object({
  versionId: createIdField("versionId"),
}).strict();
export type ItemVersionsURLParams = z.infer<typeof ItemVersionsURLParams>;

export const ItemVersionsParams = ResourceListingParams.extend({
  createdBy: z.array(ItemVersionDto.shape.createdBy).optional(),
  items: z.array(ItemVersionDto.shape.itemId).optional(),
  ids: z.array(ItemVersionDto.shape.id).optional()
}).strict();
export type ItemVersionsParams = z.infer<typeof ItemVersionsParams>;
