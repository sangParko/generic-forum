import React, {useEffect, useState} from 'react';
import {useHistory, withRouter} from 'react-router';
import {Button} from '@material-ui/core';
import commonStyles, {ContentContainer} from '../lib/CommonStyles';
import APIPost, {Post} from '../lib/API/APIPost';
import PostListTable from '../components/PostListTable';
import {connect} from 'react-redux';


const Main: React.FC = () => {
    const cs = commonStyles();
    const hs = useHistory();
    const [posts, setPosts] = useState<Array<Post>>();

    useEffect(() => {
        APIPost.getPosts(1).then(posts => {
            setPosts(posts);
        }).catch(err => {
            APIPost.AlertErrMsg(err);
        });
    }, []);


    return (
        <ContentContainer>
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
        </ContentContainer>
    );
};

export default connect()(withRouter(Main));
