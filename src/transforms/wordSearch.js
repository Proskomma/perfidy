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
                if (config.regex) {
                    workspace.regex = new RegExp(config.toSearch, config.regexFlags);
                }
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
                if (config.andLogic) {
                  output.options.push('andLogic');
                }
                if (config.regex) {
                    output.options.push('regex');
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

    let search = config.toSearch;
    workspace.chunks.forEach(( value ) => {

        const found = findMatch(config, value, search, workspace);
        if (found) {
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
    });
    workspace.matches.add( match );
}

function findMatch(config, text, search, workspace) {

    let found;
    if (config.regex) {
        found = workspace.regex.test(text);
    } else {
        if (config.ignoreCase) {
            text = text.toLowerCase();
            search = search.toLowerCase();
        }
        found = text.includes(search);
    }

    return found
}

const doSearch = function(workspace, config){
    if (workspace.chunks.size){
        let text = '' 
        workspace.chunks.forEach(( value ) => {
            let lastChar = text && text.substring(text.length-1)
            // TODO : need to handle punctuation properly
            if (lastChar !== ' ' && value !== ' '){
                text += ' ';
            }
            text += value;
        });
        
        let search_ = config.toSearch;
        const found = findMatch(config, text, search_, workspace);
        if (found) {
            addMatch(workspace, config);
        }
    }
}

const wordSearchCode = function ({perf, searchString, ignoreCase = '1', andLogic = '1', regex = '0'}) {
    const cl = new ProskommaRenderFromJson({srcJson: perf, actions: localWordSearchActions});
    const output = {};
    const ignoreCase_ = ignoreCase.trim() === '1';
    const andLogic_ = andLogic.trim() === '1';
    let regex_ = regex.trim() === '1';
    let regexFlags = '';
    let toSearch = searchString.trim();
    if ( toSearch.startsWith('/') && toSearch.includes('/', 2) ) {
        regex_ = true;
        const regexParts = toSearch.split('/');
        toSearch = regexParts[1];
        regexFlags = regexParts[2];
    }

    if (ignoreCase && ! regexFlags.includes('i')) {
        regexFlags += 'i';
    }

    cl.renderDocument({
        docId: "",
        config: {
            toSearch,
            ignoreCase: ignoreCase_,
            andLogic: andLogic_,
            regex: regex_,
            regexFlags
        },
        output});
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
        {
            name: "regex",
            type: "text",
            source: ""
        },
        {
            name: "andLogic",
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
