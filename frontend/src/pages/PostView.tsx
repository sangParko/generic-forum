import React, {useEffect, useState} from 'react';
import {useHistory, useParams, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Button} from '@material-ui/core';
import commonStyles from '../lib/CommonStyles';
import APIPost, {getHTMLInstance, getPostInstance, HTMLPost, Post} from '../lib/API/APIPost';
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import Moment from 'react-moment';
import User from '../lib/User';
import {Viewer} from '@toast-ui/react-editor';

export const getMarkdown = (p: Post): string => {
    return p &&
        p.HTMLList &&
        p.HTMLList[0] &&
        getMarkdownFromHTML(p.HTMLList[0]);
};

export const getMarkdownFromHTML = (p: HTMLPost): string => {
    return p && p.HTML;
};

export const getTitle = (p: Post): string => {
    return p &&
        p.HTMLList &&
        p.HTMLList[0] && p.HTMLList[0].Title;
};


export const getHTMLTitle = (p: HTMLPost): string => {
    return p && p.Title;
};

const PostView: React.FC = () => {
    const cs = commonStyles();
    const [post, setPost] = useState<Post>(getPostInstance(getHTMLInstance('')));
    const {id} = useParams();
    const hs = useHistory();
    const ref = React.useRef();

    useEffect(() => {
        let postID: number = parseInt(id || '0');
        if (postID < 1) {
            alert('unable to parse post id');
            return;
        }

        APIPost.getPost(postID).then(p => {
            setPost(p);

            // @ts-ignore
            ref && ref.current && ref.current.viewerInst.setMarkdown(getMarkdown(p));
        }).catch(err => {
            APIPost.AlertErrMsg(err);
        });
    }, [id]);


    return (
        <div className="login">
            <div className={cs.horizontalBlock30px}/>
            <div className={cs.centeredDiv100px}>
                {
                    User.getUserID() === post.Owner.UserID &&
                    <Button
                        variant={'contained'}
                        color={'primary'}
                        onClick={() => {
                            hs.push('/posts/' + id + '/edit');
                        }}>
                        Edit
                    </Button>
                }
                {
                    User.getUserID() === post.Owner.UserID &&
                    <Button
                        variant={'contained'}
                        color={'primary'}
                        onClick={() => {
                            APIPost.deletePost(parseInt(id || '0')).then(resp => {
                                alert(resp);
                                hs.goBack();
                            }).catch(err => {
                                APIPost.AlertErrMsg(err);
                            });
                        }}>
                        Delete
                    </Button>
                }
                <Button
                    variant={'contained'}
                    color={'primary'}
                    onClick={() => {
                        hs.goBack();
                    }}>
                    Back
                </Button>
            </div>
            <div className={cs.horizontalBlock30px}/>
            <div style={{backgroundColor: '#FFFFFF', maxWidth: '30rem', margin: 'auto'}}>
                <h4>{User.getUserID()}</h4>
                <h5>
                    <Moment
                        format={'yyyy-MM-DD-hh:mm:ss'}
                        date={post.CreatedAt}
                    />
                    {
                        post.CreatedAt !== post.UpdatedAt &&
                            <span
                                className={cs.hyperlink}
                                onClick={() => {
                                    hs.push('/posts/' + id + '/history')
                                }}
                            >
                                수정됨
                            </span>
                    }
                </h5>
                <hr/>
                <h3>{post.HTMLList && post.HTMLList[0] && post.HTMLList[0].Title}</h3>
                <hr/>
                <Viewer
                    initialValue={'Loading...'}

                    // @ts-ignore
                    ref={ref}

                    // @ts-ignore
                    onFocus={() => {
                    }}
                />
            </div>
        </div>
    );
};

export default connect()(withRouter(PostView));
