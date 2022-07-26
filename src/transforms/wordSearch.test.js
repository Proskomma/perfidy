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
  const andLogic = '0';

  test('ignore case succeeds', () => {
    const searchString = 'paul';
    const ignoreCase = '1';

    const {matches} = wordSearch.code({perf, searchString, ignoreCase, andLogic})

    expect(matches).toEqual([
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
        ],
      },
    ]);
  });

  test('ignore case fails partial', () => {
    const searchString = 'pau';
    const ignoreCase = '1';

    const {matches} = wordSearch.code({perf, searchString, ignoreCase, andLogic})

    expect(matches).toEqual([ ]);
  });

  test('case sensitive fails on case mismatch', () => {
    const searchString = 'paul';
    const ignoreCase = '0';

    const {matches} = wordSearch.code({perf, searchString, ignoreCase, andLogic})

    expect(matches).toEqual(
      []
    );
  });

  test('case sensitive succeeds', () => {
    const searchString = 'Paul';
    const ignoreCase = '0';

    const {matches} = wordSearch.code({perf, searchString, ignoreCase, andLogic})

    expect(matches).toEqual([
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
        ],
      },
    ]);
  });
});

describe('test wordSearch andLogic', () => {
  const andLogic = '1';

  test('ignore case succeeds one word', () => {
    const searchString = 'paul';
    const ignoreCase = '1';

    const {matches} = wordSearch.code({perf, searchString, ignoreCase, andLogic})

    expect(matches).toEqual([
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
        ],
      },
    ]);
  });

  test('ignore case succeeds two words', () => {
    const searchString = 'i paul';
    const ignoreCase = '1';

    const {matches} = wordSearch.code({perf, searchString, ignoreCase, andLogic})

    expect(matches).toEqual([
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
        ],
      },
    ]);
  });


  test('case sensitive fails on case mismatch', () => {
    const searchString = 'i paul';
    const ignoreCase = '0';

    const {matches} = wordSearch.code({perf, searchString, ignoreCase, andLogic})

    expect(matches).toEqual(
      []
    );
  });

  test('case sensitive succeeds', () => {
    const searchString = 'I Paul';
    const ignoreCase = '0';

    const {matches} = wordSearch.code({perf, searchString, ignoreCase, andLogic})

    expect(matches).toEqual([
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
        ],
      },
    ]);
  });
});