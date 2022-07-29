import Axios from "axios";

const remoteTransformCode = async ({request, url}) => {
    console.log("URL: "+url);
    console.log("REQUEST:", request);
    const response = await Axios.post(url, request, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
        },
        crossDomain: true,
    });
    console.log("RESPONSE:", response);
    return {response: response.data};
};

const remoteTranform = {
    name: "remoteTransform",
    type: "Transform",
    description: "JSON=>JSON: Sends JSON to remote server, gets JSON back",
    inputs: [
        {
            name: "request",
            type: "json",
            source: ""
        },
        {
            name: "url",
            type: "text",
            source: ""
        },  

    ],
    outputs: [
        {
            name: "response",
            type: "json",
        }
    ],
    code: remoteTransformCode
}

export default remoteTranform;
