import { ProskommaRenderFromJson, transforms, mergeActions } from 'proskomma-json-tools';
import xre from "xregexp";

const lexingRegexes = [
    [
        "printable",
        "wordLike",
        xre("([\\p{Letter}\\p{Number}\\p{Mark}\\u2060]{1,127})"),
    ],
    ["printable", "lineSpace", xre("([\\p{Separator}\t]{1,127})")],
    [
        "printable",
        "punctuation",
        xre(
            "([\\p{Punctuation}\\p{Math_Symbol}\\p{Currency_Symbol}\\p{Modifier_Symbol}\\p{Other_Symbol}])"
        ),
    ],
    ["bad", "unknown", xre("(.)")],
];
const re = xre.union(lexingRegexes.map((x) => x[2]));

const localMergeMarkupActions = {
    startDocument: [
        {
            description: "setup",
            test: () => true,
            action: ({ workspace }) => {
                workspace.chapter = null;
                workspace.verses = null;
                workspace.currentOccurrences = {};
                return true;
            },
        },
    ],
    text: [
        {
            description: "add-to-text",
            test: () => true,
            action: ({ config, context, workspace, output }) => {
                try {
                    const text = context.sequences[0].element.text;
                    const words = xre.match(text, re, "all");
                    const { chapter, verses } = workspace;
                    if (!verses) return true;
                    const { totalOccurrences, strippedMarkup } = config;
                    for (const word of words) {
                        workspace.currentOccurrences[word] ??= 0;
                        workspace.currentOccurrences[word]++;
                        const strippedKey = (position) =>
                            [
                                position,
                                word,
                                workspace.currentOccurrences[word],
                                totalOccurrences[chapter][verses][word],
                            ].join("--");

                        const before =
                            strippedMarkup[chapter][verses][strippedKey("before")]?.map(
                                ({ payload }) => workspace.outputContentStack[0].push(payload)
                            )
                        const after = 
                            strippedMarkup[chapter][verses][strippedKey("after")]?.map(
                                ({ payload }) => workspace.outputContentStack[0].push(payload)
                            );

                        if (!before && !after) workspace.outputContentStack[0].push(word);
                    }
                    return false;
                } catch (err) {
                    console.error(err);
                    throw err;
                }
            },
        },
    ],
    mark: [
        {
            description: "mark-chapters",
            test: ({ context }) => context.sequences[0].element.subType === "chapter",
            action: ({ config, context, workspace, output }) => {
                const element = context.sequences[0].element;
                workspace.chapter = element.atts["number"];
                workspace.verses = 0;
                return true;
            },
        },
        {
            description: "mark-verses",
            test: ({ context }) => context.sequences[0].element.subType === "verses",
            action: ({ config, context, workspace, output }) => {
                const element = context.sequences[0].element;
                workspace.verses = element.atts["number"];
                workspace.currentOccurrences = { something: "abel" };
                return true;
            },
        },
    ],
};

const mergeMarkupCode = function ({ perf, verseWords: totalOccurrences, stripped: strippedMarkup }) {
    const cl = new ProskommaRenderFromJson(
        {
            srcJson: perf,
            actions: mergeActions(
                [
                    localMergeMarkupActions,
                    transforms.identityActions
                ]
            )
        }
    );
    const output = {};
    cl.renderDocument({
        docId: "",
        config: { totalOccurrences, strippedMarkup },
        output,
    });
    return { perf: output.perf }; // identityActions currently put PERF directly in output
}

const mergeMarkup = {
    name: "mergeMarkup",
    type: "Transform",
    description: "PERF=>PERF adds report to verses",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: "",
        },
        {
            name: "stripped",
            type: "json",
            source: "",
        },
        {
            name: "verseWords",
            type: "json",
            source: "",
        },
    ],
    outputs: [
        {
            name: "perf",
            type: "json",
        },
    ],
    code: mergeMarkupCode,
};
export default mergeMarkup;
