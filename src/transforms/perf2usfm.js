import {ProskommaRenderFromJson} from 'proskomma-json-tools';

const initNestedLevel = (workspace,level) => {
    workspace.nestInx=level
    workspace.usfmBits[level] = [];
}

const pushStrAtLevel = (workspace,str,level = 0) => {
    workspace.usfmBits[level].push(str);
}

const nestedPushStr = (workspace,str) => 
    pushStrAtLevel(workspace,str,workspace.nestInx)

const upNestingLevel = (workspace,saveEl) => {
    workspace.savedEl.push(saveEl)
    initNestedLevel(workspace,workspace.nestInx+1)
}

const popNestedElement = (workspace) => workspace.savedEl.pop()

const popNestedUsfmBits = (workspace) => {
    const retArr = workspace.usfmBits[workspace.nestInx]
    workspace.usfmBits[workspace.nestInx] = [];
    return retArr
}

const downNestingLevel = workspace => {
    const tempArr = popNestedUsfmBits(workspace)
    if (workspace.nestInx>0){
        workspace.nestInx--
    }
    workspace.usfmBits[workspace.nestInx].push(...tempArr)
} 

const localToUsfmActions = {
    startDocument: [
        {
            description: "Set up environment",
            test: () => true,
            action: ({context, workspace}) => {
                workspace.usfmBits = [];
                workspace.savedEl = [];
                initNestedLevel(workspace,0);
                for (
                    let [key, value] of
                    Object.entries(context.document.metadata.document)
                        .filter(kv => !['tags', 'properties', 'bookCode'].includes(kv[0]))
                    ) {
                    if (['toc', 'toca'].includes(key)) {
                        key += '1';
                    }
                    nestedPushStr(workspace,`\\${key} ${value}\n`);
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
                nestedPushStr(workspace,`\n\\${context.sequences[0].block.subType.split(':')[1]}\n`);
            }
        }
    ],
    endParagraph: [
        {
            description: "Output nl",
            test: () => true,
            action: ({workspace}) => {
                nestedPushStr(workspace,`\n`);
            }
        }
    ],
    text: [
        {
            description: "Output text",
            test: () => true,
            action: ({context, workspace}) => {
                const text = context.sequences[0].element.text;
                nestedPushStr(workspace,text);
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
                    nestedPushStr(workspace,`\n\\c ${element.atts['number']}\n`);
                } else if (element.subType === 'verses') {
                    nestedPushStr(workspace,`\\v ${element.atts['number']}\n`);
                }
            }
        },
    ],
    endDocument: [
        {
            description: "Build output",
            test: () => true,
            action: ({workspace, output}) => {
                const reorderedChapters = workspace.usfmBits[0].reduce((a,b) =>{
                    if (a && a.length>0 && b.startsWith(`\n\\c `)){
                        const lastA = a[a.length-1]
                        const restA = a.slice(0,a.length-2)
                        return [...restA, b, lastA]
                    }
                    return [...a,b]
                });
                output.usfm = reorderedChapters.join('');
            }
        },
    ],
    startMilestone: [
        {
            description: "Output start of milestone",
            test: () => true,
            action: ({context,workspace}) => {
                const element = context.sequences[0].element;
                if (element 
                    && element.atts 
                    && Object.keys(element.atts).length>0)
                {
                    nestedPushStr(workspace,`\\zaln-s |`);
                    let separatorCh = "";
                    Object.keys(element.atts).forEach(key => {
                        nestedPushStr(workspace,`${separatorCh}${key}="${element.atts[key]}"`);
                        separatorCh = " "
                    })
                    nestedPushStr(workspace,`\\*`);
                }
            }
        }
    ],
    endMilestone: [
        {
            description: "Output end of milestone",
            test: () => true,
            action: ({workspace}) => {
                nestedPushStr(workspace,`\\zaln-e\\*`);
            }
        }
    ],
    startWrapper: [
        {
            description: "Output start of wrapper",
            test: () => true,
            action: ({context,workspace}) => {
                upNestingLevel(workspace,context.sequences[0].element)
            }
        }
    ],
    endWrapper: [
        {
            description: "Output end of wrapper",
            test: () => true,
            action: ({context,workspace}) => {
                const savedStartEl = popNestedElement(workspace)
                const nestedUsfmBits = popNestedUsfmBits(workspace)
                downNestingLevel(workspace)
                if (savedStartEl 
                    && savedStartEl.atts 
                    && Object.keys(savedStartEl.atts).length>0)
                {
                    nestedPushStr(workspace,`\\w ${nestedUsfmBits.join('')}|`);
                    let separatorCh = "";
                    Object.keys(savedStartEl.atts).forEach(key => {
                        nestedPushStr(workspace,
                            `${separatorCh}${key}="${savedStartEl.atts[key]}"`);
                        separatorCh = " "
                    })
                }
                nestedPushStr(workspace,`\\w*`);
            }
        }
    ],
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
