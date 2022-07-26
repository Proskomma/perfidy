import {ProskommaRenderFromJson} from 'proskomma-json-tools';

const localWordSearchActions = {
    startDocument: [
        {
            description: "Set up state variables and output",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                workspace.chapter = null;
                workspace.verses = null;
                workspace.matches = new Set([]);
                workspace.chunks = new Set([]);
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
                    // toDo : add Search
                    doSearch(workspace, config);
                    workspace.chapter = element.atts['number'];
                    workspace.chunks = new Set([]);
                } else if (element.subType === 'verses') {
                    // toDo : add Search
                    doSearch(workspace, config);
                    workspace.verses = element.atts['number'];
                    workspace.chunks = new Set([]);
                }
            }
        },
    ],
    text: [
        {
            description: "Add matching verses to set",
            test: ({context, workspace}) => workspace.chapter && workspace.verses,
            action: ({config, context, workspace, output}) => {
                const text = context.sequences[0].element.text;
                workspace.chunks.add(text);
            }
        },
    ],
    endDocument: [
        {
            description: "Sort matches",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                doSearch(workspace, config);
                output.matches = Array.from(workspace.matches)
                    .map(cv => cv.split(':').map(b => parseInt(b)))
                    .sort((a, b) => ((a[0] * 1000) + a[1]) - ((b[0] * 1000) + b[1]))
                    .map(cva => cva.join(':'))
            }
        },
    ],
};

const doSearch = function(workspace, config){
    if(workspace.chunks.size){
        let text = '' 
        workspace.chunks.forEach(( value ) => {
            if(text && text.substring(text.length-1) != ' '){
                text += ' ';
            }
            text += value;
        });
        console.log(`${text}`);
        if (text.toLowerCase().includes(config.toSearch.toLowerCase())) {
            workspace.matches.add(`${workspace.chapter}:${workspace.verses}`);
        }
    }
    
}

const wordSearchCode = function ({perf, searchString}) {
    const cl = new ProskommaRenderFromJson({srcJson: perf, actions: localWordSearchActions});
    const output = {};
    cl.renderDocument({docId: "", config: {toSearch: searchString.trim()}, output});
        return {matches: output.matches};
}

const wordSearch = {
    name: "wordSearch",
    type: "Transform",
    description: "PERF=>JSON: Searches for a word",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
        {
            name: "searchString",
            type: "text",
            source: ""
        },
    ],
    outputs: [
        {
            name: "matches",
            type: "json",
        }
    ],
    code: wordSearchCode
}
export default wordSearch;
