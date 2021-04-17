import * as qs from "qs";
import {PathLike} from "fs";
import User from "../User";

const reactDevHost = 'localhost:3000';
export const localDebuggingOn = true;
export const debuggingOn = window.location.host === reactDevHost;

const localhost = 'http://localhost';
const devhost = 'http://10.1.1.231';
const localDebuggingURL = localhost + ':1001/api/';
const remoteDebuggingURL = devhost + ':1001/api/';

const devAPIHost = localDebuggingOn ? localDebuggingURL : remoteDebuggingURL;

const prodAPIHost = 'http://' + window.location.host + '/api/';
const url = debuggingOn ? devAPIHost : prodAPIHost;
export const APIConfig = {
    timeout: 6000,
    baseURL: url,
    contentType: "application/json",
    headers: {
        "Authorization":"Bearer " + User.getAuthToken(),
        "Accept": "application/json",
        "Accept-Language":"ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "Content-Type": "application/json;charset=UTF-8",
    },
    paramsSerializer: (params: PathLike) => qs.stringify(params, {indices: false}),
};