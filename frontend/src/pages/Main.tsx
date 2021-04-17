import React, {useEffect, useState} from 'react';
import {useHistory, withRouter} from 'react-router';
import {Button, createStyles, Theme} from '@material-ui/core';
import commonStyles from '../lib/CommonStyles';
import APIPost, {Post} from '../lib/API/APIPost';
import PostListTable from '../components/PostListTable';
import {connect} from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';


const Main: React.FC = () => {
    const cs = commonStyles();
    const hs = useHistory();
    const [posts, setPosts] = useState<Array<Post>>();
    const st = makeStyles((theme: Theme) =>
        createStyles({
            'main': {
                color: 'blue',
            }
        })
    )();

    useEffect(() => {
        APIPost.getPosts(1).then(posts => {
            setPosts(posts);
        }).catch(err => {
            APIPost.AlertErrMsg(err);
        });
    }, []);


    return (
        <div className={st.main}>
            <div className={cs.horizontalBlock30px}/>
            <div className={cs.horizontalBlock30px}/>
            <div style={{margin: 'auto', width: '100px'}}>
                <Button
                    variant={'contained'}
                    color={'primary'}
                    style={{margin: 'auto'}}
                    onClick={() => {
                        hs.push('/posts/create');
                    }}
                > 글 쓰기
                </Button>
            </div>
            <div className={cs.horizontalBlock30px}/>
            <PostListTable posts={posts}/>
        </div>
    );
};

export default connect()(withRouter(Main));
