import justTheBible from './justTheBible';
import perfWrapper from './__data__/perfWrapper';

test('justTheBible output matches expected', () => {
    const perf = perfWrapper({blocks:[
        {
            "type": "paragraph",
            "subtype": "usfm:p",
            "content": [
                {
                    "type": "start_milestone",
                    "subtype": "usfm:ts",
                },
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
                {
                    "type": "start_milestone",
                    "subtype": "usfm:zaln",
                },
                {
                    "type": "wrapper",
                    "subtype": "usfm:w",
                    "content": [
                        "I"
                    ],
                },
                ", ",
                {
                    "type": "wrapper",
                    "subtype": "usfm:w",
                    "content": [
                        "Paul"
                    ],
                },
                ", ",
            ]
        },
    ]});

    const {perf: outputPerf } = justTheBible.code({perf})

    expect(outputPerf).toEqual(perfWrapper({blocks: [
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
    ]}));
});
