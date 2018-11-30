import { Measure } from "../numberMeasure";

describe("Number measures", () => {
    const meters = Measure.dimension("length", "m");
    const seconds = Measure.dimension("time", "s");
    const mps = meters.per(seconds);
    const mps2 = mps.per(seconds);

    describe("dimension", () => {
        it("should create dimensions with value 1", () => {
            expect(Measure.dimension("foo", "f")).toEqual({ value: 1, unit: { foo: ["f", 1] }, symbol: "f" });
        });
    });

    describe("construction", () => {
        it("should construct from a number of and a unit", () => {
            const measure = Measure.of(10, mps2);
            expect(measure.value).toBe(10);
            expect(measure.unit).toEqual(mps2.unit);
        });

        it("should construct from a number and another measure", () => {
            const kilometer = Measure.of(1000, meters);
            const measure = Measure.of(5.2, kilometer);
            expect(measure.value).toBe(5200);
            expect(measure.unit).toEqual(meters.unit);
        });

        it("should construct dimensionless values", () => {
            const dimensionless = Measure.dimensionless(3);
            expect(dimensionless.value).toBe(3);
            expect(dimensionless.unit).toEqual({});
        });
    });

    describe("prefixes", () => {
        const kilo = Measure.prefix("k", 1000);

        it("should scale the base unit", () => {
            const km = kilo(meters);
            expect(km.unit).toEqual(meters.unit);
            expect(km.value).toBe(1000);
        });

        it("should apply a prefix when a symbol is present on the base unit", () => {
            expect(kilo(meters).symbol).toBe("km");
        });

        it("should not apply a prefix when a symbol is not present on the base unit", () => {
            const blargs = Measure.of(1e-3, meters);
            const kblargs = kilo(blargs);
            expect(kblargs.symbol).toBeUndefined();
            expect(kblargs.value).toBe(1);
        });
    });

    describe("math", () => {
        it("arithmetic", () => {
            expect(Measure.add(Measure.of(5, mps), Measure.of(-5, mps))).toEqual(Measure.of(0, mps));
            expect(Measure.subtract(Measure.of(5, mps), Measure.of(-5, mps))).toEqual(Measure.of(10, mps));
            expect(Measure.multiply(Measure.of(5, mps), Measure.of(10, seconds))).toEqual(Measure.of(50, meters));
            expect(Measure.divide(Measure.of(50, meters), Measure.of(10, seconds))).toEqual(Measure.of(5, mps));
        });

        it("abs", () => {
            expect(Measure.abs(Measure.of(-10, mps))).toEqual(Measure.of(10, mps));
        });

        it("cbrt", () => {
            expect(Measure.cbrt(Measure.of(64, seconds.cubed()))).toEqual(Measure.of(4, seconds));
        });

        it("ceil", () => {
            expect(Measure.ceil(Measure.of(3.4, mps))).toEqual(Measure.of(4, mps));
        });

        it("floor", () => {
            expect(Measure.floor(Measure.of(7.8, mps))).toEqual(Measure.of(7, mps));
        });

        it("hypot", () => {
            expect(Measure.hypot(Measure.of(3, meters), Measure.of(4, meters))).toEqual(Measure.of(5, meters));
        });

        it("max", () => {
            expect(Measure.max(Measure.of(10, mps), Measure.of(5, mps), Measure.of(15, mps))).toEqual(
                Measure.of(15, mps),
            );
        });

        it("min", () => {
            expect(Measure.min(Measure.of(10, mps), Measure.of(5, mps), Measure.of(15, mps))).toEqual(
                Measure.of(5, mps),
            );
        });

        it("round", () => {
            expect(Measure.round(Measure.of(7.8, mps))).toEqual(Measure.of(8, mps));
        });

        it("sqrt", () => {
            expect(Measure.sqrt(Measure.of(25, meters.squared()))).toEqual(Measure.of(5, meters));
        });

        it("sum", () => {
            expect(Measure.sum(Measure.of(10, mps), Measure.of(5, mps), Measure.of(15, mps))).toEqual(
                Measure.of(30, mps),
            );
        });

        it("trunc", () => {
            expect(Measure.trunc(Measure.of(-7.8, mps))).toEqual(Measure.of(-7, mps));
        });
    });

    describe("arithmetic", () => {
        it("should negate", () => {
            const value = Measure.of(10, mps);
            expect(value.negate()).toEqual(Measure.of(-10, mps));
        });

        it("should add", () => {
            const left = Measure.of(10, mps);
            const right = Measure.of(5, mps);
            expect(left.plus(right)).toEqual(Measure.of(15, mps));
        });

        it("should subtract", () => {
            const left = Measure.of(10, seconds);
            const right = Measure.of(5, seconds);
            expect(left.minus(right)).toEqual(Measure.of(5, seconds));
        });

        it("should multiply", () => {
            const left = Measure.of(10, mps);
            const right = Measure.of(5, seconds);
            expect(left.times(right)).toEqual(Measure.of(50, meters));
        });

        it("should divide", () => {
            const left = Measure.of(10, mps);
            const right = Measure.of(5, seconds);
            expect(left.over(right)).toEqual(Measure.of(2, mps2));
            expect(left.per(right)).toEqual(Measure.of(2, mps2));
            expect(left.div(right)).toEqual(Measure.of(2, mps2));
        });

        it("should scale", () => {
            const value = Measure.of(10, mps);
            expect(value.scale(2)).toEqual(Measure.of(20, mps));
        });

        it("should exponentiate", () => {
            const value = Measure.of(10, meters);

            expect(value.inverse()).toEqual(Measure.of(0.1, meters.inverse()));
            expect(value.reciprocal()).toEqual(Measure.of(0.1, meters.inverse()));
            expect(value.toThe(0)).toEqual(Measure.dimensionless(1));
            expect(value.toThe(1)).toEqual(Measure.of(10, meters));
            expect(value.squared()).toEqual(Measure.of(100, meters.squared()));
            expect(value.cubed()).toEqual(Measure.of(1000, meters.cubed()));
        });
    });

    describe("comparison", () => {
        const zero = Measure.of(0, meters);
        const five = Measure.of(5, meters);
        const ten = Measure.of(10, meters);

        it("should compare less than", () => {
            expect(five.lt(zero)).toBe(false);
            expect(five.lt(five)).toBe(false);
            expect(five.lt(ten)).toBe(true);
        });

        it("should compare less than or equal to", () => {
            expect(five.lte(zero)).toBe(false);
            expect(five.lte(five)).toBe(true);
            expect(five.lte(ten)).toBe(true);
        });

        it("should compare equal to", () => {
            expect(five.eq(zero)).toBe(false);
            expect(five.eq(five)).toBe(true);
            expect(five.eq(ten)).toBe(false);
        });

        it("should compare not equal to", () => {
            expect(five.neq(zero)).toBe(true);
            expect(five.neq(five)).toBe(false);
            expect(five.neq(ten)).toBe(true);
        });

        it("should compare greater than or equal to", () => {
            expect(five.gte(zero)).toBe(true);
            expect(five.gte(five)).toBe(true);
            expect(five.gte(ten)).toBe(false);
        });

        it("should compare greater than", () => {
            expect(five.gt(zero)).toBe(true);
            expect(five.gt(five)).toBe(false);
            expect(five.gt(ten)).toBe(false);
        });
    });

    describe("symbols", () => {
        it("should assign a symbol via .of()", () => {
            expect(Measure.of(1000, meters, "km").symbol).toBe("km");
        });

        it("should copy assign a symbol via .withSymbol()", () => {
            const original = Measure.of(1000, meters);
            const result = original.withSymbol("km");
            expect(result).not.toBe(original);
            expect(original.symbol).toBeUndefined();
            expect(result.symbol).toBe("km");
        });

        it("should not pass along symbols through operations", () => {
            const km = Measure.of(1000, meters.squared()).withSymbol("km2");
            const dm = Measure.of(10, meters.squared()).withSymbol("dm2");
            expect(km.negate().symbol).toBeUndefined();
            expect(km.squared().symbol).toBeUndefined();
            expect(km.inverse().symbol).toBeUndefined();
            expect(km.plus(dm).symbol).toBeUndefined();
            expect(km.minus(dm).symbol).toBeUndefined();
            expect(km.times(dm).symbol).toBeUndefined();
            expect(km.over(dm).symbol).toBeUndefined();
        });
    });

    describe("formatting", () => {
        it("should format dimensionless units", () => {
            expect(Measure.dimensionless(10).toString()).toBe("10");
        });

        it("should format base units", () => {
            expect(meters.toString()).toBe("1 m");
            expect(Measure.of(5.3, meters).toString()).toBe("5.3 m");
        });

        it("should format complex units", () => {
            expect(Measure.of(5, meters.squared()).toString()).toBe("5 m^2");
            expect(Measure.of(5, seconds.inverse()).toString()).toBe("5 s^-1");
            expect(Measure.of(5, meters.times(seconds)).toString()).toBe("5 m * s");
            expect(Measure.of(5, meters.over(seconds)).toString()).toBe("5 m * s^-1");
            expect(Measure.of(5, meters.cubed().over(seconds)).toString()).toBe("5 m^3 * s^-1");
            expect(Measure.of(5, meters.cubed().over(seconds.squared())).toString()).toBe("5 m^3 * s^-2");
        });

        it("should have consistent formatting no matter how the unit is constructed", () => {
            const metersTimesSecond = "5 m * s";
            expect(Measure.of(5, meters.times(seconds)).toString()).toBe(metersTimesSecond);
            expect(Measure.of(5, seconds.times(meters)).toString()).toBe(metersTimesSecond);

            const metersPerSecond = "5 m * s^-1";
            expect(Measure.of(5, meters.per(seconds)).toString()).toBe(metersPerSecond);
            expect(Measure.of(5, seconds.inverse().times(meters)).toString()).toBe(metersPerSecond);
        });

        it("should not format using symbol even if present", () => {
            expect(
                Measure.of(5, meters.squared())
                    .withSymbol("m2")
                    .toString(),
            ).toBe("5 m^2");
            expect(
                Measure.dimensionless(0)
                    .withSymbol("rad")
                    .toString(),
            ).toBe("0");
        });

        it("should format measures as other measures with symbols", () => {
            const glorbs = Measure.of(100, meters, "glb");
            expect(Measure.of(1000, meters).in(glorbs)).toBe("10 glb");
        });

        it("should use normal formatting if the other measure has no symbol", () => {
            const glorbs = Measure.of(100, meters);
            expect(Measure.of(1000, meters).in(glorbs)).toBe("1000 m");
        });

        it("should use base unit symbols to format when available", () => {
            const m = Measure.dimension("test-length", "meter");
            const s = Measure.dimension("test-time", "second");
            expect(m.toString()).toBe("1 meter");
            expect(Measure.of(1, m.per(s)).toString()).toBe("1 meter * second^-1");
            expect(Measure.of(1, m.squared().per(s.squared())).toString()).toBe("1 meter^2 * second^-2");
        });
    });

    describe("utils", () => {
        it("should clone", () => {
            const original = Measure.of(100, meters);
            const copy = original.clone();
            expect(original).not.toBe(copy);
            expect(original).toEqual(copy);
        });
    });
});
