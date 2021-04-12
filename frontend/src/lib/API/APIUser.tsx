import { AxiosError } from "axios";
import {APIBase} from "./APIBase";
import {APIConfig} from "./APIConfig";
import {Post} from './APIPost';

export interface LoginCredentials {
    userID: string;
    pwd: string;
}

export interface Token {
    token: string;
    expiration: string;
    PrivilegeTitle: string;
    refreshToken: RefreshToken;
}

export interface RefreshToken {
    refreshToken: string;
    expiration: string;
}

export interface AccountCreationResponse {
    ID: string;
    UserID: string;
    PWD: string;
}

export interface UserAccount{
    ID: number;
    UserID: string;
    PrivilegeTitle: string;
}

export function getUserAccountInstance(): UserAccount {
    return {
        ID: 0, PrivilegeTitle: '', UserID: ''
    }
}
export class APIUser extends APIBase {

    /**
     * Signs user in and returns token data
     *
     * @param {object} credentials - user's id and password.
     * @returns {Promise<Token>} TokenData - user's token with privilegeTitle,
     */
    public signIn (credentials: LoginCredentials): Promise<Token> {
        return this.post<Token>("/auth/token", JSON.stringify(credentials))
            .then((response) => {
                const { data } = response;
                return data
            })
            .catch((error: AxiosError) => {
                throw error;
            });
    }

    /**
     * Signs up a new user.
     *
     * @param {object} credentials - user's id and password.
     * @returns {Promise<Token>} TokenData - user's token with privilegeTitle,
     */
    public signUp (credentials: LoginCredentials): Promise<AccountCreationResponse> {
        return this.post<AccountCreationResponse>("/accounts", JSON.stringify(credentials))
            .then((response) => {
                const { data } = response;
                return data
            })
            .catch((error: AxiosError) => {
                throw error;
            });
    }

    /**
     * Gets All Users
     *
     */
    public getAllUsers (): Promise<Array<UserAccount>> {
        return this.get<Array<UserAccount>>("/accounts")
            .then((response) => {
                const { data } = response;
                return data
            })
            .catch((error: AxiosError) => {
                throw error;
            });
    }

    /**
     * Deletes a User
     *
     */
    public deleteUser (user: UserAccount): Promise<string> {
        return this.delete<string>("/accounts/" + user.ID)
            .then((response) => {
                const { data } = response;
                return data
            })
            .catch((error: AxiosError) => {
                throw error;
            });
    }

    /**
     * Updates a User
     *
     */
    public updateUser (user: UserAccount): Promise<UserAccount> {
        return this.put<UserAccount>("/accounts/" + user.ID, JSON.stringify(user))
            .then((response) => {
                const { data } = response;
                return data
            })
            .catch((error: AxiosError) => {
                throw error;
            });
    }


    /**
     * Updates All Users
     *
     */
    public updateAllUsers (users: Array<UserAccount>): Promise<Array<UserAccount>> {
        return this.put<Array<UserAccount>>("/accounts", JSON.stringify({"Accounts": users}))
            .then((response) => {
                const { data } = response;
                return data
            })
            .catch((error: AxiosError) => {
                throw error;
            });
    }

    /**
     * Updates user password
     * User's identity is passed in with auth token
     */
    public updateUserPassword (oldPassword: string, newPassword: string): Promise<string> {
        return this.put<string>("/accounts/password",
            JSON.stringify({ "OldPassword": oldPassword, "NewPassword": newPassword }))
            .then((response) => {
                const { data } = response;
                return data
            })
            .catch((error: AxiosError) => {
                throw error;
            });
    }

}

export default new APIUser(APIConfig) ;

