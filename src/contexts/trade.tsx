import {createContext} from "react";
import {PublicKey} from "@solana/web3.js";
import {NFTAccount} from "../solana-sdk/nft";
import {Roles} from "../solana-sdk/trade-data";

export interface TradeContext {
    initialized: boolean
    tradePubkey?: PublicKey,
    myOffer: NFTAccount[],
    theirPubkey?: PublicKey,
    theirOffer: NFTAccount[],
    myRole?: Roles
}

export const TradeContext = createContext<TradeContext>({
    initialized: false,
    myOffer: [],
    theirOffer: [],
});

