import mergePerfText from './mergePerfText';
import perfWrapper from './__data__/perfWrapper';

test('mergePerfText output matches expected', () => {
    const perf = perfWrapper({blocks:[
            {
                "type": "paragraph",
                "subtype": "usfm:p",
                "content": [
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
                    "I, Paul, ",
                ]
            },
        ]}));
});
