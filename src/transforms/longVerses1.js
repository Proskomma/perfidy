import xre from 'xregexp';
import {PerfRenderFromJson} from 'proskomma-json-tools';

const processVerse = (config, workspace, output) => {
    if (workspace.chapter && workspace.verses && workspace.verseLength > config.maxLength) {
        output.report.push(
            {
                chapter: workspace.chapter,
                verses: workspace.verses,
                payload: [
                    {
                        type: "wrapper",
                        subtype: "x-check-warning",
                        content: [
                            `This verse is long (${workspace.verseLength} words)`
                        ]
                    }
                ]
            }
        );
        workspace.verseLength = 0;
    }
}

const longVerses1Actions = {
    startDocument: [
        {
            description: "Set up storage",
            test: () => true,
            action: ({workspace, output}) => {
                workspace.verseLength = 0;
                workspace.chapter = null;
                workspace.verses = null;
                output.report = [];
            }
        },
    ],

    mark: [
        {
            description: "Update CV state",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                const element = context.sequences[0].element;
                if (element.subType === 'chapter') {
                    processVerse(config, workspace, output);
                    workspace.chapter = element.atts['number'];
                    workspace.verses = 0;
                } else if (element.subType === 'verses') {
                    processVerse(config, workspace, output);
                    workspace.verses = element.atts['number'];
                }
            }
        }
    ],
    text: [
        {
            description: "Update verse text running totals",
            test: () => true,
            action: ({context, workspace}) => {
                const re = xre('([\\p{Letter}\\p{Number}\\p{Mark}\\u2060]{1,127})');
                const newContent = xre.match(context.sequences[0].element.text, re, 'all');
                workspace.verseLength += newContent.length;
            }
        }
    ],
};

const longVerses1Code = function ({perf}) {
    const cl = new PerfRenderFromJson({srcJson: perf, actions: longVerses1Actions});
    const output = {};
    cl.renderDocument({docId: "", config: {maxLength: 60}, output});
    return {report: output.report};
}

const longVerses1 = {
    name: "longVerses1",
    type: "Transform",
    description: "PERF=>JSON: Generates naive long verses report",
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
    code: longVerses1Code
}

export default longVerses1;
