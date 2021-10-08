import {NFTAccount} from "../solana-sdk/nft";
import {theme} from "@globalid/design-system";

import './offer-item.css'

interface OfferBlockProps {
    index: number
    nft?: NFTAccount
}

export const OfferItem = ({ nft, index }: OfferBlockProps) => {
    return (
        <div className="offer_item" key={index}>
            { nft ? (
                <div>
                    <img style={{ maxHeight: '160px', maxWidth: '160px'}} src={nft.metaData.image}/>
                    <h4 style={{ color: theme.color.TEXT_1 }}>{nft.metaData.name}</h4>
                </div>
            ) : null
            }
        </div>
    )
}