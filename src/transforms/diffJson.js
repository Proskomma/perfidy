import {diffJson as diffObject, diffArrays} from 'diff';

const diffTypes = {
    arrays: diffArrays,
    objects: diffObject,
}

const diffJsonCode = function ({json1, json2, diffType}) {
    if (!Object.keys(diffTypes).includes(diffType)) {
        const errMsg = `ERROR: diffJson diffType must be one of ${Object.keys(diffTypes).join(', ')}, not '${diffType}'}`;
        console.log(errMsg);
        return {diff: {error: errMsg}};
    }
    return {diff: diffTypes[diffType](json1, json2)};
}

const diffJson = {
    name: "diffJson",
    type: "Transform",
    description: "JSON,JSON=>JSON: JSON Diff using NPM 'diff'",
    inputs: [
        {
            name: "json1",
            type: "json",
            source: ""
        },
        {
            name: "json2",
            type: "json",
            source: ""
        },
        {
            name: "diffType",
            type: "text",
            source: ""
        },
     ],
    outputs: [
        {
            name: "diff",
            type: "json",
        }
    ],
    code: diffJsonCode
}

export default diffJson;
