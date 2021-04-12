import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';

const commonStyles = makeStyles((theme: Theme) =>
    createStyles({
        shortUI: {
            width: '250px',
        },
        horizontalBlock30px: {
            width: '100%',
            height: '30px',
        },
        horizontalBlock50px: {
            width: '100%',
            height: '50px',
        },
        horizontalBlock100px: {
            width: '100%',
            height: '100px',
        },
    }));

export default commonStyles;