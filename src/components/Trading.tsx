import { InventoryCard, MyOfferCard, TheirOffer} from '.';
import * as Styled from './Trading.styled';
import {TradeControls} from "./TradeControls";

export const Trading = () => {
    return (
        <Styled.TradingWrapper>
            <InventoryCard />
            <Styled.TradingButtons>
                <MyOfferCard />
                <TradeControls/>
                <TheirOffer />
            </Styled.TradingButtons>
        </Styled.TradingWrapper>
    )
}
