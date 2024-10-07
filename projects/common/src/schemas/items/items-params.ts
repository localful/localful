import {z} from "zod";

export const ItemsURLParams = z.object({
  itemId: z.string().uuid("itemId must be a uuid"),
}).strict();
export type ItemsURLParams = z.infer<typeof ItemsURLParams>;
