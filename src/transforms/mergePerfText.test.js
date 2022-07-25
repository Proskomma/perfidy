import mergePerfText from './mergePerfText';
import perfWrapper from './__data__/perfWrapper';

test('justTheBible output matches expected', () => {
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

    const {perf: outputPerf } = mergePerfText.code({perf})

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
                    "I, Paul, ",
                ]
            },
        ]}));
});
