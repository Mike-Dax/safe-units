/**
 * Multiple pieces of text can point to the same Result,
 * only the highest scoring one will be picked for a match call.
 *
 * This is so we greedily match a plural of something over it's singular, then in
 * the next pass, a 's' token.
 */
export class Trie<R extends { text: string[] }> {
  constructor(
    private contents: R[],
    private perfectMatchScore: number,
    private partialMatchScore: number,
  ) {}

  public match(query: string, maxDistance = query.length): Result<R>[] {
    const results: Result<R>[] = []

    for (const item of this.contents) {
      const res = this.matchOne(query, item, maxDistance)
      if (res) {
        results.push(res)
      }
    }

    return results
  }

  private matchOne(query: string, potential: R, maxDistance: number): Result<R> | null {
    for (const potentialMatch of potential.text) {
      // Perfect prefix match
      if (query.startsWith(potentialMatch)) {
        // console.log(
        //   `${testingMeasure ? "measure" : "prefix"} ${testingName ? "name" : "symbol"}: perfect prefix match ${rest} to ${potentialMatch} with score ${perfectMatchScore}`
        // );
        return {
          score: this.perfectMatchScore,
          match: query.slice(0, potentialMatch.length),
          result: potential,
        }
      }

      // Partial prefix match
      for (let i = potentialMatch.length; i > 0; i--) {
        if (query.startsWith(potentialMatch.slice(0, i))) {
          const score = mapLinear(i, 0, potentialMatch.length, 1, this.partialMatchScore)
          // console.log(
          //   `${testingMeasure ? "measure" : "prefix"} ${testingName ? "name" : "symbol"}: partial prefix match ${rest} to ${potentialMatch} with subset ${potentialMatch.slice(0, i)} with score ${score}`
          // );

          return { score, match: query.slice(0, i), result: potential }
        }
      }

      // Compare the levenshtein distance of the entire rest, and if it's low, allow that
      if (maxDistance > 0) {
        const levenshteinDistance = levenshtein(query, potentialMatch)

        if (levenshteinDistance <= maxDistance) {
          // console.log(
          //   `${testingMeasure ? "measure" : "prefix"} ${testingName ? "name" : "symbol"}: levenshteinDistance ${rest} to ${potentialMatch} is ${levenshteinDistance}`
          // );
          // Remap the distance to a score between 1 and the partialMatchScore
          const score = mapLinear(levenshteinDistance, maxDistance, 0, 0, this.partialMatchScore)

          // Consume the rest of the string
          return { score, match: query, result: potential }
        }
      }
    }

    return null
  }
}

type Result<R> = { score: number; match: string; result: R }

function levenshtein(
  a: string,
  b: string,
  insertCost: number = 3,
  deleteCost: number = 2,
  substituteCost: number = 1,
): number {
  const an = a ? a.length : 0
  const bn = b ? b.length : 0

  if (an === 0) {
    return bn * insertCost
  }
  if (bn === 0) {
    return an * deleteCost
  }

  const matrix = new Array<number[]>(bn + 1)
  for (let i = 0; i <= bn; ++i) {
    const row = (matrix[i] = new Array<number>(an + 1))
    row[0] = i * insertCost
  }

  const firstRow = matrix[0]
  for (let j = 1; j <= an; ++j) {
    firstRow[j] = j * deleteCost
  }

  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + substituteCost, // substitution
          matrix[i][j - 1] + insertCost, // insertion
          matrix[i - 1][j] + deleteCost, // deletion
        )
      }
    }
  }

  return matrix[bn][an]
}

function mapLinear(x: number, in_min: number, in_max: number, out_min: number, out_max: number) {
  return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
}
