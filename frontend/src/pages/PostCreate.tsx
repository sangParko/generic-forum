import React, {ChangeEvent, useState} from 'react';
import {useHistory, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Button, Container, Grid, TextField} from '@material-ui/core';
import commonStyles from '../lib/CommonStyles';
import APIFiles from '../lib/API/APIFiles';
import {AxiosError} from 'axios';
import APIPost, {getPostInstance} from '../lib/API/APIPost';
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import {Editor} from '@toast-ui/react-editor';

const PostCreate: React.FC = () => {
    const cs = commonStyles();
    const hs = useHistory();
    const [title, setTitle] = useState<string>("");
    const createPost = () => {
        // console.log(ref && ref.current && ref.current.editorInst.exec('Bold'))
        // @ts-ignore
        let content = ref && ref.current.editorInst.getHtml();
        if (title.length < 5) {
            alert('제목이 최소 5자 이상이어야 합니다.');
            return;
        }

        if (content && content.length < 20) {
            alert('본문이 최소 20자 이상이어야 합니다.');
            return;
        }

        let post = getPostInstance(content);
        post.Title = title;

        APIPost.createPost(post).then(resp => {
            alert('작성되었습니다.');
            hs.goBack();
        }).catch(err => {
            console.error(err);
        });
    };

    const ref = React.useRef();
    const handleFocus = () => {
    };

    const uploadImage = (blob: Blob | File, callback: (url: string, altText: string) => void): void => {
        console.log('image uploaded');
        console.log(blob);
        const formData = new FormData();
        formData.append('image', blob);
        APIFiles.uploadImage(formData).then(
            (resp: string) => {
                callback('https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MXx8aHVtYW58ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
                    '');
            }
        ).catch((err: AxiosError) => {
            if (err.response) {
                alert(APIFiles.AlertErrMsg(err));
            }
        });
    };

    return (
        <div className="login">
            <Container maxWidth="md">
                <Grid container spacing={3} alignItems="center" justify="center">
                    <div className={cs.horizontalBlock30px}/>
                    <Grid item xs={8}>
                        <TextField value={title}
                                   label={'제목'}
                                   onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                       setTitle(e.currentTarget.value);
                                   }}/>
                    </Grid>
                    <div style={{backgroundColor: '#FFFFFF'}}>
                        <Editor
                            previewStyle="vertical"
                            height="400px"
                            initialEditType="wysiwyg"
                            initialValue="hello"

                            // @ts-ignore
                            ref={ref}

                            // @ts-ignore
                            onFocus={handleFocus}
                            hooks={{addImageBlobHook: uploadImage}}
                        />
                    </div>
                    <div className={cs.horizontalBlock30px}/>
                    <div>
                        <Button
                            variant={'contained'}
                            color={'primary'}
                            onClick={createPost}>
                            Create
                        </Button>
                    </div>
                    <div>
                        <Button
                            variant={'contained'}
                            color={'primary'}
                            onClick={() => {
                                hs.goBack()
                            }}>
                            Back
                        </Button>
                    </div>
                </Grid>
            </Container>
        </div>
    );
};

export default connect()(withRouter(PostCreate));
