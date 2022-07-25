import {ProskommaRenderFromJson} from 'proskomma-json-tools';

const localToUsfmActions = {
    startDocument: [
        {
            description: "Set up environment",
            test: () => true,
            action: ({context, workspace}) => {
                workspace.usfmBits = [''];
                for (
                    let [key, value] of
                    Object.entries(context.document.metadata.document)
                        .filter(kv => !['tags', 'properties', 'bookCode'].includes(kv[0]))
                    ) {
                    if (['toc', 'toca'].includes(key)) {
                        key += '1';
                    }
                    workspace.usfmBits.push(`\\${key} ${value}\n`);
                };
            }
        },
    ],
    blockGraft: [
        {
            description: "Follow block grafts",
            test: ({context}) => ['title', 'heading', 'introduction'].includes(context.sequences[0].block.subType),
            action: (environment) => {
                const target = environment.context.sequences[0].block.target;
                if (target) {
                    environment.context.renderer.renderSequenceId(environment, target);
                }
            }
        }
    ],
    inlineGraft: [
        {
            description: "Follow inline grafts",
            test: () => false,
            action: (environment) => {
                const target = environment.context.sequences[0].element.target;
                if (target) {
                    environment.context.renderer.renderSequenceId(environment, target);
                }
            }
        }
    ],

    startParagraph: [
        {
            description: "Output paragraph tag",
            test: () => true,
            action: ({context, workspace}) => {
                workspace.usfmBits.push(`\n\\${context.sequences[0].block.subType.split(':')[1]}\n`);
            }
        }
    ],
    endParagraph: [
        {
            description: "Output nl",
            test: () => true,
            action: ({workspace}) => {
                workspace.usfmBits.push(`\n`);
            }
        }
    ],
    text: [
        {
            description: "Output text",
            test: () => true,
            action: ({context, workspace}) => {
                const text = context.sequences[0].element.text;
                workspace.usfmBits.push(text);
            }
        },
    ],
    mark: [
        {
            description: "Output chapter or verses",
            test: () => true,
            action: ({context, workspace}) => {
                const element = context.sequences[0].element;
                if (element.subType === 'chapter') {
                    workspace.usfmBits.push(`\n\\c ${element.atts['number']}\n`);
                } else if (element.subType === 'verses') {
                    workspace.usfmBits.push(`\\v ${element.atts['number']}\n`);
                }
            }
        },
    ],
    endDocument: [
        {
            description: "Build output",
            test: () => true,
            action: ({workspace, output}) => {
                const reorderedChapters = workspace.usfmBits.reduce((a,b) =>{
                    if (a && a.length>0 && b.startsWith(`\n\\c `)){
                        const lastA = a[a.length-1]
                        const restA = a.slice(0,a.length-2)
                        return [...restA, b, lastA]
                    }
                    return a.concat([b])
                });
                output.usfm = reorderedChapters.join('');
            }
        },
    ]
};

const perf2usfmCode = function ({perf}) {
    const cl = new ProskommaRenderFromJson({srcJson: perf, actions: localToUsfmActions});
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
        return {usfm: output.usfm};
}

const perf2usfm = {
    name: "perf2usfm",
    type: "Transform",
    description: "PERF=>USFM",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
    ],
    outputs: [
        {
            name: "usfm",
            type: "text",
        }
    ],
    code: perf2usfmCode
}
export default perf2usfm;
