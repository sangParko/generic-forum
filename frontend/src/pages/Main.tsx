import React, {useEffect, useState} from 'react';
import {useHistory, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Button, Container, Grid} from '@material-ui/core';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import commonStyles from '../lib/CommonStyles';
import APIPost, {Post} from '../lib/API/APIPost';
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';


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
            __html: p.HTMLList &&
                p.HTMLList[0] &&
                p.HTMLList[0].HTML
        };
    };

    const ref = React.useRef();
    const handleFocus = () => {
        console.log('focus!!');
    };




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
                        posts && posts.map((p, index) =>
                            <div key={index} dangerouslySetInnerHTML={getMarkUp(p)}/>
                        )
                    }
                    <div className={cs.horizontalBlock30px}/>
                    <Editor
                        previewStyle="vertical"
                        height="400px"
                        initialEditType="markdown"
                        initialValue="hello"
                        // @ts-ignore
                        ref={ref}
                        // @ts-ignore
                        onFocus={handleFocus}
                    />
                    <Button onClick={() => {
                        // @ts-ignore
                        console.log(ref && ref.current && ref.current.editorInst.exec('Bold'))
                        // @ts-ignore
                        console.log(ref && ref.current.editorInst.getHtml())
                    }}> Push </Button>
                </Grid>
            </Container>
        </div>
    );
};

export default connect()(withRouter(Main));
