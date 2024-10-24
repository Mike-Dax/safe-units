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
const PERFECT_EXPONENT_WORD_MATCH = 2

const PARTIAL_PREFIX_SYMBOL_MATCH = 1.5
const PARTIAL_PREFIX_NAME_MATCH = 2
const PARTIAL_MEASURE_SYMBOL_MATCH = 1.8
const PARTIAL_MEASURE_NAME_MATCH = 2
const PARTIAL_MEASURE_ALIAS_MATCH = 1.9
const PARTIAL_EXPONENT_WORD_MATCH = 1.7

const MAX_LEVENSHTEIN_DISTANCE = 3

const END_ON_PREFIX_PENALTY = 0.1
const CASE_MISMATCH_PENALTY = 0.283

const POWER_MATCH_SCORE = 1.5

export type MeasureAlias<N, Basis, U extends Unit<Basis>, AllowedPrefixes extends PrefixMask> = {
  text: string[]
  measure: GenericMeasure<N, Basis, U, AllowedPrefixes>
}

export type Result = {
  measure: GenericMeasure<any, any, any, any>
  score: number
}

/**
 * Build a singular non-compound measure, with an optional prefix and exponent
 */
type Partial = {
  score: number
  leftovers: string

  prefix?: PrefixFn<any, any>
  measure?: GenericMeasure<any, any, any, any>
  exponent?: number
}

const nameFormatter = Measure.createMeasureFormatter({
  unitText: "name",
  times: " ",
  per: " per ",
  pow: "name",
  parentheses: false,
})

const symbolFormatter = Measure.createMeasureFormatter()

type PartialSuperposition = Partial[]

/**
 * Recursively parse an empty partial into a series of partial options.
 */
function recursivelyParsePartial(
  partial: Partial,
  getMeasureMatches: (str: string) => MeasureMatch[],
  getPrefixFnMatches: (str: string) => PrefixFnMatch[],
  depth = 0,
): PartialSuperposition {
  // Terminate the recursion once the leftovers are empty
  if (partial.leftovers === "") {
    return [partial]
  }

  // console.log(`${"  ".repeat(depth)}parsing ${stringifyPartial(partial)} at depth ${depth}`)

  // Try to match at this level, branching into a breadth first search
  const branchedPartials: PartialSuperposition = []

  // Match on measures
  if (!partial.measure) {
    const measureMatches = getMeasureMatches(partial.leftovers)

    for (const measureMatch of measureMatches) {
      const measure = measureMatch.match

      branchedPartials.push(
        ...recursivelyParsePartial(
          {
            score: partial.score * measureMatch.score,
            leftovers: measureMatch.leftovers,
            prefix: partial.prefix,
            measure,
            // exponent: partial.exponent, // won't exist
          },
          getMeasureMatches,
          getPrefixFnMatches,
          depth + 1,
        ),
      )
    }
  }

  // Match on prefixes, prefixes must precede measures
  if (!partial.prefix && !partial.measure) {
    const prefixMatches = getPrefixFnMatches(partial.leftovers)

    for (const prefixMatch of prefixMatches) {
      branchedPartials.push(
        ...recursivelyParsePartial(
          {
            score: partial.score * prefixMatch.score,
            leftovers: prefixMatch.leftovers,
            prefix: prefixMatch.prefix,
            measure: partial.measure,
            // exponent: partial.exponent, // won't exist
          },
          getMeasureMatches,
          getPrefixFnMatches,
          depth + 1,
        ),
      )
    }
  }

  // Match on exponents

  const exponentMatches = getExponentMatches(partial.leftovers)

  for (const exponentMatch of exponentMatches) {
    if (partial.measure) {
      // Apply it directly if possible
      branchedPartials.push(
        ...recursivelyParsePartial(
          {
            score: partial.score * exponentMatch.score,
            leftovers: exponentMatch.leftovers,
            prefix: partial.prefix,
            measure: partial.measure,
            exponent: exponentMatch.exponent,
          },
          getMeasureMatches,
          getPrefixFnMatches,
          depth + 1,
        ),
      )
    } else {
      // Do a post-applied branch
      branchedPartials.push(
        ...recursivelyParsePartial(
          {
            score: partial.score * exponentMatch.score,
            leftovers: exponentMatch.leftovers,
            prefix: undefined,
            measure: undefined,
            exponent: exponentMatch.exponent,
          },
          getMeasureMatches,
          getPrefixFnMatches,
          depth + 1,
        ),
      )
    }
  }

  // console.log(
  //   `${"<-".repeat(depth)}parsed [${branchedPartials
  //     .map(partial => {
  //       const result = assemblePartial(partial)
  //       if (!result) return null
  //       return stringifyResult(result)
  //     })
  //     .filter(str => str !== null)
  //     .join(", ")}]`,
  // )

  return branchedPartials
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
  const measureAliases = new Trie(aliases ?? [], PERFECT_MEASURE_ALIAS_MATCH, PARTIAL_MEASURE_ALIAS_MATCH)

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

    /*
    // Deduplicate measures, use the highest scoring one when they have the same
    const measureResultMap = new Map<GenericMeasure<any, any, any, any>, (typeof nameResults)[number]>()

    for (const result of [...nameResults, ...aliasResults, ...symbolResults]) {
      if (measureResultMap.has(result.result.measure)) {
        const cached = measureResultMap.get(result.result.measure)!

        // pick the highest scoring result
        if (result.score > cached.score) {
          measureResultMap.set(result.result.measure, result)
        }

        continue
      }

      measureResultMap.set(result.result.measure, result)
    }

    // Sort results by score in descending order
    const combinedResults = [...measureResultMap.values()]
      .sort((a, b) => b.score - a.score)
      .map(result => ({
        match: result.result.measure,
        score: result.score,
        leftovers: str.slice(result.match.length),
      }))
*/

    // Sort results by score in descending order
    const combinedResults = [...nameResults, ...aliasResults, ...symbolResults]
      // .sort((a, b) => b.score - a.score)
      .map(result => ({
        match: result.result.measure,
        score: result.score,
        leftovers: str.slice(result.match.length),
      }))

    // console.log(
    //   `measure str ${str} matches`,
    //   combinedResults.map(
    //     result =>
    //       `${result.match.format(false, nameFormatter)} score ${result.score}${result.leftovers ? ` with leftovers ${result.leftovers}` : ``}`,
    //   ),
    // )

    return combinedResults
  }

  function getPrefixFnMatches(str: string): PrefixFnMatch[] {
    // Match the string against the list of prefixes, this may include prefixes
    // that can't be applied to the next measure, they will be filtered out at a later stage

    // Allow up to 2 transpositions
    const nameResults = prefixNames.match(str, 2)

    // Allow up to one case insensitivity
    const symbolResults = prefixSymbols.match(str, 0.5)
    /*
    // Deduplicate prefixes, use the highest scoring one
    const prefixResultMap = new Map<RelaxedPrefixFn, (typeof nameResults)[number]>()

    for (const result of [...nameResults, ...symbolResults]) {
      if (prefixResultMap.has(result.result.prefix)) {
        const cached = prefixResultMap.get(result.result.prefix)!

        // pick the highest scoring result
        if (result.score > cached.score) {
          prefixResultMap.set(result.result.prefix, result)
        }

        continue
      }

      prefixResultMap.set(result.result.prefix, result)
    }

    // Sort results by score in descending order
    const combinedResults = [...prefixResultMap.values()]
      .sort((a, b) => b.score - a.score)
      .map(result => ({
        prefix: result.result.prefix as PrefixFn<any, any>,
        score: result.score,
        leftovers: str.slice(result.match.length),
      }))
*/

    const combinedResults = [...nameResults, ...symbolResults.values()]
      // .sort((a, b) => b.score - a.score)
      .map(result => ({
        prefix: result.result.prefix as PrefixFn<any, any>,
        score: result.score,
        leftovers: str.slice(result.match.length),
      }))

    // console.log(
    //   `prefix str ${str} matches`,
    //   combinedResults.map(
    //     result =>
    //       `${result.prefix.prefixName} score ${result.score}${result.leftovers ? ` with leftovers ${result.leftovers}` : ``}`,
    //   ),
    // )

    return combinedResults
  }

  return query => {
    // Split on "/", " per " and "p"
    const unparsedLevels = query.split(/\/| per |p/)

    // console.log(`autocomplete unparsedLevels:`, unparsedLevels)

    const levels: Result[][] = []

    /**
     * Split on vertical delimiters first
     * [millimeter kilograms] per [second]
     * ^        ^
     */
    for (const unparsedLevel of unparsedLevels) {
      // Split on whitespace, remove zero-length slices, trimming the strings
      const splitOnWhitespace = unparsedLevel.split(/\s+/).filter(slice => slice.length > 0)

      const partialSuperpositions: PartialSuperposition[] = []

      /**
       * Split on horizontal delimiters next
       * [millimeter] [kilograms] per [second]
       * ^            ^               ^
       */
      // console.log(`autocomplete splitOnWhitespace:`, splitOnWhitespace)
      for (const unparsedPartial of splitOnWhitespace) {
        const initialPartial: Partial = {
          score: 1,
          leftovers: unparsedPartial,
          prefix: undefined,
          measure: undefined,
          exponent: undefined,
        }
        const partialSuperposition = recursivelyParsePartial(initialPartial, getMeasureMatches, getPrefixFnMatches)

        // Deduplicate identical superpositions

        // console.log(
        //   `parsed partial into following options`,
        //   partialSuperposition.map(res => stringifyPartial(res)),
        // )

        partialSuperpositions.push(partialSuperposition)
      }

      // Also parse raw without split spaces
      // partialSuperpositions.push(
      //   recursivelyParsePartial(
      //     {
      //       score: 1,
      //       leftovers: unparsedLevel.trim(),
      //       prefix: undefined,
      //       measure: undefined,
      //       exponent: undefined,
      //     },
      //     getMeasureMatches,
      //     getPrefixFnMatches,
      //   ),
      // )

      // Build the possible results for this level
      const levelResults: Result[] = combineLevelPartialSuperpositions(partialSuperpositions)

      // console.log(
      //   `parsed level into partialSuperPositions`,
      //   levelResults.map(res => stringifyResult(res)),
      // )

      // Parse aliases without whitespace delimiting
      const aliasMatched = measureAliases.match(unparsedLevel)
      levelResults.push(
        ...aliasMatched.map(result => ({
          measure: result.result.measure,
          score: result.score * 10,
        })),
      )

      // Build each level of superpositions
      levels.push(levelResults)
    }

    const results: Result[] = []
    collapseLevelSuperpositions(results, levels, 0, [])

    // console.log(
    //   `final level superpositions`,
    //   results.map(res => stringifyResult(res)),
    // )

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

    console.log(
      `final predictions for query ${query}`,
      results.map(result => stringifyResult(result)),
    )

    return results
  }
}

const exponentiationWords = new Trie(
  [
    {
      text: ["squared"],
      exp: 2,
    },
    {
      text: ["cubed"],
      exp: 3,
    },
  ],
  PERFECT_EXPONENT_WORD_MATCH,
  PARTIAL_EXPONENT_WORD_MATCH,
)

function getExponentMatches(str: string): ExponentMatch[] {
  // Match the string against the list of prefixes

  // both ^2 and 'squared'

  const matches: ExponentMatch[] = []

  // Match ^2, ^3 etc
  const powerMatch = str.match(/^\^(\d+)(.*)/)
  if (powerMatch) {
    matches.push({
      exponent: parseInt(powerMatch[1], 10),
      score: POWER_MATCH_SCORE,
      leftovers: powerMatch[2],
    })
  }

  // Match squared/cubed/etc
  for (const result of exponentiationWords.match(str, 2)) {
    matches.push({
      exponent: result.result.exp,
      score: result.score,
      leftovers: str.slice(result.match.length),
    })
  }

  // Match unicode superscript characters like ², ³, ¹², etc
  const unicodeMatch = str.match(/^([¹²³⁴⁵⁶⁷⁸⁹⁰]+)(.*)/)
  if (unicodeMatch) {
    const digitMap: Record<string, string> = {
      "⁰": "0",
      "¹": "1",
      "²": "2",
      "³": "3",
      "⁴": "4",
      "⁵": "5",
      "⁶": "6",
      "⁷": "7",
      "⁸": "8",
      "⁹": "9",
    }
    const exponent = parseInt(
      unicodeMatch[1]
        .split("")
        .map(c => digitMap[c])
        .join(""),
      10,
    )
    matches.push({
      exponent,
      score: POWER_MATCH_SCORE,
      leftovers: unicodeMatch[2],
    })
  }

  // console.log(`exponent match ${str}`, matches)

  return matches
}

/**
 * Recursively generate all possible combinations of Results by combining levels with .over()
 */
function collapseLevelSuperpositions(
  results: Result[],
  levels: Result[][],
  depth: number,
  currentCombination: Result[],
): void {
  // All slots filled
  if (depth === levels.length) {
    // Need at least one level
    if (currentCombination.length === 0) return

    // Start with first level
    let result = currentCombination[0]

    // Combine with remaining levels using .over()
    for (let i = 1; i < currentCombination.length; i++) {
      const level = currentCombination[i]
      result = {
        measure: result.measure.over(level.measure),
        score: result.score * level.score,
      }
    }

    results.push(result)
    return
  }

  // Try each option for the current level
  const currentLevel = levels[depth]
  for (const result of currentLevel) {
    currentCombination[depth] = result
    collapseLevelSuperpositions(results, levels, depth + 1, currentCombination)
  }
}

function collapsePartialSuperpositions(
  results: Result[],
  partialSuperpositions: PartialSuperposition[],
  depth: number,
  currentCombination: Partial[],
): void {
  // All slots filled
  if (depth === partialSuperpositions.length) {
    // Try to assemble the combination into a result
    const firstPartial = currentCombination[0]
    if (!firstPartial) return

    let result: Result = assemblePartial(firstPartial)!

    if (!result) return

    // Combine with remaining partials
    for (let i = 1; i < currentCombination.length; i++) {
      const partial = currentCombination[i]

      // Apply exponents to the previous partial
      if (partial.exponent) {
        result = {
          measure: result.measure.pow(partial.exponent),
          score: result.score * partial.score,
        }

        continue
      }

      const nextResult = assemblePartial(partial)
      if (!nextResult) return

      result = {
        measure: result.measure.times(nextResult.measure),
        score: result.score * nextResult.score,
      }
    }

    results.push(result)
    return
  }

  // Try each option for the current slot
  const currentSlot = partialSuperpositions[depth]
  for (const partial of currentSlot) {
    currentCombination[depth] = partial
    collapsePartialSuperpositions(results, partialSuperpositions, depth + 1, currentCombination)
  }
}

function combineLevelPartialSuperpositions(partialSuperpositions: PartialSuperposition[]): Result[] {
  const results: Result[] = []
  collapsePartialSuperpositions(results, partialSuperpositions, 0, [])
  return results
}

function stringifyPartialSuperpositions(partialSuperpositions: PartialSuperposition[]) {
  const combined = partialSuperpositions
    .map(superpositions => {
      const options = superpositions
        .map(partial => {
          const result = assemblePartial(partial)
          if (!result) return null
          return stringifyResult(result)
        })
        .filter(str => str !== null)
        .join(", ")

      return `[${options}]`
    })
    .join("\n")

  return `[\n${combined}\n]`
}

function stringifyUnit(measure: Measure<any, any, any>) {
  const candidatePluralName = measure.format(true, nameFormatter)
  const candidateSymbol = measure.format(true, symbolFormatter)

  return `${candidatePluralName} (${candidateSymbol})`
}

function stringifyResult(result: Result) {
  const candidatePluralName = result.measure.format(true, nameFormatter)
  const candidateSymbol = result.measure.format(true, symbolFormatter)

  return `${candidatePluralName} (${candidateSymbol}) score ${Math.round(result.score)}`
}

function assemblePartial(partial: Partial): Result | null {
  if (!partial.measure) return null

  const result: Result = {
    measure: partial.measure,
    score: partial.score,
  }

  if (partial.prefix) {
    if (!partial.prefix.canApply(result.measure)) return null
    result.measure = partial.prefix(result.measure)
  }

  if (partial.exponent !== undefined) {
    result.measure = result.measure.pow(partial.exponent)
  }

  return result
}

function stringifyPartial(partial: Partial) {
  if (!partial.prefix && !partial.measure && !partial.exponent) {
    return `raw leftovers "${partial.leftovers}"`
  }

  if (partial.prefix && !partial.measure) {
    return `prefix ${partial.prefix.prefixName} and leftovers "${partial.leftovers}"`
  }

  const res = assemblePartial(partial)
  if (!res) return `invalid?`
  const strRes = stringifyResult(res)

  if (partial.leftovers !== "") {
    return `${strRes} and leftovers "${partial.leftovers}"`
  }

  return `${strRes} no leftovers`
}
