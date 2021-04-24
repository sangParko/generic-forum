import React, {useEffect, useState} from 'react';
import {useHistory, useParams, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Button} from '@material-ui/core';
import commonStyles, {ContentContainer} from '../lib/CommonStyles';
import APIPost, {getHTMLInstance, getPostInstance, getReplyInstance, HTMLPost, Post} from '../lib/API/APIPost';
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import Moment from 'react-moment';
import User from '../lib/User';
import {Editor, Viewer} from '@toast-ui/react-editor';
import {uploadImage} from './PostCreate';

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
    const [ready, setReady] = useState<boolean>(false);
    const [commentBoxOpen, setCommentBoxOpen] = useState<boolean>(false);
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
            setReady(true);
        }).catch(err => {
            APIPost.AlertErrMsg(err);
        });
    }, [id]);

    const addReply = () => {

        // @ts-ignore
        let htmlString = ref.current.editorInst.getHtml()
        let reply = getReplyInstance(htmlString)
        APIPost.addReply(parseInt(id || '0'), reply).then(resp => {
            alert('작성되었습니다.')
            setPost(resp)
            setCommentBoxOpen(false)
        }).catch(err => {
            APIPost.AlertErrMsg(err)
        })
    }


    return (
        <ContentContainer>
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
                            hs.push('/posts/' + id + '/history');
                        }}
                    >
                                수정됨
                            </span>
                }
            </h5>
            <hr/>
            <h3>{post.HTMLList && post.HTMLList[0] && post.HTMLList[0].Title}</h3>
            <hr/>
            {
                ready && <Viewer
                    initialValue={getMarkdown(post)}
                />
            }
            <div className={cs.horizontalBlock30px}/>
            <div
                style={{ backgroundColor: 'white', minHeight: '50px' }}
            >댓글 {post.Replies && post.Replies.length}개
            </div>
            {
                post.Replies && post.Replies.map((reply, index) =>
                    <div key={index}
                         style={{ backgroundColor: 'gray', minHeight: '50px' }}
                    >
                        <Viewer
                            initialValue={reply.HTML}
                        />
                    </div>
                )
            }
            <div style={{backgroundColor: '#bbbbbb'}}>{User.getUserID()}</div>
            {
                !commentBoxOpen &&
                <textarea style={{width: '100%'}}
                          defaultValue={'...'}
                          onClick={() => {setCommentBoxOpen(true)}}/>
            }
            {
                commentBoxOpen &&
                    <React.Fragment>
                        <div style={{backgroundColor: '#FFFFFF'}}>
                            <Editor
                                previewStyle="vertical"
                                height="400px"
                                initialEditType="wysiwyg"
                                initialValue="hello"

                                // @ts-ignore
                                ref={ref}
                                hooks={{addImageBlobHook: uploadImage}}
                            />
                        </div>
                        <div style={{backgroundColor: '#FFFFFF'}}>
                            <Button variant={'contained'} onClick={() => { setCommentBoxOpen(false)}}>
                                취소
                            </Button>
                            <Button variant={'contained'} onClick={ addReply }>
                                등록
                            </Button>
                        </div>
                    </React.Fragment>
            }
        </ContentContainer>
    );
};

export default connect()(withRouter(PostView));
