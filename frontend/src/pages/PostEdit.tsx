import React, {ChangeEvent, useEffect, useState} from 'react';
import {useHistory, useParams, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Button, TextField} from '@material-ui/core';
import commonStyles from '../lib/CommonStyles';
import APIPost, {getHTMLPost, getPostInstance, Post} from '../lib/API/APIPost';
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import {Editor} from '@toast-ui/react-editor';
import {uploadImage} from './PostCreate';
import {getMarkdown} from './PostView';

const PostEdit: React.FC = () => {
    const cs = commonStyles();
    const hs = useHistory();
    const {id} = useParams();
    const [title, setTitle] = useState<string>('');
    const [post, setPost] = useState<Post>(getPostInstance(''));

    const savePost = () => {
        // @ts-ignore
        let content = ref && ref.current.editorInst.getHtml();

        if (content && content.length < 20) {
            alert('최소 20자 이상이어야 합니다.');
            return;
        }
        post.Title = title;
        post.HTMLList = [getHTMLPost(content)]

        APIPost.updatePost(post).then(resp => {
            alert('저장되었습니다.');
            hs.goBack();
        }).catch(err => {
            console.error(err);
        });
    };
    const ref = React.useRef();

    useEffect(() => {
        let postID: number = parseInt(id || '0');
        if (postID < 1) {
            alert('unable to parse post id');
            return;
        }

        APIPost.getPost(postID).then(p => {
            setPost(p)
            setTitle(p.Title);
            // @ts-ignore
            ref && ref.current && ref.current.editorInst.setMarkdown(getMarkdown(p));
        }).catch(err => {
            APIPost.AlertErrMsg(err);
        });
    }, []);

    return (
        <div className={cs.contentContainer}>
            <div className={cs.horizontalBlock30px}/>
            <TextField value={title}
                       size={'medium'}
                       fullWidth={true}
                       label={'제목'}
                       onChange={(e: ChangeEvent<HTMLInputElement>) => {
                           setTitle(e.currentTarget.value);
                       }}/>
            <div className={cs.horizontalBlock30px}/>
            <div style={{backgroundColor: '#FFFFFF'}}>
                <Editor
                    previewStyle="vertical"
                    height="400px"
                    initialEditType="wysiwyg"
                    initialValue="hello"

                    // @ts-ignore
                    ref={ref}

                    // @ts-ignore
                    onFocus={() => {
                    }}
                    hooks={{addImageBlobHook: uploadImage}}
                />
            </div>
            <div className={cs.horizontalBlock30px}/>
            <div>
                <Button
                    variant={'contained'}
                    color={'primary'}
                    onClick={savePost}>
                    저장
                </Button>
            </div>
        </div>
    );
};

export default connect()(withRouter(PostEdit));
