import { Card } from '@globalid/design-system';
import { ThemeConsumer } from 'styled-components';
import { Button } from '@globalid/design-system';
import * as StyledW from './Wallet.styled';
// import * as Styled from './Card.styled'

export const MyOfferCard = () => {
    return (
        <ThemeConsumer key="">
        {(theme) => (
            <Card isHoverable={false}>
                <div style={{ display: 'flex', alignItems: 'center'}}>
                    <div style={{ width: '100%' }} >
                        <h1 style={{ color: theme.color.TEXT_1, marginTop: '0' }}>My Offer</h1>
                        <p style={{ color: theme.color.TEXT_1 }}>Drag and drop the NFTs you are willing to trade from your inventory: </p>
                        <StyledW.Button style={{ display: 'flex', justifyContent: 'space-between', marginTop: theme.space.S8 }}>
                            <Button label="Confirm Selection" size="small" />
                            <Button label="Cancel" size="small" style={{ backgroundColor: '#404144' }}/>
                            <Button label="Confirm Transfer" size="small" />
                        </StyledW.Button>
                    </div>
                </div>
            </Card>
        )}
      </ThemeConsumer>
    )
}
