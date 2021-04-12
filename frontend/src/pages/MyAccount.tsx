import React, {ChangeEvent, useState} from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Container, Grid} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import User from '../lib/User';
import APIUser from '../lib/API/APIUser';
import {AxiosError} from 'axios';
import commonStyles from '../lib/CommonStyles';
import TextField from '@material-ui/core/TextField';
import {MsgFromAxiosErr} from '../lib/Util/DataTypeUtil';


interface props extends RouteComponentProps {
    openDialog(title: string,
               content: string,
               yesBtnName: string,
               noBtnName: string,
               yesCallback: Function): void;
}

const MyAccount: React.FC<props> = ({openDialog}) => {
    const [oldPassword, setOldPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');

    const hs = commonStyles();
    const signOut = () => {
        User.signOut();
    };


    const UserGreeting = (props: any) => {
        return <div>
            Hello {props.userName}! <br/>
            Your privilege level is {User.getPrivilegeTitle()}<br/>
        </div>;
    };

    const changePassword = () => {
        if (newPassword !== confirmNewPassword) {
            openDialog(
                'Error Occurred',
                'confirm-password does not match with the new password!',
                '',
                'Close',
                () => {
                });
            return;
        }

        APIUser.updateUserPassword(oldPassword, newPassword).then(
            (resp) => {
                openDialog(
                    'Error Occurred',
                    resp,
                    '',
                    'Close',
                    () => {
                    });
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

    return (
        <div className="myAccount">
            <Container maxWidth="md">
                <Grid container spacing={3} alignItems="center" justify="center">
                    <Grid container item xs={12} sm={12} justify="center">
                    </Grid>
                    <Grid container item xs={12} sm={12} justify="center">
                        <Typography className={'sss'} variant="h6" noWrap>
                            <UserGreeting userName={User.getUserID()}/>
                        </Typography>
                    </Grid>
                    <Grid container item xs={12} sm={12} justify="center">
                        <Button variant="contained"
                                color={'primary'}
                                onClick={signOut}>Sign out</Button>
                    </Grid>
                    <div className={hs.horizontalBlock50px}/>
                    <Grid container item xs={12} sm={12} justify="center">
                        <h4> Change Password </h4>
                    </Grid>
                    <Grid container item xs={12} sm={12} justify="center">
                        <TextField label="Old Password" value={oldPassword}
                                   className={hs.shortUI}
                                   type={'password'}
                                   onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                       setOldPassword(e.currentTarget.value);
                                   }}/>
                    </Grid>
                    <Grid container item xs={12} sm={12} justify="center">
                        <TextField label="New Password" value={newPassword}
                                   className={hs.shortUI}
                                   type={'password'}
                                   onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                       setNewPassword(e.currentTarget.value);
                                   }}/>
                    </Grid>
                    <Grid container item xs={12} sm={12} justify="center">
                        <TextField label="Confirm New Password" value={confirmNewPassword}
                                   className={hs.shortUI}
                                   type={'password'}
                                   onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                       setConfirmNewPassword(e.currentTarget.value);
                                   }}/>
                    </Grid>
                    <Grid container item xs={12} sm={12} justify="center">
                        <Button onClick={changePassword}
                                color={'primary'}
                                variant="contained"> Change Password </Button>
                    </Grid>

                    <div className={hs.horizontalBlock100px}/>
                    {
                        User.getPrivilegeTitle() === 'admin' &&
                        <React.Fragment>
                            <Grid container item xs={12} sm={12} justify="center">
                                <h4> Users List </h4>
                            </Grid>
                            <div className={hs.horizontalBlock50px}/>
                        </React.Fragment>
                    }
                </Grid>
            </Container>
        </div>
    );
};

export default connect()(withRouter(MyAccount));
