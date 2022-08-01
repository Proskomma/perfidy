import Axios from "axios";
const FormData = require('form-data');

const remoteTransformCode = async ({url, input1}) => {
    const formData = new FormData();
    formData.append('input', JSON.stringify(input1));
    let response;
    try {
        response = await Axios.post(url, formData, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
            crossDomain: true,
        });
    } catch (err) {
        console.log(err);
        throw new Error(err);
    }
    return {response: response.data};
};

const remoteTransform = {
    name: "remoteTransform",
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
            name: "response",
            type: "json",
        }
    ],
    code: remoteTransformCode
}

export default remoteTransform;
