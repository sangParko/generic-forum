import React from 'react';
import {useHistory, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Button, Container, Grid} from '@material-ui/core';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import commonStyles from '../lib/CommonStyles';


const Main: React.FC = () => {
    const cs = commonStyles();
    const hs = useHistory();

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
                </Grid>
            </Container>
        </div>
    );
};

export default connect()(withRouter(Main));
