import {ProskommaRenderFromJson, transforms, mergeActions} from 'proskomma-json-tools';

const processMilestone = (workspace, milestoneInfos) => {
    workspace.milestones.push(milestoneInfos);
}

const processOutputMilestones = (workspace, output, text) => {
    if (workspace.chapter && workspace.verses) {
        output.report.push(
            {
                chapter: workspace.chapter,
                verses: workspace.verses,
                milestone: workspace.milestones,
                wrapper: workspace.wrappers,
                text: workspace.text,
                // textOccurencesArray: [1, 1, 1, 2, 4],
                // workspace.greekTextOccurences = 0,
                // workspace.textOccurences = 0,
                // workspace.greekTextOccurencePos = 0,
                // workspace.textOccurencePos = 0,
                // workspace.text = ""
            }
        );
    }
}

const makeAlignmentActions = {
    startDocument: [
        {
            description: "Set up state variables and output",
            test: () => {return true;},
            // action: ({config, context, workspace, output}) => {
            //     workspace.chapter = null;
            //     workspace.verses = null;
            //     workspace.matches = new Set([]);
            //     workspace.chunks = [];
            //     output.report = {};
            //     if (config.regex) {
                    
            //     }
            // }
            action: ({workspace, output}) => {
                workspace.chapter = null;
                workspace.verses = null;
                workspace.milestones = [];
                workspace.wrappers = [];
                workspace.greekTextOccurences = 0;
                workspace.textOccurences = 0;
                workspace.greekTextOccurencePos = 0;
                workspace.textOccurencePos = 0;
                workspace.text = "";
                output.report = [];
            }
        },
    ],
    startMilestone: [
        {
            description: "what to do when we start a milestone",
            test: ({context}) => {
                if (context.sequences[0].element.subType === "usfm:zaln") {
                    return true;
                }
                return false;
            },
            action: ({context, workspace, output}) => {
                console.log("startMilestone context : ", workspace.chapter, " verse ", workspace.verses, " context : ", context);
            }
        }
    ],
    endMilestone: [
        {
            description: "Wrapup the current milestone into the output.report",
            test: ({context}) => {
                if (context.sequences[0].element.subType === "usfm:zaln") {
                    return true;
                }
                return false;
            },
            action: ({context, workspace, output}) => {
                console.log("startMilestone context : ", workspace.chapter, " verse ", workspace.verses, " context : ", context);
            }
        }
    ],
    // startmilestone: ["type": "start_milestone", "subType": "usfm:zaln",
    mark: [
        {
            description: "Ignore mark events, except for chapter and verses",
            // test: ({context}) => {
            //     console.log("### ACTION mark");
            //     return !['chapter', 'verses'].includes(context.sequences[0].element.subType);
            // },
            test: () => true,
            action: ({config, context, workspace, output}) => {
                // console.log("##### MARK workspace : ", workspace);
                const element = context.sequences[0].element;
                // console.log("mark", element.subType, element.content);
                if (element.subType === 'chapter') {
                    // processAlignment(config, workspace, output);
                    workspace.chapter = element.atts['number'];
                    workspace.verses = 0;
                } else if (element.subType === 'verses') {
                    // processAlignment(config, workspace, output);
                    workspace.verses = element.atts['number'];
                }
            }
        },
    ],
    text: [
        {
            // ?????????????? TODO ask Mark if this is the right way to initialize the context
            description: "Process text events",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                // let workspace = environment.workspace;
                // // TODO ? workspace.contect vs context ??
                // // if(context.sequences[0] > 0) {
                //     console.log("########### context ########### : ", context);
                // // }
                // console.log("########### workspace ########### : ", workspace);
                // const element = context.sequences[0].element;
                // const text = element.text;
                // console.log("text : ", text);
                // processAlignment(workspace, environment.output, text);
            }
        }
    ]
};

const makeAlignmentCode = function ({perf}) {
    const cl = new ProskommaRenderFromJson(
        {
            srcJson: perf,
            actions: makeAlignmentActions
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
