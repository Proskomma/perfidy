import {PerfRenderFromJson} from 'proskomma-json-tools';

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

const processVerseMarks = (workspace, output) => {
    if (!output.stats.cvData[workspace.chapter]) {
        output.stats.cvData[workspace.chapter] = {
            verseNumbers: []
        };
    }
    output.stats.cvData[workspace.chapter].verseNumbers.push(parseInt(workspace.verses));
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
                output.stats.cvData = {};
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
                    if (element.atts['number'] > 1) {
                        processVerse(workspace, output);
                    }
                    workspace.chapter = element.atts['number'];
                    workspace.verses = 0
                } else if (element.subType === 'verses') {
                    if (workspace.verses > 0 || workspace.verseLength > 0) {
                        if (workspace.verses === 0) {
                            processVerseMarks(workspace, output); // verse 0
                        }
                        processVerse(workspace, output);
                    }
                    workspace.verses = element.atts['number'];
                    processVerseMarks(workspace, output);
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
            description: "Count last Verse; Produce aggregate stats",
            test: () => true,
            action: ({workspace, output}) => {
                processVerse(workspace, output);
                output.stats.nVerses = Object.values(output.stats.lengthFrequencies).reduce((a, b) => a + b);
                const lengthInts = Object.keys(output.stats.lengthFrequencies).map(k => parseInt(k));
                output.stats.maxVerseLength = Math.max(...lengthInts);
                output.stats.minVerseLength = Math.min(...lengthInts);
                output.stats.nWords = Object.entries(output.stats.lengthFrequencies)
                    .map(tpl => parseInt(tpl[0]) * tpl[1])
                    .reduce((a, b) => a + b);
                output.stats.meanVerseLength = output.stats.nWords / output.stats.nVerses;
                for (const cvChapter of Object.keys(output.stats.cvData)) {
                    output.stats.cvData[cvChapter].firstVerse = Math.min(...output.stats.cvData[cvChapter].verseNumbers);
                    output.stats.cvData[cvChapter].lastVerse = Math.max(...output.stats.cvData[cvChapter].verseNumbers);
                    delete output.stats.cvData[cvChapter].verseNumbers;
                }
            }
        }
    ]
};

const verseStatsCode = function ({perf}) {
    const cl = new PerfRenderFromJson({srcJson: perf, actions: verseStatsActions});
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
    return {stats: output.stats};
}

const verseStats = {
    name: "verseStats",
    type: "Transform",
    description: "PERF=>JSON: Generates verse statistics",
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
