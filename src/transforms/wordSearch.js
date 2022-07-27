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
                output.searchTerms = Array.isArray(config.toSearch) || config.toSearch.split(' ');
                output.options = [];
                if (config.ignoreCase) {
                  output.options.push('ignoreCase');
                }
                if (config.andLogic) {
                  output.options.push('andLogic');
                }
                if (config.orLogic) {
                  output.options.push('orLogic');
                }
                if (config.partialMatch) {
                    output.options.push('partialMatch');
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
    const config_ = {
      ...config,
      andLogic: false, // for highlighting we match any found
    }
    workspace.chunks.forEach(( value ) => {
        const found = findMatch(config_, value, search, workspace);
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
    if (config.regex) {
        return workspace.regex.test(text);
    } 
    
    const isSearchArray = Array.isArray(search);
    if (config.ignoreCase) {
    text = text.toLowerCase();
    if (isSearchArray) {
      search = search.map(item => item.toLowerCase());
    } else {
      search = search.toLowerCase();
    }
  }

  if (!isSearchArray) {
    search = [search];
  }
  
  if (!config.partialMatch) { // if word search, we separate text into array of words to match
    text = text.split(' ');
  }
  
  let allMatched = true;
  let anyMatched = false;
  for (const searchTerm of search) {
    const found = text.includes(searchTerm);
    if (!found) {
      allMatched = false;
    } else {
      anyMatched = true;
    }
  }
  if (config.andLogic) {
    return allMatched;
  } else { // doing or logic
    return anyMatched;
  }
}

const doSearch = function(workspace, config){
    if (workspace.chunks.size){
        let text = '' 
        workspace.chunks.forEach(( value ) => {
            let lastChar = text && text.substring(text.length-1)
            // TODO : need to fix punctuation spacing
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

const wordSearchCode = function ({perf, searchString, ignoreCase = '1', logic = '', regex = '0', partialMatch = '0'}) {
    const cl = new ProskommaRenderFromJson({srcJson: perf, actions: localWordSearchActions});
    const output = {};
    const ignoreCase_ = ignoreCase.trim() === '1';
    logic = logic.trim().substring(0,1).toUpperCase();
    const andLogic_ = logic === 'A';
    const orLogic_ = logic === 'O';
    const partialMatch_ = partialMatch && partialMatch.trim() === '1';
    let regex_ = regex.trim() === '1';
    let regexFlags = '';
    let toSearch = searchString.trim();
    if ( toSearch.startsWith('/') && toSearch.includes('/', 2) ) {
        regex_ = true;
        const regexParts = toSearch.split('/');
        toSearch = regexParts[1];
        regexFlags = regexParts[2];

      if (ignoreCase && ! regexFlags.includes('i')) {
        regexFlags += 'i';
      }
    } else if ((andLogic_ || orLogic_) && toSearch) {
      toSearch = toSearch.split(' ');
    }

    cl.renderDocument({
        docId: "",
        config: {
            toSearch,
            ignoreCase: ignoreCase_,
            andLogic: andLogic_,
            orLogic: orLogic_,
            partialMatch: partialMatch_,
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
            name: "logic",
            type: "text",
            source: ""
        },
        {
            name: "partial",
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
