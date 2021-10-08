import { InventoryCard, MyOfferCard, TheirOffer} from '.';
import * as Styled from './Trading.styled';

export const Trading = () => {
    return (
        <Styled.TradingWrapper>
            <InventoryCard />
            <Styled.TradingButtons>
                <MyOfferCard />
                <TheirOffer />
            </Styled.TradingButtons>
        </Styled.TradingWrapper>
    )
}
