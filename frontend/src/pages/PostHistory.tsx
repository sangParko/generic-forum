import React, {useEffect, useState} from 'react';
import {useHistory, useParams, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Button} from '@material-ui/core';
import commonStyles, {ContentContainer} from '../lib/CommonStyles';
import APIPost, {getHTMLInstance, getPostInstance, Post} from '../lib/API/APIPost';
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import Moment from 'react-moment';
import {Viewer} from '@toast-ui/react-editor';
import {getHTMLTitle, getMarkdownFromHTML} from './PostView';

const PostHistory: React.FC = () => {
    const cs = commonStyles();
    const [post, setPost] = useState<Post>(getPostInstance(getHTMLInstance('')));
    const [ready, setReady] = useState<boolean>(false);
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
            setReady(true);
        }).catch(err => {
            APIPost.AlertErrMsg(err);
        });
    }, [id]);


    return (
        <ContentContainer>
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
            {
                ready &&
                <React.Fragment>
                    {
                        post && post.HTMLList.map((html, index) =>
                            <div key={index}
                                 style={{backgroundColor: '#FFFFFF', margin: 'auto'}}>
                                <h4>#{index + 1}</h4>
                                <h5>
                                    <Moment
                                        format={'yyyy-MM-DD-hh:mm:ss'}
                                        date={html.CreatedAt}
                                    />
                                </h5>
                                <hr/>
                                <h3>{getHTMLTitle(html)}</h3>
                                <hr/>
                                <Viewer initialValue={getMarkdownFromHTML(html)}/>
                            </div>
                        )
                    }
                </React.Fragment>
            }
        </ContentContainer>
    );
};

export default connect()(withRouter(PostHistory));
