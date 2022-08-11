const types = {
    bool: {
        test: v => !!v === v,
    },
    number: {
        test: v => typeof v === 'number',
    },
    string: {
        test: v => typeof v === 'string',
    },
    nonNullObject: {
        test: v => typeof v === 'object' && v !== null,
        subTypes: {
            array: {
                test: v => Array.isArray(v),
            },
            kvObject: {
                test: v => !Array.isArray(v),
                subTypes: {
                    pkStructureDocument: {
                        pkValidator: {
                            type: 'structure',
                            key: 'document',
                            version: '0.2.1'
                        }
                    },
                    perfSequence: {
                        pkValidator: {
                            type: 'constraint',
                            key: 'perfSequence',
                            version: '0.2.1'
                        }
                    },
                    perfDocument: {
                        pkValidator: {
                            type: 'constraint',
                            key: 'perfDocument',
                            version: '0.2.1'
                        }
                    },
                    sofriaDocument: {
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

export default types;
