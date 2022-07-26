import wordSearch from './wordSearch';
import perfWrapper from './__data__/perfWrapper';

describe('test wordSearch', () => {
  test('ignore case succeeds', () => {
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

    const searchString = 'paul';
    const ignoreCase = '1';

    const {matches} = wordSearch.code({perf, searchString, ignoreCase})

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

  test('case sensitive fails on case mismatch', () => {
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

    const searchString = 'paul';
    const ignoreCase = '0';

    const {matches} = wordSearch.code({perf, searchString, ignoreCase})

    expect(matches).toEqual(
      []
    );
  });

  test('case sensitive succeeds', () => {
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

    const searchString = 'Paul';
    const ignoreCase = '0';

    const {matches} = wordSearch.code({perf, searchString, ignoreCase})

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