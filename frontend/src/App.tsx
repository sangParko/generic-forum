import React, {useCallback} from 'react';
import './css/App.scss';
import {Redirect, Route, Switch, useHistory, withRouter} from 'react-router-dom';
import Main from './pages/Main';
import Signin from './pages/Signin';
import SignUp from './pages/SignUp';
import MyAccount from './pages/MyAccount';
import User from './lib/User';
import clsx from 'clsx';
import {makeStyles} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import RedirectTo from './lib/RedirectTo';
import Footer from './components/Footer';
import NotFound from './pages/NotFound';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PostCreate from './pages/PostCreate';
import PostView from './pages/PostView';
import PostEdit from './pages/PostEdit';
import PostHistory from './pages/PostHistory';


const allowUnauthenticated = true;
const useStyles = makeStyles({
    list: {
        width: 250,
    },
    fullList: {
        width: 'auto',
    },
    sideMenuLink: {
        textAlign: 'center'
    },
    sideMenuSectionStart: {
        textAlign: 'center',
        marginTop: '40px',
        marginBottom: '20px',
    }
});

export type Anchor = 'top' | 'left' | 'bottom' | 'right';

// @ts-ignore
const ProtectedRoute = ({signedIn, ...props}) => {
    if (!allowUnauthenticated && !signedIn) {
        return <Redirect to="/signin"/>;
    }
    return <Route {...props}/>;
};


const App: React.FC = () => {
    const classes = useStyles();
    // let signedIn = User.isSignedIn();
    let signedIn = true;
    const [state, setState] = React.useState({
        top: false,
        left: false,
        bottom: false,
        right: false,
    });

    //Dialog Box shared across the site
    const [open, setOpen] = React.useState<boolean>(false);
    const [title, setTitle] = React.useState<string>('');
    const [content, setContent] = React.useState<string>('');
    const [yesBtnName, setYesBtnName] = React.useState<string>('');
    const [noBtnName, setNoBtnName] = React.useState<string>('');
    const [yesCallback, setYesCallback] = React.useState<() => any>(() =>
        (title: string,
         content: string,
         yesBtnName: string,
         noBtnName: string,
         yesCallback: () => any) => {
            alert('Error: function unset');
        });
    const openDialog = useCallback((title: string,
                                    content: string,
                                    yesBtnName: string,
                                    noBtnName: string,
                                    yesCallback: () => any) => {
        setOpen(true);
        setTitle(title);
        setContent(content);
        setYesBtnName(yesBtnName);
        setNoBtnName(noBtnName);
        setYesCallback(() => () => {
            setOpen(false);
            yesCallback();
        });
    }, []);

    const toggleDrawer = (anchor: Anchor, open: boolean) => (
        event: React.KeyboardEvent | React.MouseEvent,
    ) => {
        if (
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' ||
                (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }

        setState({...state, [anchor]: open});
    };

    const his = useHistory();
    const redirectTo = RedirectTo(his);

    const list = (anchor: Anchor) => (
        <div
            className={clsx(classes.list, {
                [classes.fullList]: anchor === 'top' || anchor === 'bottom',
            })}
            role="presentation"
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
        >
            <div className={classes.sideMenuSectionStart}/>
            <List>
                <ListItem button className={classes.sideMenuLink}>
                    <ListItemText primary={'Home'} onClick={redirectTo('/')}/>
                </ListItem>
            </List>
            <Divider/>
            <div className={classes.sideMenuSectionStart}/>
            <List>
                <ListItem button key={'sign-out-btn'} className={classes.sideMenuLink}>
                    <ListItemText primary={'Sign Out'} onClick={() => {
                        User.signOut();
                    }}/>
                </ListItem>
            </List>
        </div>
    );
    return (
        <div>
            {(['left'] as Anchor[]).map((anchor) => (
                <React.Fragment key={anchor}>
                    <Drawer anchor={anchor} open={state[anchor]} onClose={toggleDrawer(anchor, false)}>
                        {list(anchor)}
                    </Drawer>
                    <div id={'top-div-for-scroll'}/>
                    <div>
                        <Switch>
                            <Route exact path="/signin"
                                   signedIn={true}
                                   render={() => (
                                       <Signin openDialog={openDialog}
                                       />
                                   )}/>
                            <Route exact path="/signup"
                                   signedIn={true}
                                   render={() => (
                                       <SignUp openDialog={openDialog}
                                       />
                                   )}/>
                            <Route exact path="/"
                                   signedIn={signedIn}
                                   render={() => (
                                       <Main/>
                                   )}/>
                            <Route exact path="/posts/create"
                                   signedIn={signedIn}
                                   render={() => (
                                       <PostCreate/>
                                   )}/>
                            <Route exact path="/posts/:id/edit"
                                   signedIn={signedIn}
                                   render={() => (
                                       <PostEdit/>
                                   )}/>
                            <Route exact path="/posts/:id/history"
                                   signedIn={signedIn}
                                   render={() => (
                                       <PostHistory/>
                                   )}/>
                            <Route exact path="/posts/:id"
                                   signedIn={signedIn}
                                   render={() => (
                                       <PostView/>
                                   )}/>
                            <ProtectedRoute exact path="/myaccount"
                                            signedIn={signedIn}
                                            render={() => (
                                                <MyAccount openDialog={openDialog}
                                                />
                                            )}/>
                            <Route component={NotFound}/>
                        </Switch>
                    </div>
                    <Footer/>
                    <Dialog
                        open={open}
                        onClose={() => {
                        }}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                {content}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => {
                                setOpen(false);
                            }} color="primary">
                                {noBtnName}
                            </Button>
                            {
                                yesBtnName.length > 0 &&
                                <Button onClick={() => {
                                    yesCallback();
                                }} color="primary" autoFocus>
                                    {yesBtnName}
                                </Button>
                            }
                        </DialogActions>
                    </Dialog>
                </React.Fragment>
            ))}
        </div>
    );
};

export default withRouter(App);
