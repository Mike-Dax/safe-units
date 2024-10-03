import { AddIntegers, Negative, SubtractIntegers, MultiplyIntegers } from "./exponentTypeArithmetic"

export type Unit<Basis> = Readonly<Record<keyof Basis, number>>

export type DimensionlessUnit<Basis> = Record<keyof Basis, 0>

export type DimensionUnit<Basis, Dim extends keyof Basis> = Identity<{
  [Dimension in keyof Basis]: Dim extends Dimension ? 1 : 0
}>

export type MultiplyUnits<Basis, Left extends Unit<Basis>, Right extends Unit<Basis>> = Identity<{
  [Dimension in keyof Basis]: AddIntegers<Left[Dimension], Right[Dimension]>
}>

export type UnitToPower<Basis, U extends Unit<Basis>, Power extends number> = Identity<{
  [Dimension in keyof Basis]: MultiplyIntegers<U[Dimension], Power>
}>

export type SquareUnit<Basis, U extends Unit<Basis>> = UnitToPower<Basis, U, 2>

export type CubeUnit<Basis, U extends Unit<Basis>> = UnitToPower<Basis, U, 3>

export type DivideUnits<Basis, Left extends Unit<Basis>, Right extends Unit<Basis>> = Identity<{
  [Dimension in keyof Basis]: SubtractIntegers<Left[Dimension], Right[Dimension]>
}>

export type ReciprocalUnit<Basis, U extends Unit<Basis>> = Identity<{
  [Dimension in keyof Basis]: Negative<U[Dimension]>
}>

type Identity<U extends Unit<any>> = Readonly<{
  [K in keyof U]: U[K]
}>
