import React, {useState} from 'react';
import {withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Button, Container, Grid} from '@material-ui/core';
import {Editor} from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import commonStyles from '../lib/CommonStyles';
import {convertToRaw, EditorState} from 'draft-js';
import APIFiles from '../lib/API/APIFiles';
import { AxiosError } from 'axios';

const PostCreate: React.FC = () => {
    const cs = commonStyles();
    const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
    const onEditorStateChange = (state: EditorState) => {
        console.log(draftToHtml(convertToRaw(state.getCurrentContent())));
        setEditorState(state);
    };

    const uploadCallback = (file: any) => {
        return new Promise(
            (resolve, reject) => {
                const formData = new FormData();
                formData.append('image', file);
                APIFiles.uploadImage(formData).then(
                    (resp: string) => {
                        resolve({data: {link: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MXx8aHVtYW58ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'}});
                    }
                ).catch((err: AxiosError) => {
                    if (err.response) {
                        alert(APIFiles.AlertErrMsg(err))
                    }
                })
            }
        );
    };

    return (
        <div className="login">
            <Container maxWidth="md">
                <Grid container spacing={3} alignItems="center" justify="center">
                    <div className={cs.horizontalBlock30px}/>
                    <div style={{backgroundColor: '#FFFFFF'}}>
                        <Editor
                            editorState={editorState}
                            toolbarClassName="toolbarClassName"
                            wrapperClassName="wrapperClassName"
                            editorClassName="editorClassName"
                            onEditorStateChange={onEditorStateChange}
                            toolbar={{
                                image: {
                                    uploadEnabled: true,
                                    uploadCallback: uploadCallback,
                                    inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg'
                                }
                            }}
                        />
                    </div>
                    <div className={cs.horizontalBlock30px}/>
                    <div>
                        <Button
                            variant={'contained'}
                            color={'primary'}
                            onClick={() => {

                            }}
                        >
                            Create
                        </Button>
                    </div>
                </Grid>
            </Container>
        </div>
    );
};

export default connect()(withRouter(PostCreate));
