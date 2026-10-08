import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.resolve(__dirname, 'lc-cache.json');
const cache: Record<string, any> = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));

const EXTRA_SLUGS: Record<string, string> = {
  "maximum-subarray": "maximum-subarray",
  "contains-duplicate": "contains-duplicate",
  "lis": "longest-increasing-subsequence",
  "word-break": "word-break",
  "house-robber": "house-robber",
  "houe-robber-2": "house-robber-ii",
  "decode-ways": "decode-ways",
  "unique-paths": "unique-paths",
  "jumps-game": "jump-game",
  "edit-distance": "edit-distance",
  "flood-fill-algorithm": "flood-fill",
  "detect-cycle-in-an-undirected-graph": "course-schedule",
  "find-the-number-of-islands": "number-of-islands",
  "divide-two-integers": "divide-two-integers",
  "subsets": "subsets",
  "range-sum-query-immutable": "range-sum-query-immutable",
  "range-sum-query-mutable": "range-sum-query-mutable",
  "create-sorted-array-through-instructions": "create-sorted-array-through-instructions",
  "count-of-range-sum": "count-of-range-sum",
  "count-of-smaller-numbers-after-self": "count-of-smaller-numbers-after-self",
  "rotten-oranges": "rotting-oranges",
  "circular-tour": "gas-station",
  "next-larger-element": "next-greater-element-i",
  "topological-sort": "course-schedule-ii",
  "bipartitie-graph": "is-graph-bipartite",
  "check-for-balanced-tree": "balanced-binary-tree",
  "diameter-of-a-binary-tree": "diameter-of-binary-tree",
  "maximum-path-sum": "binary-tree-maximum-path-sum",
  "longest-common-substring": "longest-common-subsequence",
  "combination-sum-iv": "combination-sum-iv",
  "longest-repeating-subsequence": "longest-repeating-character-replacement",
  "matrix-chain-multiplication": "burst-balloons",
  "wildcard-string-matching": "wildcard-matching",
  "longest-prefix-suffix": "longest-happy-prefix",
  "minimum-number-of-jumps": "jump-game-ii",
};

async function fetchFromLeetCode(titleSlug: string) {
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
      body: JSON.stringify({
        query: `
          query questionData($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              questionId
              title
              titleSlug
              content
              difficulty
              codeSnippets {
                langSlug
                code
              }
              sampleTestCase
              exampleTestcaseList
            }
          }
        `,
        variables: { titleSlug },
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.question || null;
  } catch (err) {
    return null;
  }
}

async function run() {
  console.log('Retrying with expanded slug mappings...');
  let extraMatches = 0;

  for (const [key, slug] of Object.entries(EXTRA_SLUGS)) {
    if (!cache[key] || cache[key] === null) {
      const q = await fetchFromLeetCode(slug);
      if (q) {
        cache[key] = q;
        cache[slug] = q;
        extraMatches++;
        console.log(`✓ [Matched] ${key} -> ${slug} (${q.difficulty})`);
      } else {
        console.log(`- [Not Found] ${key} -> ${slug}`);
      }
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  console.log(`Saved ${extraMatches} additional matches to cache.`);
}

run();
