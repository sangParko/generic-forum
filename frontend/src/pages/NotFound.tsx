import React from 'react';
import {withRouter} from "react-router";
import {connect} from "react-redux";
import {Container, Grid} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import commonStyles from "../lib/CommonStyles";

const NotFound: React.FC = () => {
    let hs = commonStyles();

    return (
        <div>
            <Container maxWidth="md">
                <Grid container spacing={3} alignItems="center" justify="center">
                    <div className={hs.horizontalBlock100px}/>
                    <Grid container item xs={12} sm={12} justify="center">
                        <Typography variant="h1" color={"primary"} noWrap>
                            404 Not Found <br></br>
                        </Typography>
                        <div className={hs.horizontalBlock50px}/>
                        <Typography className={"sss"} variant="h4" noWrap>
                            The requested page is not found in this site. <br></br>
                        </Typography>
                    </Grid>
                </Grid>
            </Container>
        </div>
    )
};

export default connect()(withRouter(NotFound));
