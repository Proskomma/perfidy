import {ProskommaRenderFromJson, transforms} from 'proskomma-json-tools';

const identityCode = function ({perf}) {
    const cl = new ProskommaRenderFromJson(
        {
            srcJson: perf,
            actions: transforms.identityActions
        }
    );
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
    return {perf: output.perf};
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
