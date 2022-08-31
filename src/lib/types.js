import {Validator} from 'proskomma-json-tools';

const types = {
    bool: {
        name: "Boolean",
        test: v => !!v === v,
    },
    number: {
        name: "Number",
        test: v => typeof v === 'number',
    },
    string: {
        name: "String",
        test: v => typeof v === 'string',
        subTypes: {
            json: {
                name: "Serialized JSON",
                test: v => {
                    try {
                        JSON.parse(v);
                        return true;
                    } catch (err) {
                        return false;
                    }
                }
            },
        }
    },
    nonNullObject: {
        name: "Non-Null Object",
        test: v => typeof v === 'object' && v !== null,
        subTypes: {
            array: {
                name: "Array",
                test: v => Array.isArray(v),
            },
            kvObject: {
                name: "Key-Value Object",
                test: v => !Array.isArray(v),
                subTypes: {
                    pkStructureDocument: {
                        name: "Proskomma Structure Document",
                        pkValidator: {
                            type: 'structure',
                            key: 'document',
                            version: '0.2.1'
                        }
                    },
                    perfSequence: {
                        name: "Proskomma PERF Sequence",
                        pkValidator: {
                            type: 'constraint',
                            key: 'perfSequence',
                            version: '0.2.1'
                        }
                    },
                    perfDocument: {
                        name: "Proskomma PERF Document",
                        pkValidator: {
                            type: 'constraint',
                            key: 'perfDocument',
                            version: '0.2.1'
                        }
                    },
                    sofriaDocument: {
                        name: "Proskomma SOFRIA Document",
                        pkValidator: {
                            type: 'constraint',
                            key: 'sofriaDocument',
                            version: '0.2.1'
                        }
                    },
                }
            }
        }
    },
};

const flattenTypes = (typesObject, ancestors, passedRet) => {
    if (!ancestors) {
        ancestors = [];
    }
    const ret = passedRet || {};
    for (const [key, value] of Object.entries(typesObject)) {
        ret[key] = {key, name: value.name};
        if ("test" in value) {
            ret[key].test = value.test;
        }
        if ("pkValidator" in value) {
            ret[key].pkValidator = value.pkValidator;
        }
        if (ancestors.length > 0) {
            ret[key].super = ancestors;
        } else {
            ret[key].super = [];
        }
        if ("subTypes" in value) {
            flattenTypes(value.subTypes, [...ancestors, key], ret);
        }
    }
    return ret;
}

const flattenedTypes = flattenTypes(types);

const assertType1 = (type, value) => {
    if (type.test) {
        try {
            return ([type.key, type.test(value)]);
        } catch (err) {
            return [type.key, false, err]
        }
    } else if (type.pkValidator) {
        const validator = new Validator();
        try {
            const validation = validator.validate(
                type.pkValidator.type,
                type.pkValidator.key,
                type.pkValidator.version,
                value
            );
            return [type.key, validation.isValid, validation];
        } catch (err) {
            return [type.key, false, err];
        }
    } else {
        return [type.key, true];
    }
}

const assertType = (type, value) => {
    if (!flattenedTypes[type]) {
        throw new Error(`Unknown type '${type}'`);
    }
    let typeDefs = [...flattenedTypes[type].super.map(t => flattenedTypes[t]), flattenedTypes[type]];
    let testResult;
    for (const td of typeDefs) {
        testResult = assertType1(td, value);
        if (!testResult[0]) {
            break;
        }
    }
    return testResult;
}

export {types, flattenedTypes, assertType};
