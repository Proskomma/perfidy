import Axios from "axios";

const remoteTransformCode = async ({url, input1, proskomma}) => {
    const request = {
        "name": "test1",
        "title": "test2",
        "description": "test3",
        "inputs": [input1],
    };
    console.log(proskomma);
    console.log(request);
    console.log("URL: "+url);
    console.log("REQUEST:", request);
    const response = await Axios.post(url, request, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
        },
        crossDomain: true,
    });
    console.log("RESPONSE:", response.data);
    return {"data": "hello, world!"}
    // return {data: response.data["result"]};
};

const remoteTransform = {
    name: "remoteTransform-",
    type: "Transform",
    description: "JSON=>JSON: Sends JSON to remote server, gets JSON back",
    inputs: [
        {
            name: "url",
            type: "text",
            source: ""
        },
        {
            name: "input1",
            type: "json",
            source: ""
        }
    ],
    outputs: [
        {
            name: "data",
            type: "json",
        }
    ],
    code: remoteTransformCode
}

export default remoteTransform;
