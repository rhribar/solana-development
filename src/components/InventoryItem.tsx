import {NFTAccount} from "../solana-sdk/nft";
import {Button, Card, theme} from "@globalid/design-system";
import {TradeContext} from "../contexts/trade";
import * as StyledW from "./Wallet.styled";

import './inventory_item.css'

interface ItemInventoryProps {
    nft: NFTAccount
}

export const InventoryItem = ({ nft }: ItemInventoryProps) => {
    return (

        <TradeContext.Consumer>
            {(trade) => (
                <div className="inventory-item" key={nft.pubkey.toString()} onClick={() => trade.sdk ? trade.sdk.addToken(nft.pubkey) : null}>
                    <img src={nft.metaData.image}/>
                    <h4 style={{ color: theme.color.TEXT_1 }}>{nft.metaData.name}</h4>
                </div>
            )}
        </TradeContext.Consumer>
    )
}