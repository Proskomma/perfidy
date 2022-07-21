import {ProskommaRenderFromJson, toUsfmActions} from 'proskomma-json-tools';

const perf2usfmCode = function ({perf}) {
    const cl = new ProskommaRenderFromJson({srcJson: perf, actions: toUsfmActions});
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
        return {usfm: output.usfm};
}

const perf2usfm = {
    name: "perf2usfm",
    type: "Transform",
    description: "Converts a PERF document into USFM",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
    ],
    outputs: [
        {
            name: "usfm",
            type: "text",
        }
    ],
    code: perf2usfmCode
}
export default perf2usfm;
