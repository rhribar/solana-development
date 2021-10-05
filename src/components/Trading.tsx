import { InventoryCard, MyOfferCard, HisOfferCard} from '.';
import * as Styled from './Trading.styled';

export const Trading = () => {
    return (
        <Styled.TradingWrapper>
            <InventoryCard />
            <Styled.TradingButtons>
                <MyOfferCard />
                <HisOfferCard />
            </Styled.TradingButtons>
        </Styled.TradingWrapper>
    )
}
