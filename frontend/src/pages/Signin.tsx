import React, {ChangeEvent, useState} from 'react';
import {RouteComponentProps, useHistory, withRouter} from 'react-router';
import {connect} from 'react-redux';
import APIUser, {Token} from '../lib/API/APIUser';
import Button from '@material-ui/core/Button';
import {Container, Grid, TextField} from '@material-ui/core';
import {AxiosError} from 'axios';
import User from '../lib/User';
import {QueryParam} from '../lib/Util/DomUtil';
import commonStyles from '../lib/CommonStyles';
import LockIcon from '@material-ui/icons/Lock';
import {MsgFromAxiosErr} from '../lib/Util/DataTypeUtil';

interface props extends RouteComponentProps {
    openDialog(title: string,
               content: string,
               yesBtnName: string,
               noBtnName: string,
               yesCallback: Function): void;
}

const Signin: React.FC<props> = ({openDialog}) => {
    //initialize hooks
    const history = useHistory();
    //initialize variables
    const [id, setID] = useState('');
    const [pwd, setPWD] = useState('');
    const cs = commonStyles();
    //declare handlers
    const trySignIn = () => {
        APIUser.signIn({userID: id, pwd: pwd}).then(
            (resp: Token) => {
                if (QueryParam('developer') === '1') {
                    User.setDeveloperModeOn();
                }
                User.signIn(id, resp);
            }
        ).catch((err: AxiosError) => {
            openDialog(
                'Error Occurred',
                MsgFromAxiosErr(err),
                '',
                'Close',
                () => {
                });
        });
    };

    const onIDChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setID(e.currentTarget.value);
    };

    const onPWDChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPWD(e.currentTarget.value);
    };

    const onKeyPressOnPWD = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            trySignIn();
        }
    };

    const moveToSignUpPage = () => {
        history.push('/signup');
    };

    return (
        <div className="login">
            <Container maxWidth="md">
                <Grid container spacing={3} alignItems="center" justify="center">
                    <Grid className={cs.horizontalBlock30px}/>

                    <Grid container item xs={12} sm={12} justify="center">
                        <LockIcon color={'primary'} style={{height: '70px', width: '70px'}}/>
                    </Grid>
                    <Grid className={cs.horizontalBlock30px}/>
                    <Grid container item xs={12} sm={12} justify="center">
                        <TextField label="User ID"
                                   variant="filled"
                                   value={id}
                                   onChange={onIDChange}/>
                    </Grid>
                    <Grid container item xs={12} sm={12} justify="center">
                        <TextField label="Password"
                                   variant="filled"
                                   value={pwd}
                                   type="password"
                                   onChange={onPWDChange}
                                   onKeyPress={onKeyPressOnPWD}/>
                    </Grid>
                    <Grid container item xs={12} sm={12} justify="center">
                    </Grid>
                    <Grid container item xs={12} sm={12} justify="center">
                        <Button variant="contained" color="primary" onClick={trySignIn} href={''}>
                            Login
                        </Button>
                    </Grid>
                    <Grid container item xs={12} sm={12} justify="center">
                        or
                    </Grid>
                    <Grid container item xs={12} sm={12} justify="center">
                        <Button variant="contained" color="primary" onClick={moveToSignUpPage} href={''}>
                            Sign Up
                        </Button>
                    </Grid>
                </Grid>
            </Container>

        </div>
    );
};

export default connect()(withRouter(Signin));
