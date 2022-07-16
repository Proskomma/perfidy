const stepTemplates = {
    Source: {
        local: {
            type: "Source",
            sourceLocation: "local",
            localValue: "",
            outputTypes: {
                value: "json"
            }
        },
        http: {
            type: "Source",
            sourceLocation: "http",
            httpUrl: "",
            outputTypes: {
                value: "json"
            }
        }
    },
    Display: {
        text: {
            type: "Display",
            inputType: "text"
        },
        json: {
            type: "Display",
            inputType: "json"
        }
    }
}

export default stepTemplates;
