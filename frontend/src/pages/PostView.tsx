import React, {ChangeEvent, useEffect, useState} from 'react';
import {useHistory, useParams, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Button, Container, Grid, TextField} from '@material-ui/core';
import commonStyles from '../lib/CommonStyles';
import APIFiles from '../lib/API/APIFiles';
import {AxiosError} from 'axios';
import APIPost, {getPostInstance, Post} from '../lib/API/APIPost';
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import {Editor} from '@toast-ui/react-editor';

const PostView: React.FC = () => {
    const cs = commonStyles();
    const hs = useHistory();
    const ref = React.useRef();
    const [post, setPost] = useState<Post>(getPostInstance(""));
    const {id} = useParams();
    const handleFocus = () => {
    };


    useEffect(() => {
        let postID: number = parseInt(id || "0" )
        if (postID < 1) {
            alert("unable to parse post id");
            return;
        }

        APIPost.getPost(postID).then(p => {
            setPost(p);
        }).catch(err => {
            APIPost.AlertErrMsg(err);
        });
    }, []);

    const getMarkUp = (p: Post) => {
        return {
            __html:
                p &&
                p.HTMLList &&
                p.HTMLList[0] &&
                p.HTMLList[0].HTML
        };
    };

    return (
        <div className="login">
            <Container maxWidth="md">
                <Grid container spacing={3} alignItems="center" justify="center">
                    <div className={cs.horizontalBlock30px}/>
                    <div style={{backgroundColor: '#FFFFFF'}}>
                        { post.Title }
                        <div dangerouslySetInnerHTML={getMarkUp(post)}/>
                    </div>

                </Grid>
            </Container>
        </div>
    );
};

export default connect()(withRouter(PostView));
