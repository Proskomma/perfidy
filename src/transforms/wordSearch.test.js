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
        "I",
        ", ",
        "Paul",
        ", ",
      ]
    },
  ]
});

describe('test wordSearch exact match', () => {
  const logic = '';

  test('ignore case succeeds', () => {
    const searchString = 'paul';
    const ignoreCase = '1';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual([
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
    ]);
  });

  test('ignore case succeeds with ?', () => {
    const searchString = 'pa?l';
    const ignoreCase = '1';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual([
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
    ]);
  });

  test('ignore case succeeds with *', () => {
    const searchString = 'p*l';
    const ignoreCase = '1';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual([
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
    ]);
  });

  test('ignore case fails partial', () => {
    const searchString = 'pau';
    const ignoreCase = '1';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual([ ]);
  });

  test('case sensitive fails on case mismatch', () => {
    const searchString = 'paul';
    const ignoreCase = '0';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual(
      []
    );
  });

  test('case sensitive succeeds', () => {
    const searchString = 'Paul';
    const ignoreCase = '0';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual([
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
    ]);
  });

  test('case sensitive succeeds with ?', () => {
    const searchString = 'Pa?l';
    const ignoreCase = '0';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual([
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
    ]);
  });

  test('case sensitive succeeds with *', () => {
    const searchString = 'Pa*l';
    const ignoreCase = '0';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual([
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
    ]);
  });

  test('case sensitive succeeds with * case 2', () => {
    const searchString = 'Pau*l';
    const ignoreCase = '0';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual([
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
    ]);
  });

  test('case sensitive succeeds with * - case 3', () => {
    const searchString = 'P*l';
    const ignoreCase = '0';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual([
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
    ]);
  });
});

describe('test wordSearch and logic', () => {
  const logic = 'A';

  test('ignore case succeeds one word', () => {
    const searchString = 'paul';
    const ignoreCase = '1';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual([
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
    ]);
  });

  test('ignore case succeeds two words', () => {
    const searchString = 'i paul';
    const ignoreCase = '1';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual([
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
    ]);
  });

  test('ignore case fails not all words match', () => {
    const searchString = 'i peter';
    const ignoreCase = '1';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual([]);
  });
  
  test('case sensitive fails on case mismatch', () => {
    const searchString = 'i paul';
    const ignoreCase = '0';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual(
      []
    );
  });

  test('case sensitive succeeds', () => {
    const searchString = 'I Paul';
    const ignoreCase = '0';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual([
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
    ]);
  });
});

describe('test wordSearch or logic', () => {
  const logic = 'O';

  test('ignore case succeeds one word', () => {
    const searchString = 'paul';
    const ignoreCase = '1';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual([
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
    ]);
  });

  test('ignore case succeeds two words', () => {
    const searchString = 'i paul';
    const ignoreCase = '1';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual([
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
    ]);
  });

  test('ignore case passes with one words match', () => {
    const searchString = 'i peter';
    const ignoreCase = '1';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual([
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
    ]);
  });
  
  test('case sensitive fails on case mismatch', () => {
    const searchString = 'i paul';
    const ignoreCase = '0';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual(
      []
    );
  });

  test('case sensitive succeeds', () => {
    const searchString = 'I Paul';
    const ignoreCase = '0';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic})

    expect(results.matches).toEqual([
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
    ]);
  });
});

describe('test wordSearch or logic with partial match', () => {
  const logic = 'O';
  const partialMatch = '1';

  test('ignore case succeeds one word', () => {
    const searchString = 'pau';
    const ignoreCase = '1';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic, partialMatch})

    expect(results.matches).toEqual([
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
    ]);
  });

  test('ignore case succeeds two words', () => {
    const searchString = 'i pau';
    const ignoreCase = '1';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic, partialMatch})

    expect(results.matches).toEqual([
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
    ]);
  });

  test('ignore case passes with one word match', () => {
    const searchString = 'i peter';
    const ignoreCase = '1';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic, partialMatch})

    expect(results.matches).toEqual([
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
    ]);
  });
  
  test('case sensitive fails on case mismatch', () => {
    const searchString = 'i pau';
    const ignoreCase = '0';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic, partialMatch})

    expect(results.matches).toEqual(
      []
    );
  });

  test('case sensitive succeeds', () => {
    const searchString = 'I Pau';
    const ignoreCase = '0';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic, partialMatch})

    expect(results.matches).toEqual([
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
    ]);
  });
});

describe('test wordSearch partialMatch string', () => {
  const logic = '';
  const partialMatch = '1';

  test('ignore case succeeds one word', () => {
    const searchString = 'pau';
    const ignoreCase = '1';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic, partialMatch})

    expect(results.matches).toEqual([
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
    ]);
  });
  
  test('case sensitive fails on case mismatch', () => {
    const searchString = 'pau';
    const ignoreCase = '0';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic, partialMatch})

    expect(results.matches).toEqual(
      []
    );
  });

  test('case sensitive succeeds', () => {
    const searchString = 'Pau';
    const ignoreCase = '0';

    const results = wordSearch.code({perf, searchString, ignoreCase, logic, partialMatch})

    expect(results.matches).toEqual([
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
    ]);
  });
});

describe('test wordSearch regex', () => {
  test('regex succeeds', () => {
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
            "I",
            ", ",
            "Paul",
            ", ",
          ]
        },
      ]
    });

    const searchString = 'I|l';
    const ignoreCase = '0';
    const regex = '1'

    const results = wordSearch.code({perf, searchString, ignoreCase, regex})

    expect(results.matches).toEqual([
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
    ]);
  });
});

