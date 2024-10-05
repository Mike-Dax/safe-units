import { Measure, seconds, wrapUnaryFn } from "safe-units";

// START
const measureAbs = wrapUnaryFn(Math.abs);
const time = Measure.from(-30, seconds);
measureAbs(time); // 30 s
// END
