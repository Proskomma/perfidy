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
                workspace.waitingMarkup = null;
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
                workspace.waitingMarkup = context.sequences[0].element;
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
            action: () => {}
        },
    ],
    endWrapper: [
        {
            description: "Ignore w endWrapper events",
            test: ({context}) => context.sequences[0].element.subType === "usfm:w",
            action: () => {}
        },
    ],
    text: [
        {
            description: "Log occurrences",
            test: () => true,
            action: ({context,workspace,output}) => {
                try {
                    const text = context.sequences[0].element.text;
                    const re = xre('([\\p{Letter}\\p{Number}\\p{Mark}\\u2060]{1,127})')
                    const words = xre.match(text, re, "all");
                    for (const word of words) {
                        if (workspace.waitingMarkup) {
                            output.stripped.push({
                                chapter: workspace.chapter,
                                verses: workspace.verses,
                                position: "before",
                                word,
                                payload: workspace.waitingMarkup,
                            })
                            workspace.waitingMarkup = null;
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
                    } else if (element.subType === 'verses') {
                        workspace.verses = element.atts['number'];
                        workspace.lastWord = "";
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

const stripMarkupCode = function ({perf}) {
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
    cl.renderDocument({ docId: "", config: {}, output });
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
