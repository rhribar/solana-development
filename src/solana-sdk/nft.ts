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

    return Promise.all(accounts.map(getNFTFromMetaData))
}

async  function loadNFTData(uri: string): Promise<{ image: string, name: string }> {
    return (await axios.get(uri)).data 
}

async function getNFTFromMetaData(metadata: Metadata): Promise<NFTAccount> {
    return { pubkey: metadata.pubkey, metaData: await loadNFTData(metadata.data.data.uri)}
}

export async function getNFTsByEscrowTokens(connection: Connection, escrowTokens: EscrowTokenAccount[]): Promise<NFTAccount[]> {
    return Promise.all(escrowTokens.map((et) => loadNFTByEscrowToken(connection, et)))
}

const cache: { [eTokenPk: string]: NFTAccount } = {};

async function loadNFTByEscrowToken(connection: Connection, eToken: EscrowTokenAccount): Promise<NFTAccount> {
    if (cache[eToken.escrow_token_account]) {
        return cache[eToken.escrow_token_account]
    }

    const parsedAccountInfo = await connection.getParsedAccountInfo(new PublicKey(eToken.escrow_token_account), 'confirmed');

    if (!parsedAccountInfo.value || !Buffer.isBuffer(parsedAccountInfo.value)) {
        throw Error("Could not parse account info")
    }

    //@ts-ignore
    const mint = getMint(parsedAccountInfo.value)
    const pda = await Metadata.getPDA(mint);
    const metadata = await Metadata.load(connection, pda);

    const nft = await getNFTFromMetaData(metadata);

    cache[eToken.escrow_token_account] = nft;

    return nft
}

function getMint(accountInfo:AccountInfo<ParsedAccountData>): PublicKey {
    return accountInfo.data.parsed.info.mint
}

