import {AxiosError} from 'axios';
import {APIBase} from './APIBase';
import {APIConfig} from './APIConfig';
import {getUserAccountInstance, UserAccount} from './APIUser';

export interface Post {
    Owner: UserAccount;
    Type: number;
    Title: string;
    HTMLList: Array<HTMLPost> // keep track of changes
    Replies: Array<Reply>
    LikedUsers: Array<UserAccount>
    DislikedUsers: Array<UserAccount>
}

export function getPostInstance(html: string): Post {
    return {
        DislikedUsers: [],
        HTMLList: [],
        LikedUsers: [],
        Owner: getUserAccountInstance(),
        Replies: [],
        Title: '',
        Type: 0
    };
}

export interface HTMLPost {
    ID: number;
    HTML: string;
}

export interface Reply {
    Owner: Account;
    HTML: string;
    NestedReplies: Array<NestedReply>
    LikedUsers: Array<Account>
    DislikedUsers: Array<Account>
}

export interface NestedReply {
    Owner: Account;
    HTML: string;
    LikedUsers: Array<Account>
    DislikedUsers: Array<Account>
}

export class APIPost extends APIBase {

    /**
     * create post
     *
     * @returns {Promise<string>} ret - Create Post
     */
    public uploadImage(file: any): Promise<string> {
        return this.post<string>('/posts', file)
            .then((response) => {
                const {data} = response;
                return data;
            })
            .catch((error: AxiosError) => {
                throw error;
            });
    }
}

export default new APIPost(APIConfig);

