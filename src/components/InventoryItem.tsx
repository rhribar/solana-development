import {NFTAccount} from "../solana-sdk/nft";
import {theme} from "@globalid/design-system";


interface ItemInventoryProps {
    nft: NFTAccount
}

export const InventoryItem = (props: ItemInventoryProps) => {
    return (
        <div style={{display: 'inline-block', margin:5 }}className="inventory_item" id={props.nft.pubkey.toString()}>
            <img style={{ maxHeight: '160px', maxWidth: '160px'}} src={props.nft.metaData.image}/>
            <h4 style={{ color: theme.color.TEXT_1 }}>{props.nft.metaData.name}</h4>
        </div>
    )
}