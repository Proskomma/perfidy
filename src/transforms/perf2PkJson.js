import {PerfRenderFromJson} from 'proskomma-json-tools';
import {lexingRegexes} from 'proskomma';
import xre from "xregexp";

const wordLikeRegex = lexingRegexes.filter(r => r[1] === 'wordLike')[0][2];
const lineSpaceRegex = lexingRegexes.filter(r => r[1] === 'lineSpace')[0][2];
const punctuationRegex = lexingRegexes.filter(r => r[1] === 'punctuation')[0][2];
console.log("Regexes", wordLikeRegex, lineSpaceRegex, punctuationRegex);

const perf2PkJsonActions = {
    startDocument: [
        {
            description: "Set up word object",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                output.pkJson = {};
                workspace.sequenceId = null;
                workspace.block = null;
                workspace.os = new Set([]);
            }
        },
    ],
    startSequence: [
        {
            description: "Add sequence array to output",
            test: () => true,
            action: (environment) => {
                environment.output.pkJson[environment.context.sequences[0].id] = [];
                environment.workspace.sequenceId = environment.context.sequences[0].id;
            }
        }
    ],
    endSequence: [
        {
            description: "Reset sequenceId pointer",
            test: () => true,
            action: (environment) => {
                environment.workspace.sequenceId = environment.context.sequences[1]?.id;
            }
        }
    ],

    blockGraft: [
        {
            description: "Follow block grafts",
            test: ({context}) => ['title', 'heading', 'introduction'].includes(context.sequences[0].block.subType),
            action: (environment) => {
                const target = environment.context.sequences[0].block.target;
                if (target) {
                    environment.context.renderer.renderSequenceId(environment, target);
                }
            }
        }
    ],
    inlineGraft: [
        {
            description: "Follow inline grafts",
            test: () => false,
            action: (environment) => {
                const target = environment.context.sequences[0].element.target;
                if (target) {
                    environment.context.renderer.renderSequenceId(environment, target);
                }
            }
        }
    ],
    startParagraph: [
        {
            description: "Add object for paragraph block",
            test: () => true,
            action: ({context, workspace, output}) => {
                workspace.block = {
                    os: [],
                    is: [],
                    bs: {
                        type: "scope",
                        subType: "start",
                        payload: `blockTag/${context.sequences[0].block.subType.split(':')[1]}`,
                    },
                    items: [],
                };
                output.pkJson[workspace.sequenceId].push(workspace.block);
            }
        }
    ],
    text: [
        {
            description: "Log occurrences",
            test: () => true,
            action: ({ context, workspace, output, config }) => {
                    const text = context.sequences[0].element.text;
                    const re = xre.union(lexingRegexes.map((x) => x[2]));
                    const words = xre.match(text, re, "all");
                    for (const word of words) {
                        let subType;
                        if (xre.test(word, wordLikeRegex)) {
                            subType = 'wordLike'
                        } else if (xre.test(word, lineSpaceRegex)) {
                            subType = 'lineSpace'
                        } else if (xre.test(word, punctuationRegex)) {
                            subType = 'punctuation'
                        }
                            workspace.block.items.push({
                            type: 'token',
                            subType,
                            payload: word,
                        })
                        }
            },
        },
    ],
};

const perf2PkJsonCode = function ({perf}) {
    const cl = new PerfRenderFromJson(
        {
            srcJson: perf,
            actions: perf2PkJsonActions,
        }
    );
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
    return {pkJson: output.pkJson};
}

const perf2PkJson = {
    name: "perf2PkJson",
    type: "Transform",
    description: "PERF=>JSON: Converts PERF to current Proskomma input format",
    documentation: "",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
    ],
    outputs: [
        {
            name: "pkJson",
            type: "json",
        }
    ],
    code: perf2PkJsonCode
}
export default perf2PkJson;
