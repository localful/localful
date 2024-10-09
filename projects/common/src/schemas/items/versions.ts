import {z} from "zod";
import {createDateField, createIdField, ProtectedDataField} from "../common/fields";

export const VersionDto = z.object({
  id: createIdField(),
  itemId: createIdField("itemId"),
  createdAt: createDateField('createdAt'),
  deviceName: z.string()
    .min(1, "deviceName must be at least 1 character.")
    .max(20, "deviceName can't be over 20 characters."),
  // Data is nullable because it will be removed once the version is deleted.
  protectedData: ProtectedDataField.nullable(),
  deletedAt: createDateField('deletedAt').nullable(),
}).strict()
export type VersionDto = z.infer<typeof VersionDto>;
