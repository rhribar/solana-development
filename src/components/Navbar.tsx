import { Button } from '@globalid/design-system';
import * as Styled from './Navbar.styled';
import logo from '../static/Favicon.png';
import * as StyledW from './Wallet.styled';

export const Navbar = () => {

  return (
      <Styled.Navbar>
        <Styled.Logo src={logo} alt="logo" />
        <StyledW.Button>
          <Button label="Invite Friends" />
        </StyledW.Button>
      </Styled.Navbar>
  )
}