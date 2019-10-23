export type Parameter<T> = T extends (arg: infer T) => any ? T : never;
export type Parameters<T> = T extends (...args: infer T) => any ? T : never;
