export type Parameters<T> = T extends (...args: infer T) => any ? T : never
