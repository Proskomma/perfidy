import {ProskommaRenderFromJson, wordCountActions} from 'proskomma-json-tools';

const perfUniqueWordCountCode = function ({perf}) {
    const cl = new ProskommaRenderFromJson({srcJson: perf, actions: wordCountActions});
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
        return {words: output.words};
}

const perfUniqueWordCount = {
    name: "perfUniqueWordCount",
        type: "Transform",
        description: "Counts the occurence of each word in a PERF document",
        inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
    ],
        outputs: [
        {
            name: "words",
            type: "json",
        }
    ],
        code: perfUniqueWordCountCode
}

export default perfUniqueWordCount;
