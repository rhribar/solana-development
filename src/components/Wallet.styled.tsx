import styled from 'styled-components';
import { mix } from 'polished';

export const Button = styled.div`
    display: flex;
    & > div, button {
        background-color: ${({ theme }) => `${theme.color.APPLE_DARK}`};
        border-radius: ${({ theme }) => `${theme.space.S8}`};
        height: 44px;

        :hover {
            background-image: none;
            background-color: ${({ theme }) => `${mix(0.8, theme.color.APPLE_DARK, theme.color.NEGATIVE)}`};
        }
    }
`

export const Card = styled.div`
    width: 1255px;

    & > div > div > div > div {
        margin 0;
    }
`