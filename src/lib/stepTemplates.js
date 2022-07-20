import usfm2perf from '../transforms/usfm2perf';
import usx2perf from '../transforms/usx2perf';
import perf2usfm from '../transforms/perf2usfm';

const stepTemplates = {
    Source: {
        local: {
            type: "Source",
            sourceLocation: "local",
            localValue: "",
            outputType: "text"
        },
        http: {
            type: "Source",
            sourceLocation: "http",
            httpUrl: "",
            outputType: "text"
        }
    },
    Transform: {
        usfm2perf: {
            name: "usfm2perf",
            type: "Transform",
            description: "Loads a USFM file into Proskomma and exports it as PERF",
            inputs: [
                {
                    name: "usfm",
                    type: "text",
                    source: ""
                },
                {
                    name: "selectors",
                    type: "json",
                    source: ""
                }
            ],
            outputs: [
                {
                    name: "perf",
                    type: "json",
                }
            ],
            code: usfm2perf
        },
        usx2perf: {
            name: "usx2perf",
            type: "Transform",
            description: "Loads a USX file into Proskomma and exports it as PERF",
            inputs: [
                {
                    name: "usx",
                    type: "text",
                    source: ""
                },
                {
                    name: "selectors",
                    type: "json",
                    source: ""
                }
            ],
            outputs: [
                {
                    name: "perf",
                    type: "json",
                }
            ],
            code: usx2perf
        },
        perf2usfm: {
            name: "perf2usfm",
            type: "Transform",
            description: "Converts a PERF document into USFM",
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
            code: perf2usfm
        }
    },
    Display: {
        text: {
            type: "Display",
            inputType: "text",
            inputSource: ""
        },
        json: {
            type: "Display",
            inputType: "json",
            inputSource: ""
        }
    }
}

export default stepTemplates;
