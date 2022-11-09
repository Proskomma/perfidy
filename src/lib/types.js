const types = {
  bool: {
    name: "Boolean",
    test: (v) => !!v === v,
  },
  number: {
    name: "Number",
    test: (v) => typeof v === "number",
  },
  string: {
    name: "string",
    test: (v) => typeof v === "string",
  },
  nonNullObject: {
    name: "Non-Null Object",
    test: (v) => typeof v === "object" && v !== null,
    subTypes: {
      array: {
        name: "Array",
        test: (v) => Array.isArray(v),
      },
      kvObject: {
        name: "Key-Value Object",
        test: (v) => !Array.isArray(v),
        subTypes: {
          pkStructureDocument: {
            name: "Proskomma Structure Document",
            pkValidator: {
              type: "structure",
              key: "document",
              version: "0.2.1",
            },
          },
          perfSequence: {
            name: "Proskomma PERF Sequence",
            pkValidator: {
              type: "constraint",
              key: "perfSequence",
              version: "0.2.1",
            },
          },
          perfDocument: {
            name: "Proskomma PERF Document",
            pkValidator: {
              type: "constraint",
              key: "perfDocument",
              version: "0.2.1",
            },
          },
          sofriaDocument: {
            name: "Proskomma SOFRIA Document",
            pkValidator: {
              type: "constraint",
              key: "sofriaDocument",
              version: "0.2.1",
            },
          },
        },
      },
    },
  },
};

const flattenTypes = (typesObject, ancestors, passedRet) => {
  if (!ancestors) {
    ancestors = [];
  }
  const ret = passedRet || {};
  for (const [key, value] of Object.entries(typesObject)) {
    ret[key] = { name: value.name };
    if ("test" in value) {
      ret[key].test = value.test;
    }
    if ("pkValidator" in value) {
      ret[key].pkValidator = value.pkValidator;
    }
    if (ancestors.length > 0) {
      ret[key].super = ancestors;
    }
    if ("subTypes" in value) {
      flattenTypes(value.subTypes, [...ancestors, key], ret);
    }
  }
  return ret;
};

const flattenedTypes = flattenTypes(types);

// console.log(flattenedTypes, null, 2);

export default flattenedTypes;
