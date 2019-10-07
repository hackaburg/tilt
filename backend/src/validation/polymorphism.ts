import { plainToClass, Transform } from "class-transformer";

type IAnyClass = new (...args: any[]) => any;

/**
 * Transforms the given array value to the types parsed from the given callback.
 * @param parseTypes A function to parse the types of the given array
 */
export function ArrayType<TBaseType extends object>(
  parseTypes: (values: TBaseType[]) => ReadonlyArray<IAnyClass>,
) {
  return Transform((values: TBaseType[]) => {
    if (!Array.isArray(values)) {
      return null;
    }

    const types = parseTypes(values);

    if (types.length !== values.length) {
      throw new TypeError(
        `can't transform ${values.length} to ${types.length} types`,
      );
    }

    const containsUndefined = types.some((type) => type === undefined);

    if (containsUndefined) {
      throw new TypeError("parsed types contain undefined");
    }

    return values.map((value, index) => plainToClass(types[index], value));
  });
}
