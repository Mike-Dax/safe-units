import { Trie } from "../trie"

interface Item {
  text: string
}

describe("Trie fuzzy matching", () => {
  const items: Item[] = [
    { text: "hello" },
    { text: "hallo" },
    { text: "hullo" },
    { text: "help" },
    { text: "hell" },
    { text: "helmet" },
    { text: "held" },
    { text: "hold" },
    { text: "folder" },
    { text: "soldier" },
    { text: "cold" },
  ]

  const trie = new Trie<Item>(items)

  it("matches exact word", () => {
    const results = trie.match("hello", 0)

    expect(results).toEqual([{ matchingPrefix: "hello", distance: 0, perfectMatch: true, result: { text: "hello" } }])
  })

  it("compresses matching prefixes in backwards order", () => {
    const trie = new Trie<Item>([{ text: "helps" }, { text: "help" }])

    console.log((trie as any).root)
  })

  it("finds close matches within distance", () => {
    const results = trie.match("helo", 1)

    expect(results).toEqual(
      expect.arrayContaining([
        { matchingPrefix: "hell", distance: 1, result: { text: "hell" }, perfectMatch: false },
        { matchingPrefix: "hello", distance: 1, result: { text: "hello" }, perfectMatch: false },
        { matchingPrefix: "help", distance: 1, result: { text: "help" }, perfectMatch: false },
        { matchingPrefix: "held", distance: 1, result: { text: "held" }, perfectMatch: false },
      ]),
    )
  })

  it("handles transpositions", () => {
    const results = trie.match("hlelo")
    expect(results).toEqual(
      expect.arrayContaining([
        { matchingPrefix: "hello", distance: 1, result: { text: "hello" }, perfectMatch: false },
      ]),
    )
  })

  it("does not match distant words", () => {
    const results = trie.match("xyz")
    expect(results).toEqual([])
  })

  it("returns nothing on empty query", () => {
    const results = trie.match("")
    expect(results).toEqual([])
  })

  it("handles multiple items with the same text", () => {
    const itemsWithDuplicates: Item[] = [{ text: "test" }, { text: "test" }, { text: "test" }]
    const trieWithDuplicates = new Trie<Item>(itemsWithDuplicates)
    const results = trieWithDuplicates.match("test")
    expect(results.length).toBe(3)
    results.forEach(result => {
      expect(result).toEqual({ matchingPrefix: "test", distance: 0, result: { text: "test" }, perfectMatch: true })
    })
  })

  it("handles case sensitivity", () => {
    const caseItems: Item[] = [{ text: "Hello" }, { text: "HELLO" }, { text: "hello" }]
    const caseTrie = new Trie<Item>(caseItems)
    const results = caseTrie.match("hello")
    expect(results.length).toBe(3)
    expect(results).toEqual(
      expect.arrayContaining([
        { distance: 0.5, matchingPrefix: "Hello", perfectMatch: false, result: { text: "Hello" } },
        { distance: 2.5, matchingPrefix: "HELLO", perfectMatch: false, result: { text: "HELLO" } },
        { distance: 0, matchingPrefix: "hello", perfectMatch: true, result: { text: "hello" } },
      ]),
    )
  })
})
