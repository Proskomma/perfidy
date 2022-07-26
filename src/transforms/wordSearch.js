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
                    doSearch(workspace, config);
                    workspace.chapter = element.atts['number'];
                    workspace.chunks = new Set([]);
                } else if (element.subType === 'verses') {
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
                output.bookCode = 'TIT';
                output.searchTerms = config.toSearch.split(' ');
                output.options = [];
                if (config.ignoreCase) {
                    output.options.push('ignoreCase');
                }
                doSearch(workspace, config);
                output.matches = Array.from(workspace.matches)
                    .sort((a, b) => ((a.chapter * 1000) + a.verses) - ((b.chapter * 1000) + b.verses))
            }
        },
    ],
};

const addMatch = function(workspace, config) {

    const match = {
        chapter: workspace.chapter,
        verses: workspace.verses,
        content: []
    };

    workspace.chunks.forEach(( value ) => {
        if (config.ignoreCase){
            if (value.toLowerCase().includes(config.toSearch.toLowerCase())) {
                match.content.push({
                    type: "wrapper",
                    subtype: "x-search-match",
                    content: [
                        value
                    ]
                });
            } else {
                match.content.push(value);
            }
        }else{
            if (value.includes(config.toSearch)) {
              match.content.push({
                type: "wrapper",
                subtype: "x-search-match",
                content: [
                  value
                ]
              });
            } else {
                match.content.push(value);
            }
        }
    });
    workspace.matches.add( match );
}

const doSearch = function(workspace, config){
    if(workspace.chunks.size){
        let text = '' 
        workspace.chunks.forEach(( value ) => {
            let lastChar = text && text.substring(text.length-1)
            // TODO : need to handle punctation properly
            if(lastChar !== ' ' && value !== ' '){
                text += ' ';
            }
            text += value;
        });
        if (config.ignoreCase){
            if (text.toLowerCase().includes(config.toSearch.toLowerCase())) {
                addMatch(workspace, config);
            }
        } else{
            if (text.includes(config.toSearch)) {
                addMatch(workspace, config);
            }
        }
    }
}

const wordSearchCode = function ({perf, searchString, ignoreCase}) {
    const cl = new ProskommaRenderFromJson({srcJson: perf, actions: localWordSearchActions});
    const output = {};
    const ignoreCase_ = ignoreCase.trim() === '1';
    cl.renderDocument({docId: "", config: {toSearch: searchString.trim(), ignoreCase: ignoreCase_}, output});
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
        {
            name: "ignoreCase",
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
