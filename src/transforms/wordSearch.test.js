import wordSearch from './wordSearch';
import perfWrapper from './__data__/perfWrapper';

describe('test wordSearch', () => {
  const andLogic = '0';
  
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

    const {matches} = wordSearch.code({perf, searchString, ignoreCase, andLogic})

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

        const {matches} = wordSearch.code({perf, searchString, ignoreCase, regex})

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