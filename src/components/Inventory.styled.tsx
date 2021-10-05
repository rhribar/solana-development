import styled from 'styled-components';

export const Card = styled.div`
    padding-right: ${({ theme }) => theme.space.S12};

    & > div  {
        height: 100%;

        & > div  {
            height: 100%;
        }
    }

    & > div > div > div > div {
        margin: 0;
    }
`
