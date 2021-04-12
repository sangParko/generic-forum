import React, {useEffect, useState} from 'react';
import {RouteComponentProps, withRouter} from "react-router";
import {connect} from "react-redux";
import '../css/layout/_footer.scss'
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles, Theme} from "@material-ui/core";
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';

interface props extends RouteComponentProps {
    setShowSideMenu: Function
}

const ScrollTopTriggerBanner: React.FC<props> = (props) => {
    const [visible, setVisible] = useState<boolean>(false);
    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            banner: {
                position: 'fixed',
                display: 'block',
                top: '80%',
                right: '50px',
                cursor: 'pointer',
            },
        })
    );
    const classes = useStyles();

    const scrollToTop = () => {
        let el = document.getElementById("top-div-for-scroll");
        if (el === null) {
            return;
        }
        el.scrollIntoView({behavior: "smooth"});
    }

    const handleScroll = () => {
        if (window.pageYOffset > 800) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
    }, [])

    return (
        <div className={classes.banner} onClick={scrollToTop}>
            {
                visible &&
                <ArrowUpwardIcon
                    color={'secondary'}
                    style={{width:'70px', height: '70px'}}>
                    Top
                </ArrowUpwardIcon>
            }
        </div>
    );
};

export default connect()(withRouter(ScrollTopTriggerBanner)) as any;
