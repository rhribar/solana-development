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

export async function getNFTsByPublicKey(connection: Connection, publicKey: PublicKey): Promise<NFTAccount[]> {
    console.log("Loading NFTs owned by", publicKey.toString())
    let accounts = await Metadata.findByOwnerV2(connection, publicKey);

    return Promise.all(accounts.map(async (account: Metadata) => ({ pubkey: account.pubkey, metaData: await loadNFTData(account.data.data.uri)})))
}

async  function loadNFTData(uri: string): Promise<{ image: string, name: string }> {
    return (await axios.get(uri)).data 
}