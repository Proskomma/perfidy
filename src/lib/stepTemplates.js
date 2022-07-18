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
                }
            ],
            outputs: [
                {
                    name: "perf",
                    type: "json",
                }
            ],
            code: () => true
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
                }
            ],
            outputs: [
                {
                    name: "perf",
                    type: "json",
                }
            ],
            code: () => true
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
