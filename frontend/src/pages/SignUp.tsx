import React, {ChangeEvent, useState} from 'react';
import {RouteComponentProps, useHistory, withRouter} from 'react-router';
import {connect} from "react-redux";
import {Container, createStyles, Grid, TextField, Theme} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import APIUser, {AccountCreationResponse} from "../lib/API/APIUser";
import {AxiosError} from "axios";
import {MsgFromAxiosErr} from '../lib/Util/DataTypeUtil';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        textField: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
            width: '30ch',
        },
    }),
);

interface props extends RouteComponentProps {
    openDialog(title: string,
               content: string,
               yesBtnName: string,
               noBtnName: string,
               yesCallback: Function): void;
}


const SignUp: React.FC<props> = ({openDialog}) => {
    const history = useHistory();
    const classes = useStyles();

    //initialize variables
    const [id, setID] = useState("");
    const [pwd, setPWD] = useState("");
    const [signUpSuccess, setSignUpSuccess] = useState(false);

    const onIDChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setID(e.currentTarget.value)
    };

    const onPWDChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPWD(e.currentTarget.value)
    };

    const onKeyPressOnPWD = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            trySignUp();
        }
    };

    const trySignUp = () => {
        APIUser.signUp({userID: id, pwd: pwd}).then(
            (resp: AccountCreationResponse) => {
                setSignUpSuccess(true);
            }).catch((err: AxiosError) => {
            openDialog(
                "Error Occurred",
                MsgFromAxiosErr(err),
                "",
                "Close",
                () => {})
        })
    };

    const goToSignInScreen = () => {
        history.push("/signin")
    };

    const signUpMenu = <div className="signUp">
        <Container maxWidth="md">
            <Grid container spacing={3} alignItems="center" justify="center">
                <Grid container item xs={12} sm={12} justify="center">
                    <TextField label="User ID" value={id} onChange={onIDChange}
                               className={classes.textField}/>
                </Grid>
                <Grid container item xs={12} sm={12} justify="center">
                    <TextField label="Password" value={pwd} onChange={onPWDChange} onKeyPress={onKeyPressOnPWD}
                               className={classes.textField}/>
                </Grid>
                <Grid container item xs={12} sm={12} justify="center">
                    <TextField label="Privilege (ask admin for upgrade)" value={"Monitor"}
                               disabled={true} className={classes.textField}/>
                </Grid>
                <Grid container item xs={12} sm={12} justify="center">
                </Grid>
                <Grid container item xs={12} sm={12} justify="center">
                    <Button variant="contained" color="primary" onClick={trySignUp} href={""}>
                        Sign up
                    </Button>
                </Grid>
            </Grid>
        </Container>
    </div>

    const signUpSuccessMenu = <div className="signUp">
        <Container maxWidth="md">
            <Grid container spacing={3} alignItems="center" justify="center">
                <Grid container item xs={12} sm={12} justify="center">
                    <h1> Successfully signed up </h1>
                </Grid>
                <Grid container item xs={12} sm={12} justify="center">
                    <Button variant="contained" color="primary" onClick={goToSignInScreen} href={""}>
                        Go to login screen
                    </Button>
                </Grid>
            </Grid>

        </Container>
    </div>

    if (!signUpSuccess) {
        return (
            signUpMenu
        );
    } else {
        return (
            signUpSuccessMenu
        );
    }

};

export default connect()(withRouter(SignUp));
