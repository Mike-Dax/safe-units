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

  public match(query: string, maxDistance = query.length, minimumLengthPartialPrefixMatch = 0): Result<R>[] {
    const results: Result<R>[] = []

    for (const item of this.contents) {
      this.matchOne(query, item, maxDistance, results, minimumLengthPartialPrefixMatch)
    }

    return results
  }

  private matchOne(
    query: string,
    potential: R,
    maxDistance: number,
    results: Result<R>[],
    minimumLengthPartialPrefixMatch: number,
  ): void {
    nextMatch: for (const potentialMatch of potential.text) {
      // Perfect prefix match
      if (query.startsWith(potentialMatch)) {
        // console.log(
        //   `query ${query} starts with ${potentialMatch}`,
        //   (potentialMatch.length / query.length) * this.perfectMatchScore,
        // )

        results.push({
          score: (potentialMatch.length / query.length) * this.perfectMatchScore,
          match: query.slice(0, potentialMatch.length),
          result: potential,
        })
      }

      // Partial prefix match
      for (let i = potentialMatch.length; i > minimumLengthPartialPrefixMatch; i--) {
        if (query.startsWith(potentialMatch.slice(0, i))) {
          const score = mapLinear(i, 0, potentialMatch.length, 1, this.partialMatchScore)

          //   console.log(`query ${query} starts with ${potentialMatch.slice(0, i)}`, score)

          results.push({
            score,
            match: query.slice(0, i),
            result: potential,
          })

          break
        }
      }

      // Compare the levenshtein distance of the entire rest, and if it's low, allow that
      if (query.length > maxDistance && maxDistance > 0) {
        const levenshteinDistance = levenshtein(query, potentialMatch, maxDistance)

        if (levenshteinDistance <= maxDistance) {
          // Require first letter match (case insensitive)
          // prevents things like meters becoming 'micrometers'
          if (query[0].toLowerCase() !== potentialMatch[0].toLowerCase()) {
            continue nextMatch
          }

          //   console.log(`levenshtein match: ${query} is ${levenshteinDistance} off ${potentialMatch}`)

          // Remap the distance to a score between 1 and the partialMatchScore
          const score = mapLinear(levenshteinDistance, maxDistance, 0, 0, this.partialMatchScore)

          // Consume the rest of the string
          results.push({
            score,
            match: query,
            result: potential,
          })

          continue nextMatch
        }
      }
    }
  }
}

type Result<R> = { score: number; match: string; result: R }

function levenshtein(str1: string, str2: string, maxDistance: number): number {
  // Early exit if the length difference exceeds maxDistance
  if (Math.abs(str1.length - str2.length) > maxDistance) {
    return Infinity
  }

  // Create matrix of size (str1.length + 1) x (str2.length + 1)
  const matrix: number[][] = []

  // Initialize first row
  for (let i = 0; i <= str1.length; i++) {
    matrix[i] = [i]
  }

  // Initialize first column
  for (let j = 0; j <= str2.length; j++) {
    matrix[0][j] = j
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= str1.length; i++) {
    let minInRow = Infinity
    for (let j = 1; j <= str2.length; j++) {
      // Check for exact match or case difference
      let cost = 1
      if (str1[i - 1] === str2[j - 1]) {
        cost = 0
      } else if (str1[i - 1].toLowerCase() === str2[j - 1].toLowerCase()) {
        cost = 0.25 // Lower cost for case difference
      }

      let minCost = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution or case switch
      )

      // Check for transposition (if we have at least 2 characters to compare)
      if (i > 1 && j > 1) {
        // Check both exact transposition and case-insensitive transposition
        const isTransposition =
          (str1[i - 1] === str2[j - 2] && str1[i - 2] === str2[j - 1]) ||
          (str1[i - 1].toLowerCase() === str2[j - 2].toLowerCase() &&
            str1[i - 2].toLowerCase() === str2[j - 1].toLowerCase())

        if (isTransposition) {
          // Cost of 0.5 for transposition instead of 2 separate operations
          minCost = Math.min(minCost, matrix[i - 2][j - 2] + 0.5)
        }
      }

      matrix[i][j] = minCost
      minInRow = Math.min(minInRow, minCost)
    }

    // Early exit if entire row exceeds maxDistance
    if (minInRow > maxDistance) {
      return Infinity
    }
  }

  return matrix[str1.length][str2.length]
}

function mapLinear(x: number, in_min: number, in_max: number, out_min: number, out_max: number) {
  return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
}
