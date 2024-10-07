import {z} from "zod";
import {ResourceListingParams} from "../common/params";
import {ItemDto} from "./items";

export const ItemsURLParams = z.object({
  itemId: z.string().uuid("itemId must be a uuid"),
}).strict();
export type ItemsURLParams = z.infer<typeof ItemsURLParams>;

export const ItemsQueryParams =
  z.union([
    ResourceListingParams.extend({
      ids: z.array(ItemDto.shape.id).optional()
    }).strict(),
    ResourceListingParams.extend({
      types: z.array(ItemDto.shape.type).optional(),
    }).strict(),
  ])
export type ItemsQueryParams = z.infer<typeof ItemsQueryParams>;
