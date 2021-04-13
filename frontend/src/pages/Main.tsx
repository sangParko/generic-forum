import React, {useEffect, useState} from 'react';
import {useHistory, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Button, Container, Grid} from '@material-ui/core';
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

    const getMarkUp = (p: Post) => {
        return {
            __html: p.Title
        };
    };

    return (
        <div className="login">
            <Container maxWidth="md">
                <Grid container spacing={3} alignItems="center" justify="center">
                    <div className={cs.horizontalBlock30px}/>
                    <Grid item xs={8}>
                        <Button
                            variant={'contained'}
                            color={'primary'}
                            onClick={() => {
                                hs.push('/posts/create');
                            }}
                        > 글 쓰기
                        </Button>
                    </Grid>
                    <div className={cs.horizontalBlock30px}/>
                    {
                        posts && posts.map((p, index) =>
                            <Grid item xs={8}>
                                <div key={index}
                                     dangerouslySetInnerHTML={getMarkUp(p)}
                                     onClick={() => {
                                       hs.push("/posts/" + p.ID);
                                     }}
                                />
                            </Grid>
                        )
                    }
                </Grid>
            </Container>
        </div>
    );
};

export default connect()(withRouter(Main));
