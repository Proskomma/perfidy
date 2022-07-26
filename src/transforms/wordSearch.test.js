import wordSearch from './wordSearch';
import perfWrapper from './__data__/perfWrapper';

describe('test wordSearch', () => {
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

  test('ignore case succeeds', () => {
    const searchString = 'paul';
    const ignoreCase = '1';

    const {matches} = wordSearch.code({perf, searchString, ignoreCase})

    expect(matches).toEqual(
      [
        '1:1',
      ]
    );
  });

  test('case sensitive fails on case mismatch', () => {
    const searchString = 'paul';
    const ignoreCase = '0';

    const {matches: matchesCS} = wordSearch.code({perf, searchString, ignoreCase})

    expect(matchesCS).toEqual(
      []
    );
  });

  test('case sensitive succeeds', () => {
    const searchString = 'Paul';
    const ignoreCase = '0';

    const {matches: matchesCS} = wordSearch.code({perf, searchString, ignoreCase})

    expect(matchesCS).toEqual(
      [
        '1:1',
      ]
    );
  });
});
