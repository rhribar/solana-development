import {AccountInfo, ParsedAccountData, PublicKey, RpcResponseAndContext} from "@solana/web3.js"
import { Connection, Metadata } from '@metaplex/js';
import axios from "axios";
import {EscrowTokenAccount} from "./trade-data";
import {Buffer} from "buffer";

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

export async function getNFTsByEscrowTokens(connection: Connection, escrowTokens: EscrowTokenAccount[]): Promise<NFTAccount[]> {
    for (let i = 0; i < escrowTokens.length; i++) {
        const tokenAccount = escrowTokens[i];
        const tokenAccountPk = new PublicKey(tokenAccount.escrow_token_account)


        const parsedAccountInfo = await connection.getParsedAccountInfo(tokenAccountPk, 'confirmed');

        if (!parsedAccountInfo.value || !Buffer.isBuffer(parsedAccountInfo.value)) {
            throw Error("Could not parse account info")
        }

        //@ts-ignore
        getMint(parsedAccountInfo.value)
    }
}

function getMint(accountInfo:AccountInfo<ParsedAccountData>): PublicKey {
    return accountInfo.data.parsed.info.mint
}