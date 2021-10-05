import { Card } from '@globalid/design-system';
import { ThemeConsumer } from 'styled-components';
import * as Styled from './Inventory.styled'

export const InventoryCard = () => {
    return (
        <ThemeConsumer key="">
        {(theme) => (
            <Styled.Card>
                <Card isHoverable={false}>
                    <div style={{ display: 'flex', alignItems: 'center'}}>
                        <div>
                            <h1 style={{ color: theme.color.TEXT_1, marginTop: '0' }}>Your Inventory</h1>
                            <p style={{ color: theme.color.TEXT_1 }}>Check your inventory of NFTs below:</p>
                        </div>
                    </div>
                </Card>
            </Styled.Card>
        )}
      </ThemeConsumer>
    )
  }