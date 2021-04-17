import React, {useEffect, useState} from 'react';
import {useHistory, useParams, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Button} from '@material-ui/core';
import commonStyles from '../lib/CommonStyles';
import APIPost, {getPostInstance, Post} from '../lib/API/APIPost';
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';

const PostView: React.FC = () => {
    const cs = commonStyles();
    const [post, setPost] = useState<Post>(getPostInstance(''));
    const {id} = useParams();
    const hs = useHistory();

    useEffect(() => {
        let postID: number = parseInt(id || '0');
        if (postID < 1) {
            alert('unable to parse post id');
            return;
        }

        APIPost.getPost(postID).then(p => {
            setPost(p);
        }).catch(err => {
            APIPost.AlertErrMsg(err);
        });
    }, [id]);

    const getMarkUp = (p: Post) => {
        let html = p &&
            p.HTMLList &&
            p.HTMLList[0] &&
            p.HTMLList[0].HTML;
        console.log(html);
        return {
            __html: html
        };
    };

    return (
        <div className="login">
            <div className={cs.horizontalBlock30px}/>
            <div className={cs.centeredDiv100px}>
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
                {post.Title}
                <div dangerouslySetInnerHTML={getMarkUp(post)}/>
            </div>
        </div>
    );
};

export default connect()(withRouter(PostView));