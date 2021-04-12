import { AxiosError } from "axios";

const MsgFromAxiosErr = (err: AxiosError): string => {
    let responseText = err.message;
    if (err.response) {
        responseText = err.response.data
    }
    return responseText
};

export {
    MsgFromAxiosErr,
}