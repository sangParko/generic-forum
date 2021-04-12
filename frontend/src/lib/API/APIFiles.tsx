import {AxiosError} from "axios";
import {APIBase} from "./APIBase";
import {APIConfig} from "./APIConfig";
import User from "../User";


export class APIFiles extends APIBase {
    fileConfig = {
        headers: {
            "Authorization": "Bearer " + User.getAuthToken(),
            "Accept": "application/json",
            "Cache-Control": "no-cache",
            "Content-Type": "multipart/form-data",
        }
    };

    /**
     * Upload clip
     *
     * @returns {Promise<AllStatsMap>} ret - Upload clip
     */
    public uploadImage(file: any): Promise<string> {
        return this.post<string>("/images", file, this.fileConfig)
            .then((response) => {
                const {data} = response;
                return data
            })
            .catch((error: AxiosError) => {
                throw error;
            });
    }
}

export default new APIFiles(APIConfig);

