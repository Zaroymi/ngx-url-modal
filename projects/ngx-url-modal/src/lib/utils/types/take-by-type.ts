/**
 * Create new type with properties from `Target` with type `ByType`
 */
export type TakeByType<Target, ByType> = {
    [Key in keyof Target]: Target[Key] extends ByType ? Key : never
}[keyof Target];
