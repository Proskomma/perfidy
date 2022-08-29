import {PerfRenderFromJson} from 'proskomma-json-tools';

const localuniqueWordsActions = {
    startDocument: [
        {
            description: "Set up word object",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                workspace.words = {}
            }
        },
    ],
    text: [
        {
            description: "Split strings and add words to word object",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                for (let word of context.sequences[0].element.text.split(/[\s:;,.]+/).filter(w => w.length > 0)) {
                    word = word.toLowerCase();
                    if (word in workspace.words) {
                        workspace.words[word] += 1;
                    } else {
                        workspace.words[word] = 1;
                    }
                }
            }
        }
    ],
    endDocument: [
        {
            description: "Filter words",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                output.words = [...Object.entries(workspace.words)]
                    .filter((w) => w[1] === 1 );
            }
        },
    ],
};

const uniqueWordsCode = function ({perf}) {
    const cl = new PerfRenderFromJson({srcJson: perf, actions: localuniqueWordsActions});
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
        return {words: output.words};
}

const uniqueWords = {
    name: "uniqueWords",
        type: "Transform",
        description: "PERF=>JSON: finds unique words",
        inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
    ],
        outputs: [
        {
            name: "words",
            type: "json",
        }
    ],
        code: uniqueWordsCode
}

export default uniqueWords;
