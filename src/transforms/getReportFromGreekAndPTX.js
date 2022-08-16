import {ProskommaRenderFromJson, transforms, mergeActions} from 'proskomma-json-tools';

class Ptxhandler {
    constructor(PTX) {
        this.PTX = JSON.parse(JSON.stringify(PTX));
        this.nbChapters = 0;
        this.versesInchapters = [];
        this.wordstotal = 0;
        this.arrayPtx = [];
    }
    getPTX() {
        return this.PTX;
    }

    getArrayPtx() {
        return this.arrayPtx;
    }

    startParsing() {
        let target = null;
        let source = null;
        let chapter = null;
        let verse = null;
        let wordInt = null;
        let txtWord = "";
        let strong = "";
        for (let metaWord of this.PTX) {
            target = metaWord["target"];
            source = metaWord["source"];
            chapter = source["chapter"];
            verse = source["verse"];
            wordInt = target["word"];
            txtWord = source["glWord"];
            strong = source["strong"];

            if(this.arrayPtx[chapter] == undefined) {
                this.arrayPtx[chapter] = [];
                this.nbChapters += 1;
            }
            if(this.arrayPtx[chapter][verse] == undefined) {
                this.versesInchapters[chapter-1] = 1;
                this.arrayPtx[chapter][verse] = [];
            } else {
                this.versesInchapters[chapter-1] += 1;
            }

            this.arrayPtx[chapter][verse][wordInt] = {
                "chapter" : chapter,
                "verse" : verse,
                "word" : txtWord,
                "pos" : wordInt,
                "segment" : target["segment"],
                "strong" : strong+"0",
                "targetLinkValue" : target["targetLinkValue"],
            };
            this.wordstotal++;
        }

        console.log("PTX parsed", this.arrayPtx);
    }

    /**
     * 
     * @param {string(int)} chapter 
     * @param {string} verse 
     * @returns {[string]}
     */
    getAllWordsFromChapterVerse(chapter, verse) {
        let words = [];
        for (let metaWord of this.arrayPtx[chapter][verse]) {
            words.push(metaWord);
        }
        return words;
    }

    /**
     * 
     * @param {string(int)} chapter 
     * @param {string} verse 
     * @returns {[string]}
     */
     getRawWordsFromChapterVerse(chapter, verse) {
        let words = [];
        for (let metaWord of this.arrayPtx[chapter][verse]) {
            words.push(metaWord["word"]);
        }
        return words;
    }

    /**
     * 
     * @param {string(int)} chapter 
     * @param {string} verse 
     * @returns {string}
     */
     getRawStringFromChapterVerse(chapter, verse) {
        let words = "";
        for (let i = 1; i <= this.versesInchapters[chapter]; i++) {
            words = words + " " + this.arrayPtx[chapter][verse][i]["word"];
        }
        return words;
    }

    getSingleWordFromChapterVerse(chapter, verse, word) {
        return this.arrayPtx[chapter][verse][word];
    }

    getStrong(chapter, verse, word) {
        let cWord = this.arrayPtx[chapter][verse][word];
        if(cWord === undefined) {
            return false;
        }
        return cWord["strong"];
    }

    getTargetLinkValue(chapter, verse, word) {
        return this.arrayPtx[chapter][verse][word]["targetLinkValue"];
    }

    addInfosToWord(chapter, verse, word, key, info) {
        if(this.arrayPtx[chapter][verse][word] === undefined) {
            this.addWord(chapter, verse, word, null);
        }
        this.arrayPtx[chapter][verse][word][key] = info;
    }

    addWord(chapter, verse, wordInt, infos) {
        this.arrayPtx[chapter][verse][wordInt] = {
            ...infos,
            "chapter" : parseInt(chapter),
            "verse" : parseInt(verse),
            "pos" : wordInt
        };;
    }
}

const handleGreekOccurences = function (arrayGreekWords) {
    let len = arrayGreekWords.length;
    let occurences = new Map();
    let posOccurence = [...arrayGreekWords];
    for(let i = 0; i < len; i++) {
        if(occurences.has(arrayGreekWords[i])) {
            occurences.set(arrayGreekWords[i], occurences.get(arrayGreekWords[i]) + 1);
        } else {
            occurences.set(arrayGreekWords[i], 1);
        }
        posOccurence[i] = occurences.get(arrayGreekWords[i]);
    };
    return [occurences, posOccurence];
}

const makeAlignmentActions = {
    startDocument: [
        {
            description: "Set up state variables and output",
            test: () => true,
            action: ({config, workspace, output}) => {
                const { PTX } = config;
                workspace.handler = new Ptxhandler(PTX);
                workspace.handler.startParsing();
                workspace.chapter = null;
                workspace.verses = null;
                workspace.wordPos = null;
                workspace.greekWordsInVerse = [];
                workspace.frenchWordsInVerse = [];
                workspace.greekTextOccurences = 0;
                workspace.textOccurences = 0;
                workspace.greekTextOccurencePos = 0;
                workspace.textOccurencePos = 0;
                workspace.greekTextPosition = 0;
                workspace.text = "";
                workspace.inwrap = true;
                output.report = [];
            }
        },
    ],
    startWrapper: [
        {
            description: "Getting the greek content on wrapper event",
            test: ({ context }) => context.sequences[0].element.subType === "usfm:w",
            action: ({ context, workspace }) => {
                workspace.inwrap = true;
                let elem = context.sequences[0].element;
                let lemma = elem.atts.lemma[0];
                let morph = elem.atts["x-morph"];
                let strong = elem.atts.strong[0];
                let strongPTX = workspace.handler.getStrong(workspace.chapter, workspace.verses, workspace.wordPos);
                if(!strongPTX) {
                    const infos = {
                        "strong" : strong,
                        "lemma" : lemma,
                        "morph" : morph,
                        "content" : "",
                        "word" : ""
                    };
                    workspace.handler.addWord(workspace.chapter, workspace.verses, workspace.wordPos, infos);
                } else if(strongPTX == strong) {
                    workspace.handler.addInfosToWord(workspace.chapter, workspace.verses, workspace.wordPos, "lemma", lemma);
                    workspace.handler.addInfosToWord(workspace.chapter, workspace.verses, workspace.wordPos, "morph", morph);
                } else {
                    workspace.handler.addInfosToWord(workspace.chapter, workspace.verses, workspace.wordPos, "lemma", lemma);
                    workspace.handler.addInfosToWord(workspace.chapter, workspace.verses, workspace.wordPos, "morph", morph);
                }
            },
        },
    ],
    endWrapper: [
        {
            description: "Getting the french content on wrapper event",
            test: ({ context }) => context.sequences[0].element.subType === "usfm:w",
            action: ({ workspace }) => {
                // we get the greek text from the workspace because it is the only one we have access to ... => elem.content === undefined
                let greekWord = workspace.text;
                workspace.greekWordsInVerse.push(greekWord);
                workspace.handler.addInfosToWord(workspace.chapter, workspace.verses, workspace.wordPos, "content", greekWord);
                
                workspace.greekTextPosition += 1;
                workspace.wordPos += 1;
                workspace.inwrap = false;
                
                // let elem = context.sequences[0].element;
                // console.log("endWrapper", elem);
            }
        }
    ],
    mark: [
        {
            description: "Ignore mark events, except for chapter and verses",
            test: ({context}) => {
                return ["chapter", "verses"].includes(context.sequences[0].element.subType);
            },
            action: ({config, context, workspace}) => {
                const element = context.sequences[0].element;
                if (element.subType === "chapter") {
                    workspace.chapter = element.atts["number"];
                    workspace.verses = 0;
                } else if (element.subType === "verses") {
                    let occurences = null;
                    let posOccurence = null;
                    if(workspace.greekWordsInVerse[0] !== undefined && workspace.verses !== 0) {
                        [occurences, posOccurence] = handleGreekOccurences(workspace.greekWordsInVerse);
                        for(let i = 0; i < workspace.greekWordsInVerse.length; i++) {
                            // workspace.handler.addInfosToWord(workspace.chapter, workspace.verses, i, "content", workspace.greekWordsInVerse[i]);
                            // think about i+1 because the first word is 1 and not 0
                            let occs = occurences.get(workspace.greekWordsInVerse[i]);
                            workspace.handler.addInfosToWord(workspace.chapter, workspace.verses, i+1, "greekoccurences", occs);
                            workspace.handler.addInfosToWord(workspace.chapter, workspace.verses, i+1, "greekoccurence", posOccurence[i]);
                        }
                    }
                    workspace.verses = element.atts["number"];
                    workspace.greekWordsInVerse = [];
                    workspace.frenchWordsInVerse = [];
                    workspace.wordPos = 1;
                }
            }
        },
    ],
    text: [
        {
            description: "Process ONLY greek texts events",
            test: () => true,
            action: ({context, workspace}) => {
                if(workspace.inwrap) {
                    workspace.text = context.sequences[0].element.text;
                }
            }
        }
    ],
    endDocument: [
        {
            description: "Build output",
            test: () => true,
            action: ({workspace, output}) => {
                console.log(workspace.handler.getArrayPtx());
                output.report = workspace.handler.getArrayPtx();
            }
        },
    ],
};

const makeReportCode = function ({PTX, perf}) {
    // console.log("getRawStringFromChapterVerse(1, 1) : ", handler.getRawStringFromChapterVerse(1, 1));
    const cl = new ProskommaRenderFromJson(
        {
            srcJson: perf,
            actions: makeAlignmentActions
        }
    );
    const output = {};
    // output.report = handler.getArrayPtx();
    cl.renderDocument({docId: "", config: {PTX}, output});
    return {report: output.report};
}

const getReportFromGreekAndPTX = {
    name: "getReportFromGreekAndPTX",
    type: "Transform",
    description: "PERF=>JSON: Generates alignment report",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
        {
            name: "PTX",
            type: "text",
            source: ""
        }
    ],
    outputs: [
        {
            name: "report",
            type: "json",
        }
    ],
    code: makeReportCode
}

export default getReportFromGreekAndPTX;
