import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import '../css/layout/_footer.scss'
import makeStyles from "@material-ui/core/styles/makeStyles";
import Modal from "@material-ui/core/Modal";
import {LinearProgress} from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";

function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

const useStyles = makeStyles((theme) => ({
    paper: {
        position: 'absolute',
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

const BorderLinearProgress = withStyles((theme) => ({
    root: {
        height: 10,
        borderRadius: 5,
    },
    colorPrimary: {
        backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    bar: {
        borderRadius: 5,
        backgroundColor: '#1a90ff',
    },
}))(LinearProgress);

interface props {
    modalOpen: boolean

    setModalOpen(b: boolean): void

    modalTitle: string
    modalDescription: string
    progressBarTimeOut: number
    children: React.ReactNode
}

const AppModal: React.FC<props> = ({
                                        modalOpen,
                                        setModalOpen,
                                        modalTitle,
                                        modalDescription,
                                        progressBarTimeOut,
                                        children}) => {
    const classes = useStyles();
    const [modalStyle] = React.useState(getModalStyle);
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        setProgress(0)
    }, [modalOpen]);

    useEffect(() => {
        //if ProgressBarTimeOut is positive, the user wants to have the progress bar.
        if (progressBarTimeOut === undefined || progressBarTimeOut < 1) {
            return
        }

        //Done, make the modal disappear and reset
        if (progress > 99) {
            setProgress(0);
            setModalOpen(false);
            return;
        }

        setTimeout(() => {
            setProgress(progress + 10)
        }, (progressBarTimeOut * 100))

    }, [progress, progressBarTimeOut, setModalOpen]);


    const body = (
        <div style={modalStyle} className={classes.paper}>
            <h2> {modalTitle} </h2>
            <p>
                {modalDescription}
            </p>
            { children }
            {
                progress > 0 &&
                <BorderLinearProgress variant="determinate" value={progress}/>
            }
        </div>
    );

    return (
        <Modal
            open={modalOpen}
            onClose={() => {
                setModalOpen(false)
            }}
        >
            {body}
        </Modal>
    );
};

export default connect()(AppModal) as any;
