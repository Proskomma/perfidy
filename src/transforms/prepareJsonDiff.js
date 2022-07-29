import sortObject from "deep-sort-object";

const prepareJsonDiffCode = function ({ original, modified }) {
  return {
    diffPrepared: {
      type: "diff",
      original: JSON.stringify(sortObject(original), null, 2),
      modified: JSON.stringify(sortObject(modified), null, 2),
    },
  };
};

const prepareJsonDiff = {
  name: "prepareJsonDiff",
  type: "Transform",
  description: "PERF=>JSON: Prepares inputs for diff display",
  inputs: [
    {
      name: "original",
      type: "json",
      source: "",
    },
    {
      name: "modified",
      type: "json",
      source: "",
    },
  ],
  outputs: [
    {
      name: "diffPrepared",
      type: "json",
    },
  ],
  code: prepareJsonDiffCode,
};

export default prepareJsonDiff;
