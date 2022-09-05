import { PerfRenderFromJson, transforms, mergeActions } from 'proskomma-json-tools';

const reportRecordsForCV = function (report, chapter, verses) {

    return report.filter(
        (record) => record.chapter === chapter && record.verses === verses
    )
}

/**
 * 
 * @param {string} word word to search in
 * @param {boolean} end if true the fucntion wil search at the end of the word
 * @returns {boolean}
 */
const endOrBeginPunctuation = function (word, end=false) {
    let startPunctuation = /^[.,:!?]/;
    let endPunctuation = /[.,:!?]$/;
    if(!end) {
        return startPunctuation.test(word);
    }
    return endPunctuation.test(word);
}

/**
 * Start a new milestone
 * @param {string} strong code of the greek lemma
 * @param {string} lemma root of the greek word
 * @param {string} content greek word
 * @param {string[]} morph array(8) of the description of the nature and function of the greek word
 * @param {string} occ position of the word through all his occurences in the verse
 * @param {string} occs number of occurences in the verse
 * @returns {Object}
 */
const buildANewStartMilestone = function (strong, lemma, content, morph, occ, occs) {
    const ms = {
        "type": "start_milestone",
        "subtype": "usfm:zaln",
        "atts": {
            "x-strong": [
                strong
            ],
            "x-lemma": [
                lemma
            ],
            "x-morph": morph,
            "x-occurrence": [
                occ
            ],
            "x-occurrences": [
                occs
            ],
            "x-content": [
                content
            ]
        }
    };
    return ms;
}

/**
 * 
 * @param {string} content the word
 * @param {string} occ 
 * @param {string} occs 
 * @returns 
 */
const buildWrapper = function (content, occ, occs) {
    const w = {
        "type": "wrapper",
        "subtype": "usfm:w",
        "content": [
            content
        ],
        "atts": {
            "x-occurrence": [
                occ
            ],
            "x-occurrences": [
                occs
            ]
        }
    };
    return w;
}

const buildnewEndMileStone = function() {
    const em = {
        "type": "end_milestone",
        "subtype": "usfm:zaln"
    };
    return em;
}

const makeAlignmentActions = {
    startDocument: [
        {
            description: "setup",
            test: () => true,
            action: ({ workspace }) => {
                workspace.chapter = null;
                workspace.verses = null;
                workspace.arrayWords = [];
                workspace.arraytext = [];
                workspace.isInVerse = false;
                workspace.beginRealtext = false;
                return true;
            }
        }
    ],
    text: [
        {
            description: "Output text",
            test: ({ workspace }) => workspace.isInVerse,
            action: ({ context, workspace, config }) => {
                // start milestone
                // wrapper
                // end milestone
                // text
                const text = context.sequences[0].element.text;
                let elem = structuredClone(context.sequences[0].element);
                workspace.arraytext = text.split(" ");
                let lenWords = workspace.arrayWords.length;
                let currentWord = "";
                let tempPunctuation = "";
                workspace.arraytext.forEach((word) => {
                    if(word === " ") {
                        workspace.outputContentStack[0].push(word);
                        return;
                    }
                    let lenW = word.length;
                    let charFirst = word.charAt(0);
                    let charLast = word.charAt(lenW-1);
                    // if(endOrBeginPunctuation(word)) {
                    //     let realW = word.substring(1, lenW-1);
                    //     let realtxt = charFirst;
                    //     let elem = structuredClone(context.sequences[0].element);
                    //     elem.text = realtxt;
                    // }

                    // if the word ends by a punctuation we remove it
                    
                    let punct = false;
                    if(endOrBeginPunctuation(word, true)) {
                        let realW = word.trim().substring(0, lenW-1);
                        tempPunctuation = charLast;
                        elem.text = realW;
                        punct = true;
                    } else {
                        elem.text = word;
                    }
                    
                    let found = false;
                    let i = 1;
                    
                    while(i < lenWords) {
                        if("word" in workspace.arrayWords[i]) {
                            currentWord = workspace.arrayWords[i]["word"];
                            if(currentWord == elem.text) {
                                found = true;
                                break;
                            }
                        }
                        i++;
                    }

                    if(found) {
                        // startmilestone etc ...
                        let theWrapper = workspace.arrayWords[i];
                        let startM = buildANewStartMilestone(theWrapper["strong"], theWrapper["lemma"], theWrapper["content"], theWrapper["morph"],
                        theWrapper["greekoccurence"] ?? 1, theWrapper["greekoccurences"] ?? 1);

                        workspace.outputContentStack[0].push(startM);

                        let wrapper = buildWrapper(elem.text, theWrapper["frenchoccurence"] ?? 1, theWrapper["frenchoccurences"] ?? 1);

                        workspace.outputContentStack[0].push(wrapper);
                        
                        let endM = buildnewEndMileStone();
                        
                        workspace.outputContentStack[0].push(endM);

                        if(punct) {
                            workspace.outputContentStack[0].push(tempPunctuation + " ");
                        } else {
                            workspace.outputContentStack[0].push(" ");
                        }
                    } else {
                        workspace.outputContentStack[0].push(elem.text + " ");
                    }
                });

                return false;
            }
        },
    ],
    startSequence: [
        {
            description: "ignore the start sequence and drop the notes",
            test: () => true,
            action: ({ workspace }) => {
                workspace.isInVerse = false;
                return true;
            }
        }
    ],
    endSequence: [
        {
            description: "get endSequence events",
            test: () => true,
            action: ({ workspace }) => {
                if (workspace.beginRealtext) {
                    workspace.isInVerse = true;
                }
                return true;
            }
        }
    ],
    mark: [
        {
            description: "mark-chapters",
            test: ({ context }) => context.sequences[0].element.subType === 'chapter',
            action: ({ config, context, workspace, output }) => {
                const element = context.sequences[0].element;
                workspace.chapter = element.atts['number'];
                workspace.verses = 0;
                workspace.isInVerse = false;
                return true;
            }
        },
        {
            description: "mark-verses",
            test: ({ context }) => context.sequences[0].element.subType === 'verses',
            action: ({ config, context, workspace, output }) => {
                const element = context.sequences[0].element;
                workspace.verses = element.atts['number'];
                workspace.isInVerse = true;
                workspace.beginRealtext = true;
                const markRecord = {
                    type: element.type,
                    subtype: element.subType,
                };
                
                const verseRecords = reportRecordsForCV(config.report, workspace.chapter, workspace.verses);
                if (verseRecords.length > 0) {
                    markRecord.metaContent = [];
                    for (const vr of verseRecords) {
                        for (const payloadContent of vr.payload) {
                            markRecord.metaContent.push(payloadContent);
                        }
                    }
                }
                if (element.atts) {
                    markRecord.atts = element.atts;
                }
                workspace.arrayWords = config.report[workspace.chapter][workspace.verses];
                workspace.outputContentStack[0].push(markRecord);
                return false;
            }
        }
    ],
    blockGraft: [
        {
            description: "Ignore blockGraft events, except for title (\\mt)",
            test: (environment) => environment.context.sequences[0].block.subType !== 'title',
            action: (environment) => {
            }
        },
    ],
    inlineGraft: [
        {
            description: "Ignore inlineGraft events",
            test: () => true,
            action: () => {
            }
        },
    ],
    startWrapper: [
        {
            description: "Ignore startWrapper events",
            test: () => true,
            action: () => {
            }
        },
    ],
    endWrapper: [
        {
            description: "Ignore endWrapper events",
            test: () => true,
            action: () => {
            }
        },
    ]
};

const mergeReportCode = function ({ perf, report }) {
    
    const actions = mergeActions(
        [
            makeAlignmentActions,
            transforms.perf2perf.identityActions
        ]
    );
    const cl = new PerfRenderFromJson(
        {
            srcJson: perf,
            actions
        }
    );
    const output = {};
    cl.renderDocument({ docId: "", config: { report }, output });
    return { perf: output.perf }; // identityActions currently put PERF directly in output
}

const mergeReport = {
    name: "mergeReport",
    type: "Transform",
    description: "PERF=>PERF adds report to verses",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
        {
            name: "report",
            type: "json",
            source: ""
        }
    ],
    outputs: [
        {
            name: "perf",
            type: "json",
        },
        {
            name: "issues",
            type: "json",
            source: ""
        }
    ],
    code: mergeReportCode
}
export default mergeReport;
