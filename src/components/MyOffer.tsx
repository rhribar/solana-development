import { Card } from '@globalid/design-system';
import { ThemeConsumer } from 'styled-components';
import { Button } from '@globalid/design-system';
import * as StyledW from './Wallet.styled';
import {ITradeContext, TradeContext} from "../contexts/trade";
import {useWallet} from "@solana/wallet-adapter-react";
import {OfferItem} from "./OfferItem";
// import * as Styled from './Card.styled'

export const MyOfferCard = () => {
    const { publicKey, sendTransaction } = useWallet();


    function getOfferItems(trade: ITradeContext) {
        const oi = [];
        for (let i = 0; i < 6; i++) {
            oi.push(<OfferItem nft={trade.myOffer[i]} index={i}/>)
        }

        return oi
    }

    return (
        <ThemeConsumer key="">
        {(theme) => (
            <TradeContext.Consumer>
                {(trade) => (
                    <Card isHoverable={false}>
                        <div style={{ display: 'flex', alignItems: 'center'}}>
                            <div style={{ width: '100%' }} >
                                <h1 style={{ color: theme.color.TEXT_1, marginTop: '0' }}>My Offer</h1>
                                <StyledW.Button style={{ display: 'flex', justifyContent: 'space-between', marginTop: theme.space.S8 }}>
                                    { !publicKey ? <h4 style={{ color: theme.color.TEXT_1, marginTop: '0' }}>Connect Your Wallet</h4> : null }
                                    { (!trade.initialized && publicKey) ? <Button label="Create Trade" size="small"  onClick={trade.sdk?.initTrade}/> : null }
                                </StyledW.Button>
                                { publicKey && trade.initialized ? (
                                        <div>
                                            {getOfferItems(trade)}
                                            <Button label="Confirm" size="small"/>
                                        </div>
                                ) : null }
                            </div>
                        </div>
                    </Card>
                )}
            </TradeContext.Consumer>
        )}
      </ThemeConsumer>
    )
}
