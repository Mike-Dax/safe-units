import { PrefixFn } from "../measure/genericMeasureUtils"
import { Measure } from "../measure/numberMeasure"
import { bits } from "./base"
import { mega, milli, volts } from "./metric"
import { Memory } from "./quantities"

export const bytes: Memory = Measure.of(8, bits, "byte", "bytes", "B", {
  PREFIX_BINARY_MULTIPLE: true,
  PREFIX_SI_MULTIPLE: true, // Also allow 'kilo' bytes, etc
})

export const ALLOW_BINARY_MULTIPLE_PREFIX = {
  PREFIX_BINARY_MULTIPLE: true,
} as const
export type BinaryPrefix = typeof ALLOW_BINARY_MULTIPLE_PREFIX

// HACKHACK: Explicitly type this so we can import PrefixFunction and avoid absolute paths in the generated typings.
export const kibi: PrefixFn<BinaryPrefix> = Measure.prefix("kibi", "Ki", 1 << 10, ALLOW_BINARY_MULTIPLE_PREFIX)
export const mebi: PrefixFn<BinaryPrefix> = Measure.prefix("mebi", "Mi", 1 << 20, ALLOW_BINARY_MULTIPLE_PREFIX)
export const gibi: PrefixFn<BinaryPrefix> = Measure.prefix("gibi", "Gi", 1 << 30, ALLOW_BINARY_MULTIPLE_PREFIX)
export const tebi: PrefixFn<BinaryPrefix> = Measure.prefix("tebi", "Ti", 1 << 40, ALLOW_BINARY_MULTIPLE_PREFIX)
export const pibi: PrefixFn<BinaryPrefix> = Measure.prefix("pibi", "Pi", 1 << 50, ALLOW_BINARY_MULTIPLE_PREFIX)
export const exbi: PrefixFn<BinaryPrefix> = Measure.prefix("exbi", "Ei", 1 << 60, ALLOW_BINARY_MULTIPLE_PREFIX)
export const zebi: PrefixFn<BinaryPrefix> = Measure.prefix("zebi", "Zi", 1 << 70, ALLOW_BINARY_MULTIPLE_PREFIX)
export const yobi: PrefixFn<BinaryPrefix> = Measure.prefix("yobi", "Yi", 1 << 80, ALLOW_BINARY_MULTIPLE_PREFIX)

const MB = mega(bytes)
const MiB = mebi(bytes)
const MiBs = mega(MiB)
const MiBs2 = mega(MiBs)
const MMB = mega(MB)
const MMMB = milli(MMB)

const mV = mega(volts)
const miV = mebi(volts)

const milbYtes = milli(bytes)
