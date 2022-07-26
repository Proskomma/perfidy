import wordSearch from './wordSearch';
import perfWrapper from './__data__/perfWrapper';

test('wordSearch finds some words', () => {
    const perf = perfWrapper({blocks:[
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
    ]});

    const searchString = 'paul';
    const ignoreCase = '1';

    const { matches } = wordSearch.code({perf, searchString, ignoreCase})

    expect(matches).toEqual(
        [
            '1:1',
        ]
    );

    const { matches: matchesCS } = wordSearch.code({perf, searchString, ignoreCase: '0'})

    expect(matchesCS).toEqual(
        []
    );
});
