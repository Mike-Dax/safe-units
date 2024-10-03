import { Negate, Add, Subtract, Multiply } from "ts-arithmetic"

export type Negative<N extends number> = Negate<N>

export type AddIntegers<Left extends number, Right extends number> = Add<Left, Right>

export type SubtractIntegers<Left extends number, Right extends number> = Subtract<Left, Right>

export type MultiplyIntegers<Left extends number, Right extends number> = Multiply<Left, Right>
