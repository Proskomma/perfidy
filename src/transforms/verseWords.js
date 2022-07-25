import {ProskommaRenderFromJson} from 'proskomma-json-tools';

const localVerseWordsActions = {
    startDocument: [
        {
            description: "Set up storage",
            test: () => true,
            action: ({workspace, output}) => {
                workspace.verseContent = [];
                workspace.chapter = null;
                workspace.verses = null;
                output.cv = {};
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
                    workspace.verses = 0
                    output.cv[workspace.chapter] = {};
                    output.cv[workspace.chapter][workspace.verses] = {};
                } else if (element.subType === 'verses') {
                    workspace.verses = element.atts['number'];
                    output.cv[workspace.chapter][workspace.verses] = {};
                }
            }
        },
    ],
    text: [
        {
            description: "Log occurrences",
            test: () => true,
            action: ({ context, workspace, output }) => {
                const text = context.sequences[0].element.text;
                const words = text.split(/\s+/);
                for (const word of words) {
                    if (output.cv[workspace.chapter][workspace.verses][word]) {
                        output.cv[workspace.chapter][workspace.verses][word] += 1;
                    }
                    else {
                        output.cv[workspace.chapter][workspace.verses][word] = 1;
                    }
                }
            }
        }
    ]
};

const verseWordsCode = function ({ perf }) {
    const cl = new ProskommaRenderFromJson(
        {
            srcJson: perf,
            actions: localVerseWordsActions
        }
    );
    const output = {};
    cl.renderDocument({ docId: "", config: {}, output });
    return { verseWords: output.cv };
}

const verseWords = {
    name: "verseWords",
    type: "Transform",
    description: "PERF=>JSON: Counts words occurrences",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
    ],
    outputs: [
        {
            name: "verseWords",
            type: "json",
        }
    ],
    code: verseWordsCode
}
export default verseWords;
