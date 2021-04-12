import axios, {AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";
import User from "../User";

export class APIBase {
    private api: AxiosInstance;

    public constructor (config: AxiosRequestConfig) {
        this.api = axios.create(config);

        //Middleware run before request is sent.
        this.api.interceptors.request.use((param: AxiosRequestConfig) => {
            //do stuff
            return param
        });
        //Middleware run before response is returned.
        this.api.interceptors.response.use((param: AxiosResponse) => {
            //do stuffN
            return param
        }, this.globalErrorHandler);

    }

    public globalErrorHandler (error: AxiosError):Promise<Error> {
        if (error.response !== undefined && error.response.data.trim() === "jwtauth: token is expired") {
            window.location.href = "/signin";
            User.signOut();
            error.response = undefined;
        }

        return Promise.reject(error);
    }

    public getUri (config?: AxiosRequestConfig): string {
        return this.api.getUri(config);
    }

    public request<T, R = AxiosResponse<T>> (config: AxiosRequestConfig): Promise<R> {
        return this.api.request(config);
    }

    public get<T, R = AxiosResponse<T>> (url: string, config?: AxiosRequestConfig): Promise<R> {
        url = APIBase.UrlWithDebugParam(url);
        return this.api.get(url, config);
    }

    public delete<T, R = AxiosResponse<T>> (url: string, config?: AxiosRequestConfig): Promise<R> {
        url = APIBase.UrlWithDebugParam(url);
        return this.api.delete(url, config);
    }

    public head<T, R = AxiosResponse<T>> (url: string, config?: AxiosRequestConfig): Promise<R> {
        return this.api.head(url, config);
    }

    public post<T, R = AxiosResponse<T>> (url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        url = APIBase.UrlWithDebugParam(url);
        return this.api.post(url, data, config);
    }

    public put<T, R = AxiosResponse<T>> (url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        url = APIBase.UrlWithDebugParam(url);
        return this.api.put(url, data, config);
    }

    public postFile<T, R = AxiosResponse<T>> (url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        return this.api.post(url, data, config);
    }

    public patch<T, R = AxiosResponse<T>> (url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        return this.api.patch(url, data, config);
    }

    public AlertErrMsg(err: AxiosError): void {
        let msg = err.response === undefined ? "": err.response.data;
        if(msg !== "") {
            alert(msg);
        }
    }

    private static UrlWithDebugParam(url: string): string {
        if (User.isDeveloper()) {
            if(url.includes('?')){
                url += "&debug=1"
            }else{
                url += "?debug=1"
            }
        }
        return url
    }
}