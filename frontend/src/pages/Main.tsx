import React, {useEffect, useState} from 'react';
import {useHistory, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Button, Container, Grid} from '@material-ui/core';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import commonStyles from '../lib/CommonStyles';
import APIPost, {Post} from '../lib/API/APIPost';


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
        <div className="login">
            <Container maxWidth="md">
                <Grid container spacing={3} alignItems="center" justify="center">
                    <div className={cs.horizontalBlock30px}/>
                    <Button
                        variant={'contained'}
                        color={'primary'}
                        onClick={() => {
                            hs.push('/posts/create');
                        }}
                    > 글 쓰기
                    </Button>
                    <div className={cs.horizontalBlock30px}/>
                    <h1> 글 </h1>
                    {
                        posts && posts.map(p =>
                            <div>
                                {
                                    p.HTMLList &&
                                    p.HTMLList[0] &&
                                    p.HTMLList[0].HTML
                                }
                            </div>
                        )
                    }
                </Grid>
            </Container>
        </div>
    );
};

export default connect()(withRouter(Main));
