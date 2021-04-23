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
    const postsPerPage = 5;
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [maxPage, setMaxPage] = useState<number>(5);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search); // id=123
        let page = parseInt(params.get('page') || '1');

        APIPost.getPosts(page).then(posts => {
            setPosts(posts);
        }).catch(err => {
            APIPost.AlertErrMsg(err);
        });
    }, [currentPage]);

    useEffect(() => {
        APIPost.getPostsCnt().then(cnt => {
            setMaxPage(Math.ceil(cnt / postsPerPage));
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
            <Pagination
                currentPage={currentPage}
                maxPage={maxPage}
                moveToPage={(page: number) => {
                    hs.push('/posts?page=' + page);
                    setCurrentPage(page);
                }}
            />
        </ContentContainer>
    );
};

interface paginationProps {
    currentPage: number
    maxPage: number

    moveToPage(page: number): void;
}

const Pagination: React.FC<paginationProps> = ({currentPage, maxPage, moveToPage}) => {
    const [pages, setPages] = useState<Array<number>>([currentPage])

    useEffect(() => {
        let start = Math.max(currentPage - 5, 1);
        let end = Math.min(currentPage + 5, maxPage);

        let pagesTemp = []
        for (let i = start; i < end + 1; i++) {
            pagesTemp.push(i)
        }
        setPages(pagesTemp)
    }, [currentPage, maxPage]);

    return (
        <div style={{margin: 'auto', maxWidth: '30%'}}>
            {
                pages.map(num =>
                    <span
                        key={num}
                        style={{color: 'blue', cursor: 'pointer'}}
                        onClick={() => {
                            moveToPage(num);
                        }}
                    >{num}</span>
                )
            }
        </div>
    );
};

export default connect()(withRouter(Main));
