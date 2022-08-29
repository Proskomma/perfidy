import {PerfRenderFromJson} from 'proskomma-json-tools';

const processVerse = (config, workspace, output) => {
    if (workspace.chapter && workspace.verses && workspace.matchedWords.length > 0) {
        const matchedWordsString = workspace.matchedWords.join();
        output.report.push(
            {
                chapter: workspace.chapter,
                verses: workspace.verses,
                payload: [
                    {
                        type: "wrapper",
                        subtype: "x-check-warning",
                        content: [
                            `This verse constains words that occur only once in this book: ${matchedWordsString}`
                        ]
                    }
                ]
            }
        );
        workspace.matchedWords = [];
    }
}

const uniqueWordsVersesActions = {
    startDocument: [
        {
            description: "Set up storage",
            test: () => true,
            action: ({workspace, output}) => {
                workspace.chapter = null;
                workspace.verses = null;
                workspace.matchedWords = [];
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
            description: "Update verse with matches",
            test: () => true,
            action: ({context, workspace, config}) => {
                for (let word of context.sequences[0].element.text.split(/[\s:;,.]+/).filter(w => w.length > 0)) {
                    // now we have the list of words in the text
                    word = word.toLowerCase();
                    for ( const incomingWord of config.words ) {
                        if (incomingWord[0] === word ) {
                            workspace.matchedWords.push(word);
                        }
                    }
                }
            }
        }
    ],
};

const uniqueWordsVersesCode = function ({perf, words}) {
    const cl = new PerfRenderFromJson({srcJson: perf, actions: uniqueWordsVersesActions});
    const output = {};
    cl.renderDocument({docId: "", config: {words}, output});
    return {report: output.report};
}

const uniqueWordsVerses = {
    name: "uniqueWordsVerses",
    type: "Transform",
    description: "PERF=>JSON: tbd",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
        {
            name: "words",
            type: "json",
            source: ""
        }
    ],
    outputs: [
        {
            name: "report",
            type: "json",
        }
    ],
    code: uniqueWordsVersesCode
}

export default uniqueWordsVerses;
