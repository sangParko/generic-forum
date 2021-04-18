import {AxiosError} from 'axios';
import {APIBase} from './APIBase';
import {APIConfig} from './APIConfig';
import {getUserAccountInstance, UserAccount} from './APIUser';

export interface Post {
    ID: number;
    Owner: UserAccount;
    Type: number;
    CreatedAt: Date;
    UpdatedAt: Date;
    HTMLList: Array<HTMLPost> // keep track of changes
    Replies: Array<Reply>
    LikedUsers: Array<UserAccount>
    DislikedUsers: Array<UserAccount>
}

export function getPostInstance(html: HTMLPost): Post {
    return {
        ID: 0,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
        DislikedUsers: [],
        HTMLList: [html],
        LikedUsers: [],
        Owner: getUserAccountInstance(),
        Replies: [],
        Type: 0
    };
}

export interface HTMLPost {
    ID: number;
    HTML: string;
    Title: string;
    CreatedAt: Date;
    UpdatedAt: Date;
}

export function getHTMLInstance(initialValue: string): HTMLPost {
    return {Title: '', CreatedAt: new Date(), UpdatedAt: new Date(), HTML: initialValue, ID: 0};
}

export interface Reply {
    Owner: UserAccount;
    HTML: string;
    LikedUsers: Array<Account>;
    CreatedAt: Date;
    UpdatedAt: Date;
}

export function getReplyInstance(html: string): Reply {
    return {
        HTML: html,
        LikedUsers: [],
        Owner: getUserAccountInstance(),
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
    };
}


export class APIPost extends APIBase {

    /**
     * create post
     *
     * @returns {Promise<string>} ret - Create Post
     */
    public createPost(post: Post): Promise<string> {
        return this.post<string>('/posts', post)
            .then((response) => {
                const {data} = response;
                return data;
            })
            .catch((error: AxiosError) => {
                throw error;
            });
    }

    /**
     * update post
     *
     * @returns {Promise<string>} ret - Create Post
     */
    public updatePost(post: Post): Promise<string> {
        return this.put<string>('/posts', post)
            .then((response) => {
                const {data} = response;
                return data;
            })
            .catch((error: AxiosError) => {
                throw error;
            });
    }

    /**
     * add comment
     *
     * @returns {Promise<string>} ret - add comment
     */
    public addReply(postID: number, reply: Reply): Promise<Post> {
        return this.post<Post>('/posts/' + postID + '/reply', reply)
            .then((response) => {
                const {data} = response;
                return data;
            })
            .catch((error: AxiosError) => {
                throw error;
            });
    }

    /**
     * returns posts
     *
     * @returns {Promise<Array<Post>>} ret - Retrieve Posts
     */
    public getPosts(page: number): Promise<Array<Post>> {
        return this.get<Array<Post>>('/posts/page/' + page)
            .then((response) => {
                const {data} = response;
                return data;
            })
            .catch((error: AxiosError) => {
                throw error;
            });
    }

    /**
     * returns post
     *
     * @returns {Promise<Array<Post>>} ret - Retrieve Posts
     */
    public getPost(id: number): Promise<Post> {
        return this.get<Post>('/posts/' + id)
            .then((response) => {
                const {data} = response;
                return data;
            })
            .catch((error: AxiosError) => {
                throw error;
            });
    }

    /**
     * deletes post
     *
     * @returns {Promise<string>} ret - delets Posts
     */
    public deletePost(id: number): Promise<string> {
        return this.delete<string>('/posts/' + id)
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

