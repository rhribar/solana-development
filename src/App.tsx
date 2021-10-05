import { GlobalStyles, darkTheme } from '@globalid/design-system';
import { ThemeProvider } from 'styled-components';
import * as Styled from './index.styled';
import { Wallet, Trading, Navbar } from './components'

const App = () => (
  <ThemeProvider theme={darkTheme}>
    <GlobalStyles />
    <Styled.GlobalStyles>
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
    </Styled.GlobalStyles>
  </ThemeProvider>
);

export default App;
