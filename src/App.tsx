import { GlobalStyles, darkTheme } from '@globalid/design-system';
import { ThemeProvider } from 'styled-components';
import * as Styled from './index.styled';
import { Wallet, Trading, Navbar } from './components'
import {SolWeb3Wrapper} from "./components/SolWeb3Wrapper";

const App = () => (
  <ThemeProvider theme={darkTheme}>
    <GlobalStyles />
    <Styled.GlobalStyles>
        <SolWeb3Wrapper>
      <Styled.HeaderLayout>
        <Navbar />
      </Styled.HeaderLayout>
      <Styled.WalletLayout>
        <Wallet/>
      </Styled.WalletLayout>
      <body>
      <Styled.TradingLayout>
          <Trading />
      </Styled.TradingLayout>
      </body>
        </SolWeb3Wrapper>
    </Styled.GlobalStyles>
  </ThemeProvider>
);

export default App;
