import {Validator} from 'proskomma-json-tools';

const validateCode = function ({data, type, key, version}) {
    const validator = new Validator();
    const validation = validator.validate(
        type,
        key,
        version,
        data
    );
    return {validation};
}

const validate = {
    name: "validate",
    type: "Transform",
    description: "PERF=>JSON: Validates using Proskomma JSON Tools",
    inputs: [
        {
            name: "data",
            type: "json",
            source: ""
        },
        {
            name: "type",
            type: "text",
            source: ""
        },
        {
            name: "key",
            type: "text",
            source: ""
        },
        {
            name: "version",
            type: "text",
            source: ""
        },
    ],
    outputs: [
        {
            name: "validation",
            type: "json",
        }
    ],
    code: validateCode
}

export default validate;
