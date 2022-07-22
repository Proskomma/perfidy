import {ProskommaRenderFromJson} from 'proskomma-json-tools';

const perfLengthVerseActions = {
    startDocument: [
        {
            description: "Set up word object",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                workspace.length =  null
                workspace.chapter = null;
                workspace.verses = null;
                output.stats = {}
                output.stats.count = 0
                
                output.lengths = {} 
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
                    workspace.chapter = element.atts['number'];
                    workspace.verses = 0

                    const lengthKey =   `${workspace.length}`
                    if(output.lengths[lengthKey]){
                        output.lengths[lengthKey] += 1
                        output.stats.count += 1
                    }
                    else
                    {
                        output.lengths[lengthKey] = 1
                    }
                    workspace.length = 0

                } else if (element.subType === 'verses') {
                    if(workspace.verses > 1 || workspace.length > 0){
                    workspace.verses = element.atts['number'];
                    const lengthKey =   `${workspace.length}`
                    if(output.lengths[lengthKey]){
                        output.lengths[lengthKey] += 1
                        output.stats.count += 1
                    }
                    else
                    {
                        output.lengths[lengthKey] = 1
                    }
                }
                    workspace.length = 0
                    
                }
            }
        },
    ],
    text: [
        {
            description: "Count length",
            test: () => true,
            action: ({config, context, workspace, output}) => {
              
                    workspace.length += context.sequences[0].element.text
                    .trim()
                    .split(/\\s+/)
                    .map(s => s.trim())
                    .filter(s => s.length > 0 ).length
                    
                    
                }
            }
    ],
    endSequence: [
        {
            description :"Count last Verse",
            test: () => true,
            action: ({config, context, workspace, output}) => {

                const lengthKey =   `${workspace.length}`
                    if(output.lengths[lengthKey]){
                        output.lengths[lengthKey] += 1
                        output.stats.count += 1
                    }
                    else
                    {
                        output.lengths[lengthKey] = 1
                    }
                    let countVerse = Object.values(output.lengths).reduce((a,b) => a + b)
                    console.log(countVerse)
                    
                    const lengthInts = Object.keys(output.lengths).map(k => parseInt(k))
                    output.stats.max = Math.max(...Object.keys(lengthInts))
                    output.stats.min = Math.min(...Object.keys(lengthInts))
                    output.stats.mean = Object.entries(output.lengths)
                    .map(tpl => parseInt(tpl[0]) * tpl[1])
                    .reduce((a,b)=> a + b)/countVerse

                    
            }
        }
    ]
};

const perfLengthVerseCode = function ({perf}) {
    const cl = new ProskommaRenderFromJson({srcJson: perf, actions: perfLengthVerseActions});
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
        return {lengths: output.lengths, stats: output.stats};
}

const perfLengthVerse = {
    name: "perfLengthVerse",
        type: "Transform",
        description: "Counts the occurrence of each word in a PERF document",
        inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
    ],
        outputs: [
        {
            name: "lengths",
            type: "json",
        },
        {
            name: "stats",
            type: "json",
        }
    ],
        code: perfLengthVerseCode
}

export default perfLengthVerse;
