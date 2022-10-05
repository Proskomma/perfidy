import {PerfRenderFromJson} from 'proskomma-json-tools';
import {lexingRegexes} from 'proskomma';
import xre from 'xregexp';

const wordLikeRegex = lexingRegexes.filter(r => r[1] === 'wordLike')[0][2];
const lineSpaceRegex = lexingRegexes.filter(r => r[1] === 'lineSpace')[0][2];
const punctuationRegex = lexingRegexes.filter(r => r[1] === 'punctuation')[0][2];

const closeAllOpenScopes = workspace => {
    [...workspace.os]
        .reverse()
        .forEach(o => {
                workspace.block.items.push({
                        type: "scope",
                        subType: "end",
                        payload: o
                    }
                );
            }
        );
    workspace.os = [];
}

const closeParagraphScopes = workspace => {
    [...workspace.os.filter(o => ['span'].includes(o.split('/')[1]))]
        .reverse()
        .forEach(o => {
                workspace.block.items.push({
                    type: "scope",
                    subType: "end",
                    payload: o
                });
                workspace.os = [...workspace.os.filter(wo => wo !== o)];
            }
        );
}

const closeVerseScopes = workspace => {
    [...workspace.os.filter(o => ['verse', 'verses'].includes(o.split('/')[0]))]
        .reverse()
        .forEach(o => {
                workspace.block.items.push({
                    type: "scope",
                    subType: "end",
                    payload: o
                });
                workspace.os = [...workspace.os.filter(wo => wo !== o)];
            }
        );
}

const closeChapterScopes = workspace => {
    [...workspace.os.filter(o => ['chapter'].includes(o.split('/')[0]))]
        .reverse()
        .forEach(o => {
                workspace.block.items.push({
                    type: "scope",
                    subType: "end",
                    payload: o
                });
                workspace.os = [...workspace.os.filter(wo => wo !== o)];
            }
        );
}

const perf2PkJsonActions = {

        startDocument: [
            {
                description: 'Set up word object',
                test: () => true,
                action: ({
                             workspace,
                             output,
                         }) => {
                    output.pkJson = {};
                    workspace.sequenceId = null;
                    workspace.block = null;
                    workspace.os = [];
                },
            },
        ],

        startSequence: [
            {
                description: 'Add sequence array to output',
                test: () => true,
                action: (environment) => {
                    environment.output.pkJson[environment.context.sequences[0].id] = [];
                    environment.workspace.sequenceId = environment.context.sequences[0].id;
                },
            },
        ],

        endSequence: [
            {
                description: 'Reset sequenceId pointer',
                test: () => true,
                action: (environment) => {
                    closeAllOpenScopes(environment.workspace);
                    environment.workspace.sequenceId = environment.context.sequences[1]?.id;
                },
            },
        ],

        blockGraft: [
            {
                description: 'Follow block grafts',
                test: ({context}) => ['title', 'heading', 'introduction'].includes(context.sequences[0].block.subType),
                action: (environment) => {
                    const target = environment.context.sequences[0].block.target;
                    if (target) {
                        environment.context.renderer.renderSequenceId(environment, target);
                    }
                },
            },
        ],

        inlineGraft: [
            {
                description: 'Follow inline grafts',
                test: () => false,
                action: (environment) => {
                    const target = environment.context.sequences[0].element.target;
                    if (target) {
                        environment.context.renderer.renderSequenceId(environment, target);
                    }
                },
            },
        ],

        startParagraph: [
            {
                description: 'Add object for paragraph block',
                test: () => true,
                action: ({
                             context,
                             workspace,
                             output,
                         }) => {
                    workspace.block = {
                        os: [...workspace.os],
                        is: [],
                        bs: {
                            type: 'scope',
                            subType: 'start',
                            payload: `blockTag/${context.sequences[0].block.subType.split(':')[1]}`,
                        },
                        items: [],
                    };
                    output.pkJson[workspace.sequenceId].push(workspace.block);
                },
            },
        ],
        endParagraph: [
            {
                description: 'Close open scopes',
                test: () => true,
                action: ({workspace}) => {
                    closeParagraphScopes(workspace);
                },
            },
        ],
        mark: [
            {
                description: 'Chapter',
                test: ({context}) => ["chapter"].includes(context.sequences[0].element.subType),
                action: ({context, workspace}) => {
                    closeVerseScopes(workspace);
                    closeChapterScopes(workspace);
                    const element = context.sequences[0].element;
                    const chapterScope = `chapter/${element.atts["number"]}`;
                    if (!workspace.block.is.includes(chapterScope)) {
                        workspace.block.is.push(chapterScope);
                    }
                    workspace.os.push(chapterScope);
                    workspace.block.items.push({
                        type: 'scope',
                        subType: "start",
                        payload: chapterScope,
                    });
                },
            },
            {
                description: 'Verses',
                test: ({context}) => ["verses"].includes(context.sequences[0].element.subType),
                action: ({context, workspace}) => {
                    closeVerseScopes(workspace);
                    const element = context.sequences[0].element;
                    const vn = element.atts["number"];
                    let va = [parseInt(vn)];
                    if (vn.includes('-')) {
                        let [vs, ve] = vn.split('-').map(s => parseInt(s));
                        va = [vs];
                        while (vs <= ve) {
                            vs++;
                            va.push(vs);
                        }
                    }
                    for (const v of va) {
                        const verseScope = `verse/${element.atts["number"]}`;
                        workspace.os.push(verseScope);
                        if (!workspace.block.is.includes(verseScope)) {
                            workspace.block.is.push(verseScope);
                        }
                        workspace.block.items.push({
                            type: 'scope',
                            subType: "start",
                            payload: verseScope,
                        });
                    }
                    const versesScope = `verses/${element.atts["number"]}`;
                    if (!workspace.block.is.includes(versesScope)) {
                        workspace.block.is.push(versesScope);
                    }
                    workspace.os.push(versesScope);
                    workspace.block.items.push({
                        type: 'scope',
                        subType: "start",
                        payload: versesScope,
                    });
                },
            },
        ],

        startWrapper: [
            {
                description: 'Add scope and update state',
                test: () => true,
                action: () => {
                },
            },
        ],

        endWrapper: [
            {
                description: 'Remove scope and update state',
                test: () => true,
                action: () => {
                },
            },
        ],

        text: [
            {
                description: 'Log occurrences',
                test: () => true,
                action: ({
                             context,
                             workspace,
                         }) => {
                    const text = context.sequences[0].element.text;
                    const re = xre.union(lexingRegexes.map((x) => x[2]));
                    const words = xre.match(text, re, 'all');
                    for (const word of words) {
                        let subType;
                        if (xre.test(word, wordLikeRegex)) {
                            subType = 'wordLike';
                        } else if (xre.test(word, lineSpaceRegex)) {
                            subType = 'lineSpace';
                        } else if (xre.test(word, punctuationRegex)) {
                            subType = 'punctuation';
                        }
                        workspace.block.items.push({
                            type: 'token',
                            subType,
                            payload: word,
                        });
                    }
                },
            },
        ]
    }

;

const perf2PkJsonCode = function ({perf}) {
    const cl = new PerfRenderFromJson(
        {
            srcJson: perf,
            actions: perf2PkJsonActions,
        },
    );
    const output = {};
    cl.renderDocument({
        docId: '',
        config: {},
        output,
    });
    return {pkJson: output.pkJson};
};

const perf2PkJson = {
    name: 'perf2PkJson',
    type: 'Transform',
    description: 'PERF=>JSON: Converts PERF to current Proskomma input format',
    documentation: '',
    inputs: [
        {
            name: 'perf',
            type: 'json',
            source: '',
        },
    ],
    outputs: [
        {
            name: 'pkJson',
            type: 'json',
        },
    ],
    code: perf2PkJsonCode,
};
export default perf2PkJson;
