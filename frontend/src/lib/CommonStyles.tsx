import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import styled from 'styled-components';

const commonStyles = makeStyles((theme: Theme) =>
    createStyles({
        contentContainer: {
            width: '50%',
            margin: 'auto',
        },
        hyperlink: {
            color: 'blue',
            cursor: 'pointer',
            textDecoration: 'underline',
        },
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
        centeredDiv100px: {
            margin: 'auto',
            width: '100px'
        }
    }));

export default commonStyles;

export const ContentContainer = styled.div`
            margin: auto;
            width: 50%;
            @media (max-width: 768px) {
                width: 90%;
            }
`;
