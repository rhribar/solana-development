import {Button, Card} from '@globalid/design-system';
import {ThemeConsumer} from 'styled-components';
import * as StyledW from './Wallet.styled';
import {ITradeContext, TradeContext} from "../contexts/trade";
import {useWallet} from "@solana/wallet-adapter-react";
import {Roles} from "../solana-sdk/trade-data";

// import * as Styled from './Card.styled'

export const TradeControls = () => {
    const { publicKey } = useWallet();

    return (
        <ThemeConsumer key="">
            {(theme) => (
                <TradeContext.Consumer>
                    {(trade) => (
                        <Card isHoverable={false}>
                            <div style={{ display: 'flex', alignItems: 'center'}}>
                                <StyledW.Button style={{ display: 'flex', justifyContent: 'space-between', marginTop: theme.space.S8 }}>
                                    { publicKey && trade.initialized && !trade.myConfirmation  ? <Button disabled={trade.tradeEmpty} style={{ marginRight: '10px' }} label="Confirm" size="small"  onClick={trade.sdk?.confirm}/> : null }
                                    { publicKey && trade.initialized && trade.myConfirmation ? <Button style={{ marginRight: '10px' }} label="Un-confirm" size="small"  onClick={trade.sdk?.cancel}/> : null }
                                    { publicKey ? <Button style={{ marginRight: '10px' }} disabled={!(trade.myConfirmation && trade.theirConfirmation)} label="Transfer" size="small"  onClick={trade.sdk?.transfer}/> : null }
                                    { publicKey && trade.initialized && trade.myRole == Roles.Maker ? <Button disabled={!trade.tradeEmpty} style={{ marginRight: '10px' }} label="Close" size="small"  onClick={trade.sdk?.close}/> : null }
                                    { publicKey && trade.initialized && trade.myRole == Roles.Maker ? <Button disabled={!trade.tradeEmpty} style={{ marginRight: '10px' }} label="Join" size="small"  onClick={trade.sdk?.initTaker}/> : null }
                                </StyledW.Button>
                            </div>
                        </Card>
                    )}
                </TradeContext.Consumer>
            )}
        </ThemeConsumer>
    )
}
