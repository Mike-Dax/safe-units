export type PrefixMask = {
  [key: string]: boolean
}

export type MarkMaskAsUsed<M extends PrefixMask> = {
  [K in keyof M]: false
}

export type IdentityMask<M extends PrefixMask> = Readonly<{
  [K in keyof M]: M[K]
}>

export const NO_PREFIX_ALLOWED = {} as PrefixMask
