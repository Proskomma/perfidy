import {ProskommaRenderFromJson, transforms, mergeActions} from 'proskomma-json-tools';


const makeAlignmentActions = {
    startDocument: [
        {
            description: "Set up state variables and output",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                workspace.chapter = null;
                workspace.verses = null;
                workspace.matches = new Set([]);
                workspace.chunks = [];
                output.report = {};
                if (config.regex) {
                    
                }
            }
        },
    ],
    startMilestone: [
        {
            description: "Ignore startMilestone events",
            test: () => true,
            action: () => {
            }
        },
    ],
    endMilestone: [
        {
            description: "Ignore endMilestone events",
            test: () => true,
            action: () => {
            }
        },
    ],
    startWrapper: [
        {
            description: "Ignore startWrapper events",
            test: () => true,
            action: () => {
            }
        },
    ],
    endWrapper: [
        {
            description: "Ignore endWrapper events",
            test: () => true,
            action: () => {
            }
        },
    ],
    blockGraft: [
        {
            description: "Ignore blockGraft events, except for title (\\mt)",
            test: (environment) => environment.context.sequences[0].block.subType !== 'title',
            action: (environment) => {
            }
        },
    ],
    inlineGraft: [
        {
            description: "Ignore inlineGraft events",
            test: () => true,
            action: () => {
            }
        },
    ],
    mark: [
        {
            description: "Ignore mark events, except for chapter and verses",
            test: ({context}) => !['chapter', 'verses'].includes(context.sequences[0].element.subType),
            action: () => {
            }
        },
    ],
};

const makeAlignmentCode = function ({perf}) {
    const cl = new ProskommaRenderFromJson(
        {
            srcJson: perf,
            actions: mergeActions(
                [
                    makeAlignmentActions,
                    transforms.identityActions
                ]
            )
        }
    );
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
    return {report: output.report};
}

const makeAlignment = {
    name: "makeAlignment",
    type: "Transform",
    description: "PERF=>JSON: Generates alignment report",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
    ],
    outputs: [
        {
            name: "report",
            type: "json",
        }
    ],
    code: makeAlignmentCode
}

export default makeAlignment;
