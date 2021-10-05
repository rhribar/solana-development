import { Card } from '@globalid/design-system';
import { ThemeConsumer } from 'styled-components';
// import * as Styled from './Card.styled'

export const HisOfferCard = () => {
    return (
        <ThemeConsumer key="">
        {(theme) => (
            <Card isHoverable={false}>
                <div style={{ display: 'flex', alignItems: 'center'}}>
                    <div>
                        <h1 style={{ color: theme.color.TEXT_1, marginTop: '0' }}>His Offer</h1>
                        <p style={{ color: theme.color.TEXT_1 }}>Your friend is willing to trade you with this: </p>
                    </div>
                </div>
            </Card>
        )}
      </ThemeConsumer>
    )
}