import { classToPlain } from "class-transformer";

/**
 * Encode the given data as JSON, using class-transformer.
 * @param data The data to encode
 */
export const toPrettyJson = (data: any) =>
  JSON.stringify(classToPlain(data), null, 2);
