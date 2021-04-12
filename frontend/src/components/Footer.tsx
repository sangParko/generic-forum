import React from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import {connect} from 'react-redux';
import '../css/layout/_footer.scss';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {createStyles, Theme} from '@material-ui/core';

interface props extends RouteComponentProps {
}

const Footer: React.FC<props> = () => {
    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            footer: {
                float: 'left',
                width: '100%',
                height: '100px',
                alignContent: 'center',
            },
            programInfo: {
                textAlign: 'center',
                position: 'relative',
                marginLeft: 'auto',
                marginRight: 'auto',
                paddingTop: '150px',
                width: '400px',
            },
            versionInfo: {
                margin: 'auto',
                textAlign: 'center',
                fontSize: '11px',
            }
        })
    );
    const classes = useStyles();


    return (
        <div className={classes.footer}>
            <div className={classes.programInfo}>
                Sang's project starter
            </div>
        </div>
    );
};

export default connect()(withRouter(Footer)) as any;
