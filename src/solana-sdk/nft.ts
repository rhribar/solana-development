import { PublicKey } from "@solana/web3.js"
import { Connection, Metadata } from '@metaplex/js';
import axios from "axios";

export interface NFTAccount {
    pubkey: PublicKey;
    metaData: {
        image: string;
        name: string;
    }   
}

export async function getNFTsByPublicKey(connection: Connection, publicKeyStr: string): Promise<NFTAccount[]> {
    console.log("Loading NFTs from", publicKeyStr)
    const pk = new PublicKey(publicKeyStr);

    let accounts = await Metadata.findByOwnerV2(connection, pk);

    return Promise.all(accounts.map(async (account: Metadata) => ({ pubkey: account.pubkey, metaData: await loadNFTData(account.data.data.uri)})))
}

async  function loadNFTData(uri: string): Promise<{ image: string, name: string }> {
    return (await axios.get(uri)).data 
}