import {ProskommaRenderFromJson, transforms, mergeActions} from 'proskomma-json-tools';
import xre from "xregexp";

const localStripMarkupActions = {
    startDocument: [
        {
            description: "Set up",
            test: () => true,
            action: ({workspace,output}) => {
                workspace.chapter = null;
                workspace.verses = null;
                workspace.lastWord = "";
                workspace.waitingMarkup = [];
                workspace.currentOccurrences = {}
                output.stripped = [];
                return true;
            }
        }
    ],
    startMilestone: [
        {
            description: "Ignore zaln startMilestone events",
            test: ({context}) => context.sequences[0].element.subType === "usfm:zaln",
            action: ({context,workspace}) => {
                workspace.waitingMarkup.push(context.sequences[0].element);
            }
        },
    ],
    endMilestone: [
        {
            description: "Ignore zaln endMilestone events",
            test: ({context}) => context.sequences[0].element.subType === "usfm:zaln",
            action: ({ context, workspace, output }) => {
                output.stripped.push({
                    chapter: workspace.chapter,
                    verses: workspace.verses,
                    position: "after",
                    word: workspace.lastWord,
                    payload: context.sequences[0].element,
                })
            }
        },
    ],
    startWrapper: [
        {
            description: "Ignore w startWrapper events",
            test: ({context}) => context.sequences[0].element.subType === "usfm:w",
            action: ({ context, workspace }) => {
                workspace.waitingMarkup.push(context.sequences[0].element);
            }
        },
    ],
    endWrapper: [
        {
            description: "Ignore w endWrapper events",
            test: ({context}) => context.sequences[0].element.subType === "usfm:w",
            action: ({output, context, workspace}) => {
                output.stripped.push({
                    chapter: workspace.chapter,
                    verses: workspace.verses,
                    position: "after",
                    word: workspace.lastWord,
                    payload: context.sequences[0].element,
                })
            }
        },
    ],
    text: [
        {
            description: "Log occurrences",
            test: () => true,
            action: ({context,workspace,output,config}) => {
                try {
                    const text = context.sequences[0].element.text;
                    const re = xre('([\\p{Letter}\\p{Number}\\p{Mark}\\u2060]{1,127})')
                    const words = xre.match(text, re, "all");
                    const { chapter, verses } = workspace;
                    const { verseWords: totalOccurrences } = config;
                    for (const word of words) {
                        workspace.currentOccurrences[word] ??= 0;
                        workspace.currentOccurrences[word]++;
                        while (workspace.waitingMarkup.length) {
                            const payload = workspace.waitingMarkup.shift();
                            output.stripped.push({
                                chapter: chapter,
                                verses: verses,
                                occurrence: workspace.currentOccurrences[word],
                                occurrences: totalOccurrences[chapter][verses][word],
                                position: "before",
                                word,
                                payload,
                            })
                        }
                        workspace.lastWord = word;
                    }
                } catch (err) {
                    console.error(err)
                    throw err;
                }
                return true;
            }
        }
    ],
    mark: [
        {
            description: "Update CV state",
            test: () => true,
            action: ({context,workspace}) => {
                try {
                    const element = context.sequences[0].element;
                    if (element.subType === 'chapter') {
                        workspace.chapter = element.atts['number'];
                        workspace.verses = 0
                        workspace.lastWord = "";
                        workspace.currentOccurrences = {}
                    } else if (element.subType === 'verses') {
                        workspace.verses = element.atts['number'];
                        workspace.lastWord = "";
                        workspace.currentOccurrences = {}
                    }
                } catch (err) {
                    console.error(err)
                    throw err;
                }
                return true;
            }
        },
    ],
};

const stripMarkupCode = function ({perf, verseWords}) {
    const cl = new ProskommaRenderFromJson(
        {
            srcJson: perf,
            actions: mergeActions(
                [
                    localStripMarkupActions,
                    transforms.identityActions
                ]
            )
        }
    );
    const output = {};
    cl.renderDocument({ docId: "", config: {verseWords}, output });
    return {perf: output.perf, stripped: output.stripped};
}

const stripMarkup = {
    name: "stripMarkup",
    type: "Transform",
    description: "PERF=>PERF: Strips alignment markup",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
        {
            name: "verseWords",
            type: "json",
            source: ""
        },
    ],
    outputs: [
        {
            name: "perf",
            type: "json",
        },
        {
            name: "stripped",
            type: "json",
        }
    ],
    code: stripMarkupCode
}
export default stripMarkup;
