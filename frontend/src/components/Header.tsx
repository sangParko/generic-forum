import React from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import MenuIcon from '@material-ui/icons/Menu';
import {Anchor} from '../App';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        menuButton: {
            marginRight: theme.spacing(2),
            cursor: 'pointer'
        },
    }),
);

interface props extends RouteComponentProps {
    toggleDrawer(anchor: Anchor, open: boolean): any

    anchor: Anchor
}

const Header: React.FC<props> = ({toggleDrawer, anchor}) => {
    const classes = useStyles();

    return (
        <AppBar position="sticky" style={{backgroundColor: '#6272cc'}}>
            <Toolbar>
                <div onClick={toggleDrawer(anchor, true)}>
                    <MenuIcon className={classes.menuButton}/>
                </div>
                {/*<Tooltip title="Account" aria-label="account">*/}
                {/*    <IconButton*/}
                {/*        edge="end"*/}
                {/*        onClick={redirectTo('/myaccount')}*/}
                {/*    >*/}
                {/*        <AccountCircle/>*/}
                {/*    </IconButton>*/}
                {/*</Tooltip>*/}
            </Toolbar>
        </AppBar>
    );
};


export default connect()(withRouter(Header)) as any;
