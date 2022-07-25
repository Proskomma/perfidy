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
                    "atts": {}
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
                    "atts": {
                        "x-strong": [
                            "G39720"
                        ],
                        "x-lemma": [
                            "Παῦλος"
                        ],
                        "x-morph": [
                            "Gr",
                            "N",
                            "",
                            "",
                            "",
                            "",
                            "NMS",
                            ""
                        ],
                        "x-occurrence": [
                            "1"
                        ],
                        "x-occurrences": [
                            "1"
                        ],
                        "x-content": [
                            "Παῦλος"
                        ]
                    }
                },
                {
                    "type": "wrapper",
                    "subtype": "usfm:w",
                    "content": [
                        "I"
                    ],
                    "atts": {
                        "x-occurrence": [
                            "1"
                        ],
                        "x-occurrences": [
                            "3"
                        ]
                    }
                },
                ", ",
                {
                    "type": "wrapper",
                    "subtype": "usfm:w",
                    "content": [
                        "Paul"
                    ],
                    "atts": {
                        "x-occurrence": [
                            "1"
                        ],
                        "x-occurrences": [
                            "1"
                        ]
                    }
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
