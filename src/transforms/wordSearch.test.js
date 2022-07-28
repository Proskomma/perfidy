import wordSearch from './wordSearch';
import perfWrapper from './__data__/perfWrapper';

const perf = perfWrapper({
  blocks: [
    {
      "type": "paragraph",
      "subtype": "usfm:p",
      "content": [
        {
          "type": "mark",
          "subtype": "chapter",
          "atts": {
            "number": "1"
          }
        },
        {
          "type": "mark",
          "subtype": "verses",
          "atts": {
            "number": "1"
          }
        },
        "I, Paul, ",
      ]
    },
  ]
});

const matchPaul = [
  {
    "chapter": "1",
    "verses": "1",
    "content": [
      "I",
      ", ",
      {
        type: "wrapper",
        subtype: "x-search-match",
        content: [
          'Paul'
        ]
      },
      ", ",
    ],
  },
]

const matchIPaul = [
  {
    "chapter": "1",
    "verses": "1",
    "content": [
      {
        type: "wrapper",
        subtype: "x-search-match",
        content: [
          'I'
        ]
      },
      ", ",
      {
        type: "wrapper",
        subtype: "x-search-match",
        content: [
          'Paul'
        ]
      },
      ", ",
    ],
  },
]

const matchI = [
  {
    "chapter": "1",
    "verses": "1",
    "content": [
      {
        type: "wrapper",
        subtype: "x-search-match",
        content: [
          'I'
        ]
      },
      ", ",
      "Paul",
      ", ",
    ],
  },
]

const tests = [
  // Case Insensitve Testing
  { searchString: 'paul', ignoreCase: '1', partialMatch: '0', logic: '', regex: '0', perf, expect: matchPaul },
  { searchString: 'pa?l', ignoreCase: '1', partialMatch: '0', logic: '', regex: '0', perf, expect: matchPaul },
  { searchString: 'p*l', ignoreCase: '1', partialMatch: '0', logic: '', regex: '0', perf, expect: matchPaul },
  { searchString: 'pau', ignoreCase: '1', partialMatch: '0', logic: '', regex: '0', perf, expect: [] },
  // Case Sensitive Testing
  { searchString: 'paul', ignoreCase: '0', partialMatch: '0', logic: '', regex: '0', perf, expect: [] },
  { searchString: 'Paul', ignoreCase: '0', partialMatch: '0', logic: '', regex: '0', perf, expect: matchPaul },
  { searchString: 'Pa?l', ignoreCase: '0', partialMatch: '0', logic: '', regex: '0', perf, expect: matchPaul },
  { searchString: 'Pa*l', ignoreCase: '0', partialMatch: '0', logic: '', regex: '0', perf, expect: matchPaul },
  { searchString: 'Pau*l', ignoreCase: '0', partialMatch: '0', logic: '', regex: '0', perf, expect: matchPaul },
  { searchString: 'P*l', ignoreCase: '0', partialMatch: '0', logic: '', regex: '0', perf, expect: matchPaul },
  // AND Logic Testing
  { searchString: 'paul', ignoreCase: '1', partialMatch: '0', logic: 'A', regex: '0', perf, expect: matchPaul },
  { searchString: 'i paul', ignoreCase: '1', partialMatch: '0', logic: 'A', regex: '0', perf, expect: matchIPaul },
  { searchString: 'i peter', ignoreCase: '1', partialMatch: '0', logic: 'A', regex: '0', perf, expect: [] },
  { searchString: 'i paul', ignoreCase: '0', partialMatch: '0', logic: 'A', regex: '0', perf, expect: [] },
  { searchString: 'I Paul', ignoreCase: '0', partialMatch: '0', logic: 'A', regex: '0', perf, expect: matchIPaul },
  // OR Logic Testing
  { searchString: 'paul', ignoreCase: '1', partialMatch: '0', logic: 'O', regex: '0', perf, expect: matchPaul },
  { searchString: 'i paul', ignoreCase: '1', partialMatch: '0', logic: 'O', regex: '0', perf, expect: matchIPaul },
  { searchString: 'i peter', ignoreCase: '1', partialMatch: '0', logic: 'O', regex: '0', perf, expect: matchI },
  { searchString: 'i paul', ignoreCase: '0', partialMatch: '0', logic: 'O', regex: '0', perf, expect: [] },
  { searchString: 'I Paul', ignoreCase: '0', partialMatch: '0', logic: 'O', regex: '0', perf, expect: matchIPaul },
  // Partial Match Testing
  { searchString: 'pau', ignoreCase: '1', partialMatch: '1', logic: 'O', regex: '0', perf, expect: matchPaul },
  { searchString: 'i pau', ignoreCase: '1', partialMatch: '1', logic: 'O', regex: '0', perf, expect: matchIPaul },
  { searchString: 'i peter', ignoreCase: '1', partialMatch: '1', logic: 'O', regex: '0', perf, expect: matchI },
  { searchString: 'i pau', ignoreCase: '0', partialMatch: '1', logic: 'O', regex: '0', perf, expect: [] },
  { searchString: 'I Pau', ignoreCase: '0', partialMatch: '1', logic: 'O', regex: '0', perf, expect: matchIPaul },
  { searchString: 'pau', ignoreCase: '1', partialMatch: '1', logic: '', regex: '0', perf, expect: matchPaul },
  { searchString: 'pau', ignoreCase: '0', partialMatch: '1', logic: '', regex: '0', perf, expect: [] },
  { searchString: 'Pau', ignoreCase: '0', partialMatch: '1', logic: '', regex: '0', perf, expect: matchPaul },
  // Regex Testing
  { searchString: 'I|l', ignoreCase: '0', partialMatch: '0', logic: '', regex: '1', perf, expect: matchIPaul },
  { searchString: '/I|l/', ignoreCase: '0', partialMatch: '0', logic: '', regex: '0', perf, expect: matchIPaul },
  { searchString: '/i|l/', ignoreCase: '1', partialMatch: '0', logic: '', regex: '0', perf, expect: matchIPaul },
]

describe('test wordSearch parameters', () => {
  for(const _test of tests) {
    const searchString = _test.searchString;
    const ignoreCase = _test.ignoreCase;
    const logic = _test.logic;
    const partialMatch = _test.partialMatch;
    const regex = _test.regex;
    const perf = _test.perf;
    const expectedResults = _test.expect;
    const testName = `${searchString}-ignoreCase=${ignoreCase}-logic=${logic}-partialMatch=${partialMatch}-regex=${regex}`;

    test(testName, () => {
      const results = wordSearch.code({perf, searchString, ignoreCase, logic, partialMatch, regex});
      expect(results.matches).toEqual(expectedResults);
    })
  }
});