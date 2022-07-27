import { ProskommaRenderFromJson } from 'proskomma-json-tools';
import xre from "xregexp";

const localWordsWrappersActions = {
    startDocument: [
        {
            description: "Set up storage",
            test: () => true,
            action: ({workspace, output}) => {
                workspace.chapter = null;
                workspace.verses = null;
                workspace.currentOccurrences = {}
                output.wrappers = {};
            }
        },
    ],
    mark: [
        {
            description: "Update CV state",
            test: () => true,
            action: ({ context, workspace, output }) => {
                try {
                    const { element } = context.sequences[0];
                    if (element.subType === 'chapter') {
                        workspace.chapter = element.atts['number'];
                        workspace.verses = 0
                        output.wrappers[workspace.chapter] = {};
                        workspace.currentOccurrences = {}
                    } else if (element.subType === 'verses') {
                        workspace.verses = element.atts['number'];
                        workspace.currentOccurrences = {}
                    }
                } catch (err) {
                    console.error(err)
                    throw err;
                }
            }
        },
    ],
    text: [
        {
            description: "Log occurrences",
            test: () => true,
            action: ({ context, workspace, output, config }) => {
                try {
                    const { chapter, verses } = workspace;
                    const { verseWords: totalOccurrences } = config;
                    console.log({totalOccurrences})
                    const { text } = context.sequences[0].element;
                    const re = xre('([\\p{Letter}\\p{Number}\\p{Mark}\\u2060]{1,127})')
                    const words = xre.match(text, re, "all");
                    output.wrappers[chapter][verses] ??= [];
                    for (const word of words) {
                        workspace.currentOccurrences[word] ??= 0;
                        workspace.currentOccurrences[word]++;
                        output.wrappers[chapter][verses].push({
                            word,
                            occurrence: workspace.currentOccurrences[word],
                            occurrences: totalOccurrences[chapter][verses][word]
                        });
                    }
                } catch (err) {
                    console.error(err)
                    throw err;
                }
            }
        }
    ]
};

const wordsWrappersCode = function ({ perf, verseWords }) {
    const cl = new ProskommaRenderFromJson(
        {
            srcJson: perf,
            actions: localWordsWrappersActions
        }
    );
    const output = {};
    cl.renderDocument({ docId: "", config: { verseWords }, output });
    return { wordsWrappers: output.wrappers };
}

const wordsWrappers = {
    name: "wordsWrappers",
    type: "Transform",
    description: "PERF=>JSON: construct each verse words wrappers",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
      },
      {
          name: "verseWords",
          type: "json",
          source: ""
      },
    ],
    outputs: [
        {
            name: "wordsWrappers",
            type: "json",
        }
    ],
    code: wordsWrappersCode
}
export default wordsWrappers;
