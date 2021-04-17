import React from 'react';
import {RouteComponentProps, useHistory, withRouter} from 'react-router';
import {connect} from 'react-redux';
import '../css/layout/_footer.scss';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {createStyles, Theme} from '@material-ui/core';
import {Post} from '../lib/API/APIPost';

interface postListItemProps {
    post: Post;
}

const PostListItem: React.FC<postListItemProps> = ({post}) => {
    const hs = useHistory();
    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            'listItem': {
                border: '1px solid gray',
                cursor: 'pointer',
                color: 'blue',
            }
        })
    );
    const classes = useStyles();
    const getMarkUp = (p: Post) => {
        return {
            __html: p.Title
        };
    };


    return (
        <div className={classes.listItem}>
            <div
                dangerouslySetInnerHTML={getMarkUp(post)}
                onClick={() => {
                    hs.push('/posts/' + post.ID);
                }}
            />
        </div>
    );
};

interface props extends RouteComponentProps {
    posts: Array<Post>;
}

const PostListTable: React.FC<props> = ({posts}) => {
    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            'listBox': {
                maxWidth: '30rem',
                minWidth: '15rem',
                minHeight: '15rem',
                margin: 'auto',
            }
        })
    );
    const classes = useStyles();

    return (
        <div className={classes.listBox}>
            {
                posts && posts.map((p, index) =>
                    <PostListItem
                        post={p}
                        key={index}
                    />
                )
            }
        </div>
    );
};


export default connect()(withRouter(PostListTable)) as any;
