import styled from 'styled-components';

export const Logo = styled.img`
    height: ${({theme}) => theme.space.S48}};
`

export const Navbar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 1280px;
    padding: ${({ theme }) => `${theme.space.S24}`} 0;
    
    & > * {
        margin: 0 ${({ theme }) => `${theme.space.S12}`};
    }
`
