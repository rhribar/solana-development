import {NFTAccount} from "../solana-sdk/nft";
import {theme} from "@globalid/design-system";

import './offer-item.css'
import {TradeContext} from "../contexts/trade";

interface OfferBlockProps {
    index: number
    nft?: NFTAccount
}

export const OfferItem = ({ nft, index }: OfferBlockProps) => {
    console.log('offer item', nft, index);
    return (
        <TradeContext.Consumer>
            {(trade) => (
                <div className="offer_item" key={index}>
                    { nft ? (
                        <div onClick={() => trade.sdk ? trade.sdk.removeToken(nft.pubkey) : null}>
                            <img style={{ maxHeight: '160px', maxWidth: '160px'}} src={nft.metaData.image}/>
                            <h4 style={{ color: theme.color.TEXT_1 }}>{nft.metaData.name}</h4>
                        </div>
                    ) : null
                    }
                </div>
            )}
        </TradeContext.Consumer>

    )
}