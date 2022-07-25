import {ProskommaRenderFromJson, identityActions, mergeActions} from 'proskomma-json-tools';
import xre from "xregexp";

const localStripMarkupActions = {
    startDocument: [
        {
            description: "Set up",
            test: () => true,
            action: (env) => {
                env.workspace.chapter = null;
                env.workspace.verses = null;
                env.workspace.lastWord = "";
            }
        }
    ],
    startMilestone: [
        {
            description: "Ignore zaln startMilestone events",
            test: (env) => env.context.sequences[0].element.subType === "usfm:zaln",
            action: (env) => {
                
            }
        },
    ],
    endMilestone: [
        {
            description: "Ignore zaln endMilestone events",
            test: (env) => env.context.sequences[0].element.subType === "usfm:zaln",
            action: (env) => {
                console.log(`${env.workspace.chapter}:${env.workspace.verses} before ${env.workspace.lastWord}`)
            }
        },
    ],
    startWrapper: [
        {
            description: "Ignore w startWrapper events",
            test: (env) => env.context.sequences[0].element.subType === "usfm:w",
            action: (env) => {
                
            }
        },
    ],
    endWrapper: [
        {
            description: "Ignore w endWrapper events",
            test: (env) => env.context.sequences[0].element.subType === "usfm:w",
            action: (env) => {
                
            }
        },
    ],
    text: [
        {
            description: "Log occurrences",
            test: () => true,
            action: (env) => {
                const text = env.context.sequences[0].element.text;
                const re = xre('([\\p{Letter}\\p{Number}\\p{Mark}\\u2060]{1,127})')
                const words = xre.match(text, re, "all");
                for (const word of words) {
                    env.workspace.lastWord = word;
                }
            }
        }
    ],
    mark: [
        {
            description: "Update CV state",
            test: () => true,
            action: (env) => {
                const element = env.context.sequences[0].element;
                if (element.subType === 'chapter') {
                    env.workspace.chapter = element.atts['number'];
                    env.workspace.verses = 0
                    env.workspace.lastWord = "";
                } else if (element.subType === 'verses') {
                    env.workspace.verses = element.atts['number'];
                    env.workspace.lastWord = "";
                }
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
                    identityActions
                ]
            )
        }
    );
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
    return {perf: output, stripped: {}}; // identityActions currently put PERF directly in output
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
