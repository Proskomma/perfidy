import xreg from 'xregexp'

const regexCode = function ({regex,text}) {

    const RegexAnswer =  JSON.parse(JSON.stringify(xreg.match(text,xreg(regex),'all')))
    return {RegexAnswer}
    
}

const regex = {
    name: "regex",
    type: "Transform",
    description: "Launch xregexp expression",
    inputs: [
        {
            name: "regex",
            type: "text",
            source: ""
        },
        {
            name: "text",
            type: "text",
            source: ""
        }

    ],
    outputs: [
        {
            name: "RegexAnswer",
            type: "json",
        }
    ],
    code: regexCode
}

export default regex;
