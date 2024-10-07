import {z} from "zod";
import {createDateField, createIdField, ProtectedDataField} from "../common/fields";

export const ItemVersionDto = z.object({
  id: createIdField(),
  itemId: createIdField("itemId"),
  createdAt: createDateField('createdAt'),
  createdBy: z.string()
    .min(1, "createdBy must be at least 1 character.")
    .max(20, "createdBy can't be over 20 characters."),
  // Data is nullable because it will be removed once the version is deleted.
  protectedData: ProtectedDataField.nullable(),
  deletedAt: createDateField('deletedAt').nullable(),
}).strict()
export type ItemVersionDto = z.infer<typeof ItemVersionDto>;
