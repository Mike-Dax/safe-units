import { GenericMeasure } from "./genericMeasure"
import { PrefixFn } from "./genericMeasureUtils"
import { Measure } from "./numberMeasure"
import { PrefixMask } from "./prefixMask"
import { Trie } from "./trie"
import { Unit } from "./unitTypeArithmetic"

const PERFECT_PREFIX_SYMBOL_MATCH = 5
const PERFECT_PREFIX_NAME_MATCH = 10
const PERFECT_MEASURE_SYMBOL_MATCH = 5
const PERFECT_MEASURE_NAME_MATCH = 10
const PERFECT_MEASURE_ALIAS_MATCH = 3

const PARTIAL_PREFIX_SYMBOL_MATCH = 1.5
const PARTIAL_PREFIX_NAME_MATCH = 2
const PARTIAL_MEASURE_SYMBOL_MATCH = 1.8
const PARTIAL_MEASURE_NAME_MATCH = 2
const PARTIAL_MEASURE_ALIAS_MATCH = 1.9

const MAX_LEVENSHTEIN_DISTANCE = 3

const END_ON_PREFIX_PENALTY = 0.1
const CASE_MISMATCH_PENALTY = 0.283

const POWER_MATCH_SCORE = 1.5

export type MeasureAlias<N, Basis, U extends Unit<Basis>, AllowedPrefixes extends PrefixMask> = {
  text: string[]
  measure: GenericMeasure<N, Basis, U, AllowedPrefixes>
}

type Partial = {
  measure: GenericMeasure<any, any, any, any>
  prefix?: PrefixFn<any, any>
  exponent?: number
}

export type Result = {
  measure: GenericMeasure<any, any, any, any>
  score: number
}

/**
 *
 */
type Tape = {
  partials: Partial[]
  score: number
  leftovers: string
  nextPrefix: PrefixFn<any, any> | null
}

const nameFormatter = Measure.createMeasureFormatter({
  unitText: "name",
  times: " ",
  per: " per ",
  pow: "name",
  parentheses: false,
})

const symbolFormatter = Measure.createMeasureFormatter()

/**
 *
 * @param tape
 * @param getMeasureMatches
 * @param getPrefixFnMatches
 * @returns
 */
function recursivelyParse(
  // Contains the partials so far
  tape: Tape,
  getMeasureMatches: (str: string) => MeasureMatch[],
  getPrefixFnMatches: (str: string) => PrefixFnMatch[],
): Tape[] {
  // Terminate the recursion once the leftovers are empty
  if (tape.leftovers === "") {
    // If this tape ended on a prefix, it's invalid, return nothing
    if (tape.nextPrefix) {
      return []
    }

    return [tape]
  }

  // Try to match at this level, branching our breadth first search into separate tapes
  const branchedTapes: Tape[] = []

  // Match on measures, spawning new partials
  const measureMatches = getMeasureMatches(tape.leftovers)

  skipMeasure: for (const measureMatch of measureMatches) {
    const measure = measureMatch.match

    // Don't duplicate measures within a tape
    for (const partial of tape.partials) {
      if (partial.measure === measure) {
        continue skipMeasure
      }
    }

    let prefix: PrefixFn<any, any> | undefined = undefined

    // Store the pre-loaded prefix if it exists and matches
    if (tape.nextPrefix) {
      if (!tape.nextPrefix.canApply(measure)) {
        // If the prefix can't apply to this measure, skip the measure
        continue
      }

      prefix = tape.nextPrefix
    }

    branchedTapes.push(
      ...recursivelyParse(
        {
          partials: [...tape.partials, { measure, prefix }], // spawn a new partial
          score: tape.score * measureMatch.score,
          leftovers: measureMatch.leftovers,
          nextPrefix: null,
        },
        getMeasureMatches,
        getPrefixFnMatches,
      ),
    )
  }

  // Match on prefixes, applied to the next measure
  if (!tape.nextPrefix) {
    const prefixMatches = getPrefixFnMatches(tape.leftovers)

    for (const prefixMatch of prefixMatches) {
      branchedTapes.push(
        ...recursivelyParse(
          {
            partials: [...tape.partials],
            score: tape.score * prefixMatch.score,
            leftovers: prefixMatch.leftovers,
            nextPrefix: prefixMatch.prefix,
          },
          getMeasureMatches,
          getPrefixFnMatches,
        ),
      )
    }
  }

  const lastPartial = tape.partials[tape.partials.length - 1]

  // Match on exponents, applied to the previous partial
  if (lastPartial && !lastPartial.exponent) {
    const exponentMatches = getExponentMatches(tape.leftovers)

    for (const exponentMatch of exponentMatches) {
      const newPartials = [
        ...tape.partials.slice(0, -1),
        {
          ...lastPartial,
          exponent: exponentMatch.exponent,
        },
      ]

      branchedTapes.push(
        ...recursivelyParse(
          {
            partials: newPartials,
            score: tape.score * exponentMatch.score,
            leftovers: exponentMatch.leftovers,
            nextPrefix: null,
          },
          getMeasureMatches,
          getPrefixFnMatches,
        ),
      )
    }
  }

  return branchedTapes
}

function debugPrintTape(tape: Tape) {
  const name = tapeToMeasure(tape)

  if (name) {
    return `${name.format(false, nameFormatter)} (${name.format(false, symbolFormatter)}) leftovers ${tape.leftovers} score ${Math.round(tape.score)}`
  }

  return null
}

/**
 * Convert a tape without leftovers into a Measure, or return null.
 */
function tapeToMeasure(tape: Tape): GenericMeasure<any, any, any, any> | null {
  if (tape.partials.length === 0 || tape.leftovers.trim() !== "") {
    return null
  }

  let result = tape.partials[0].measure

  for (let i = 0; i < tape.partials.length; i++) {
    const partial = tape.partials[i]

    if (partial.prefix) {
      result = partial.prefix(result)
    }

    if (partial.exponent !== undefined) {
      result = result.pow(partial.exponent)
    }

    if (i > 0) {
      result = result.times(tape.partials[i].measure)
    }
  }

  return result
}

/**
 * Combines a vertical slice of the combinatoral explosion into a singular result.
 */
function combineOver(verticalSlice: Tape[]): Result | null {
  if (verticalSlice.length === 0) {
    return null
  }

  let result: GenericMeasure<any, any, any, any> | null = null
  let score = 1

  for (let i = 0; i < verticalSlice.length; i++) {
    const measure = tapeToMeasure(verticalSlice[i])
    if (measure === null) {
      return null
    }

    if (i === 0) {
      result = measure
    } else {
      result = result!.over(measure)
    }

    score *= verticalSlice[i].score
  }

  if (result === null) {
    return null
  }

  return {
    measure: result,
    score: score,
  }
}

type MeasureMatch = { match: GenericMeasure<any, any, any, any>; score: number; leftovers: string }
type PrefixFnMatch = { prefix: PrefixFn<any, any>; score: number; leftovers: string }
type ExponentMatch = { exponent: number; score: number; leftovers: string }

type RelaxedPrefixFn = ((measure: GenericMeasure<any, any, any, any>) => GenericMeasure<any, any, any, any>) & {
  prefixName: string
  symbol: string
}

export function createAutoCompleter(
  measures: GenericMeasure<any, any, any, any>[],
  prefixes: RelaxedPrefixFn[],
  // Aliases must match a measure in the measures list
  aliases?: MeasureAlias<any, any, any, any>[],
): (query: string) => Result[] {
  // Setup state that will be re-used between queries

  // Build a prefix Trie for measure names

  // Map each Measure to both its plural and singular name, only one will be picked per level,
  // preferring the plural form
  const measureNames = new Trie(
    measures.map(measure => ({
      measure,
      text: [measure.format(true, nameFormatter), measure.format(false, nameFormatter)],
    })),
    PERFECT_MEASURE_NAME_MATCH,
    PARTIAL_MEASURE_NAME_MATCH,
  )

  // Aliases are handled separately
  const measureAliases = new Trie(aliases ?? [], PERFECT_MEASURE_SYMBOL_MATCH, PARTIAL_MEASURE_SYMBOL_MATCH)

  const measureSymbols = new Trie(
    measures.map(measure => ({ measure, text: [measure.format(false, symbolFormatter)] })),
    PERFECT_MEASURE_SYMBOL_MATCH,
    PARTIAL_MEASURE_SYMBOL_MATCH,
  )

  const prefixNames = new Trie(
    prefixes.map(prefix => ({ prefix, text: [prefix.prefixName] })),
    PERFECT_PREFIX_NAME_MATCH,
    PARTIAL_PREFIX_NAME_MATCH,
  )
  const prefixSymbols = new Trie(
    prefixes.map(prefix => ({ prefix, text: [prefix.symbol] })),
    PERFECT_PREFIX_SYMBOL_MATCH,
    PARTIAL_PREFIX_SYMBOL_MATCH,
  )

  function getMeasureMatches(str: string): MeasureMatch[] {
    // Match the string against the list of measures and aliases

    // Allow up to 2 transpositions
    const nameResults = measureNames.match(str, 2)

    const aliasResults = measureAliases.match(str, 1)

    // Allow up to one case insensitivity
    const symbolResults = measureSymbols.match(str, 0.5)

    // Combine results and calculate scores
    const combinedResults = [...nameResults, ...aliasResults, ...symbolResults].map(result => {
      const remainingStr = str.slice(result.match.length)

      return {
        match: result.result.measure,
        score: result.score,
        leftovers: remainingStr, // Adding leftovers property to match PrefixFnMatch type
      }
    })

    // Sort results by score in descending order
    combinedResults.sort((a, b) => b.score - a.score)

    return combinedResults
  }

  function getPrefixFnMatches(str: string): PrefixFnMatch[] {
    // Match the string against the list of prefixes

    // Allow up to 2 transpositions
    const nameResults = prefixNames.match(str, 2)

    // Allow up to one case insensitivity
    const symbolResults = prefixSymbols.match(str, 0.5)

    // Combine results and calculate scores
    const combinedResults = [...nameResults, ...symbolResults].map(result => {
      const remainingStr = str.slice(result.match.length)

      return {
        prefix: result.result.prefix as PrefixFn<any, any>,
        score: result.score,
        leftovers: remainingStr, // Adding leftovers property to match PrefixFnMatch type
      }
    })

    // Sort results by score in descending order
    combinedResults.sort((a, b) => b.score - a.score)

    return combinedResults
  }

  return query => {
    // Split on "/", " per " and "p"
    const unparsedLevels = query.split(/\/| per |p/)

    const levels: Tape[][] = []

    for (const unparsedLevel of unparsedLevels) {
      const initialTape: Tape = {
        partials: [],
        score: 1,
        leftovers: unparsedLevel,
        nextPrefix: null,
      }

      const levelOptions = recursivelyParse(initialTape, getMeasureMatches, getPrefixFnMatches)

      // Split on whitespace
      const whitespaceOptions = unparsedLevel.split(/\s+/)

      levels.push(levelOptions)
    }

    const results: Result[] = []

    generateCombinations(results, levels, 0, [])

    // Deduplicate results based on their name
    const dedup = new Map<string, Result>()

    for (const result of results) {
      const key = result.measure.format(false, nameFormatter)
      const existing = dedup.get(key)

      if (!existing || result.score > existing.score) {
        dedup.set(key, result)
      }
    }

    // Convert map values back to array
    results.length = 0
    results.push(...dedup.values())

    // Sort results by score in descending order
    results.sort((a, b) => b.score - a.score)

    return results
  }
}

function getExponentMatches(str: string): ExponentMatch[] {
  // Match the string against the list of prefixes
  return []
}

// Generate all possible combinations
const generateCombinations = (
  results: Result[],
  levels: Tape[][],
  currentIndex: number,
  currentCombination: Tape[],
): void => {
  if (currentIndex === levels.length) {
    const result = combineOver(currentCombination)
    if (result !== null) {
      results.push(result)
    }
    return
  }

  for (const option of levels[currentIndex]) {
    generateCombinations(results, levels, currentIndex + 1, [...currentCombination, option])
  }
}

// Need a 'superposition' node that can be multiple measures given some conditional
// temperature is a superposition of diff and thermo, but if it's multiplied or per'd, it collapses to difference

// Need aliases in measures

// Superposition ° for deg, degrees
// Superposition Δ for delta

function stringifyUnit(measure: Measure<any, any, any>) {
  const candidatePluralName = measure.format(true, nameFormatter)
  const candidateSymbol = measure.format(true, symbolFormatter)

  return `${candidatePluralName} (${candidateSymbol})`
}
