import { AnyFunction } from './types/any-function';

export const isFunction = <T>(value: AnyFunction | T): value is AnyFunction => value instanceof Function;
