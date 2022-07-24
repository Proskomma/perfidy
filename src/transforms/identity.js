import {ProskommaRenderFromJson, identityActions} from 'proskomma-json-tools';

const identityCode = function ({perf}) {
    const cl = new ProskommaRenderFromJson(
        {
            srcJson: perf,
            actions: identityActions
        }
    );
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
    return {perf: output};
}

const identity = {
    name: "identity",
    type: "Transform",
    description: "PERF=>PERF: Deep Copy",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
    ],
    outputs: [
        {
            name: "perf",
            type: "json",
        }
    ],
    code: identityCode
}
export default identity;
