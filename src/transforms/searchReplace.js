import {
  PerfRenderFromJson,
  transforms,
  mergeActions,
} from "proskomma-json-tools";

const searchReplaceActions = {
  startDocument: [
    {
      description: "setup",
      test: () => true,
      action: (params) => {
        const { workspace, output, context } = params;
        console.log(params);
        workspace.bookCode = context.document.metadata.document.bookCode;
        workspace.chapter = null;
        workspace.verses = null;
        output.results = [];
        return true;
      },
    },
  ],
  text: [
    {
      description: "add-to-text",
      test: () => true,
      action: ({ config, context, workspace, output }) => {
        try {
          /** @type {string} */

          const {
            target,
            replacement,
            pointers = [],
            config: _config = {},
          } = config;
          const {
            ctxLen = 10,
            isRegex = false,
            shouldMatchCase = false,
          } = _config;
          const flags = ["g"];
          if (shouldMatchCase) flags.push("i");
          const _isRegex =
            typeof isRegex === "boolean" ? isRegex : isRegex === "true";
          const _text = context.sequences[0].element.text;
          // console.log({ config, context, workspace, output });
          const { chapter, verses } = workspace;

          const evalRegex = (source) => {
            if (source instanceof RegExp) return { source };
            if (typeof source !== "string") return;
            const results = source.match(/\/(.+)\/(?=(\w*$))/);
            if (!results?.[1]) return { source };
            return { source: results[1], flags: results[2] };
          };

          const rgxData = _isRegex ? evalRegex(target) : { source: target };
          const _flags = rgxData.flags
            ? [...new Set(rgxData.flags, ...flags)]
            : flags;
          const rgx = new RegExp(rgxData.source, _flags.join(""));
          let index = 0;
          const replaced = _text.replace(rgx, function (...args) {
            const containsGroup = typeof args[args.length - 1] === "object";
            // const namedGroups = containsGroup ? args.pop() : undefined;
            if (containsGroup) args.pop();
            const text = args.pop();
            const pos = args.pop();
            const match = args.shift();
            // const unnamedGroups = args;
            const ctxBefore = text.slice(pos - ctxLen, pos);
            const ctxAfter = text.slice(
              pos + match.length,
              pos + match.length + ctxLen
            );
            const replaced = isRegex
              ? match.replace(rgx, replacement)
              : replacement;
            const _pointer = [chapter, verses, index].join("---");
            const result = {
              text: ctxBefore + match + replaced + ctxAfter,
              pointer: _pointer,
              metadata: {
                bookCode: workspace.bookCode,
                chapter,
                verses,
                index,
              },
              hoverText: `${workspace.bookCode.toLowerCase()} ${chapter}:${verses}`,
            };
            output.results.push(result);
            index++;
            if (pointers === "all") return replaced;
            return pointers.includes(_pointer) ? replaced : match;
          });
          workspace.outputContentStack[0].push(replaced);
          if (!verses) return true;
          return false;
        } catch (err) {
          console.error(err);
          throw err;
        }
      },
    },
  ],
  mark: [
    {
      description: "mark-chapters",
      test: ({ context }) => context.sequences[0].element.subType === "chapter",
      action: ({ config, context, workspace, output }) => {
        const element = context.sequences[0].element;
        workspace.chapter = element.atts["number"];
        workspace.verses = 0;
        return true;
      },
    },
    {
      description: "mark-verses",
      test: ({ context }) => context.sequences[0].element.subType === "verses",
      action: ({ config, context, workspace, output }) => {
        const element = context.sequences[0].element;
        workspace.verses = element.atts["number"];
        return true;
      },
    },
  ],
};

const searchReplaceCode = function ({ perf, params }) {
  const cl = new PerfRenderFromJson({
    srcJson: perf,
    actions: mergeActions([
      searchReplaceActions,
      transforms.perf2perf.identityActions,
    ]),
  });
  const output = {};
  cl.renderDocument({
    docId: "",
    config: {
      ...params,
    },
    output,
  });
  return { perf: output.perf, results: output.results }; // identityActions currently put PERF directly in output
};

const searchReplace = {
  name: "searchReplace",
  type: "Transform",
  description: "Search and replace text in stripped perf",
  inputs: [
    {
      name: "perf",
      type: "json",
      source: "",
    },
    {
      name: "params",
      type: "json",
      source: "",
    },
  ],
  outputs: [
    {
      name: "results",
      type: "json",
    },
  ],
  code: searchReplaceCode,
};
export default searchReplace;
