import { AnyFunction } from './any-function';

/**
 * Create new type from SourceType.
 * @description
 * 1. If `SourceType[string]` extends `() => ReturnType` returns `[SourceType[string]]: ReturnType`
 * 2. Returns `SourceType[string]` otherwise.
 */
export type ComputeParams<SourceType> = SourceType extends object
    ? { [NAME in keyof SourceType]: SourceType[NAME] extends AnyFunction
        ? ReturnType<SourceType[NAME]>
        : SourceType[NAME]
    }
    : unknown;

/**
 * Create new type from SourceType.
 * @description
 * 1. If `SourceType[string]` extends `() => ReturnType` returns `[SourceType[string]]: ReturnType`
 * 2. If `SourceType[string]` extends `FROM` returns `[SourceType[string]]: TO`
 * 3. Returns `unknown` otherwise.
 */
export type ComputeParamsTo<SourceType, FROM, TO> = SourceType extends object
    ? { [NAME in keyof SourceType]: SourceType[NAME] extends AnyFunction
        ? ReturnType<SourceType[NAME]>
        : SourceType[NAME] extends FROM
            ? TO
            : unknown
    }
    : unknown;
