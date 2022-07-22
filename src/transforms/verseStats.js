import {ProskommaRenderFromJson} from 'proskomma-json-tools';

const processVerse = (workspace, output) => {
    const lengthKey = `${workspace.verseLength}`;
    if (output.stats.lengthFrequencies[lengthKey]) {
        output.stats.lengthFrequencies[lengthKey] += 1;
    } else {
        output.stats.lengthFrequencies[lengthKey] = 1;
    }
    workspace.verseLength = 0;
    workspace.verseContent = [];
}

const verseStatsActions = {
    startDocument: [
        {
            description: "Set up storage",
            test: () => true,
            action: ({workspace, output}) => {
                workspace.verseLength = 0;
                workspace.verseContent = [];
                workspace.chapter = null;
                workspace.verses = null;
                output.stats = {};
                output.stats.lengthFrequencies = {};
            }
        },
    ],

    mark: [
        {
            description: "Update CV state",
            test: () => true,
            action: ({context, workspace, output}) => {
                const element = context.sequences[0].element;
                if (element.subType === 'chapter') {
                    workspace.chapter = element.atts['number'];
                    if (workspace.chapter > 1) {
                        processVerse(workspace, output);
                    }
                    workspace.verses = 0
                } else if (element.subType === 'verses') {
                    if (workspace.verses > 1 || workspace.verseLength > 0) {
                        workspace.verses = element.atts['number'];
                        processVerse(workspace, output);
                    }
                }
            }
        },
    ],
    text: [
        {
            description: "Update verse text running totals",
            test: () => true,
            action: ({context, workspace}) => {
                const newContent = context.sequences[0].element.text
                    .split(/\s+/)
                    .map(s => s.trim())
                    .filter(s => s.length > 0);
                newContent.forEach(c => workspace.verseContent.push(c));
                workspace.verseLength += newContent.length;
            }
        }
    ],
    endSequence: [
        {
            description: "Count last Verse",
            test: () => true,
            action: ({workspace, output}) => {
                processVerse(workspace, output);
                output.stats.nVerses = Object.values(output.stats.lengthFrequencies).reduce((a, b) => a + b);
                const lengthInts = Object.keys(output.stats.lengthFrequencies).map(k => parseInt(k));
                output.stats.max = Math.max(...lengthInts);
                output.stats.min = Math.min(...lengthInts);
                output.stats.total = Object.entries(output.stats.lengthFrequencies)
                    .map(tpl => parseInt(tpl[0]) * tpl[1])
                    .reduce((a, b) => a + b);
                output.stats.mean = output.stats.total / output.stats.nVerses;


            }
        }
    ]
};

const verseStatsCode = function ({perf}) {
    const cl = new ProskommaRenderFromJson({srcJson: perf, actions: verseStatsActions});
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
    return {stats: output.stats};
}

const verseStats = {
    name: "verseStats",
    type: "Transform",
    description: "Generates verse statistics",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
    ],
    outputs: [
        {
            name: "stats",
            type: "json",
        }
    ],
    code: verseStatsCode
}

export default verseStats;
