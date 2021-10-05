import styled from 'styled-components';

export const GlobalStyles = styled.html`
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.color.RAVEN}; // JET_BLACK
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
`

export const HeaderLayout = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const WalletLayout = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const TradingLayout = styled.div`
  display: flex;
  justify-content: center;
`
