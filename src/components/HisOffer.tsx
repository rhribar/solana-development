import {Button, Card} from '@globalid/design-system';
import { ThemeConsumer } from 'styled-components';
import {ITradeContext, TradeContext} from "../contexts/trade";
import {OfferItem} from "./OfferItem";
import {useWallet} from "@solana/wallet-adapter-react";
import * as StyledW from './Wallet.styled';
// import * as Styled from './Card.styled'

function getOfferItems(trade: ITradeContext) {
    console.log('trade', trade)
    const oi = [];
    for (let i = 0; i < 6; i++) {
        oi.push(<OfferItem nft={trade.theirOffer[i]} index={i}/>)
    }

    return oi
}

export const TheirOffer = () => {
    const { publicKey, sendTransaction } = useWallet();

    return (
        <ThemeConsumer key="">
            {(theme) => (
                <TradeContext.Consumer>
                    {(trade) => (
                        <Card isHoverable={false}>
                            <div style={{ display: 'flex', alignItems: 'center'}}>
                                <div style={{ width: '100%' }} >
                                    <h1 style={{ color: theme.color.TEXT_1, marginTop: '0' }}>Their Offer</h1>
                                    <StyledW.Button style={{ display: 'flex', justifyContent: 'space-between', marginTop: theme.space.S8 }}>
                                        { trade.initialized && !trade.theirPubkey ? <h3 style={{ color: theme.color.TEXT_1, marginTop: '0' }}>No one joined the trade yet</h3> : null }
                                    </StyledW.Button>
                                    { publicKey && trade.initialized && trade.theirPubkey ? (
                                        <div>
                                            {getOfferItems(trade)}
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