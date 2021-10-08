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

    const tokenAccounts = await Promise.all(accounts.map(async (md) => ({ tokenAccount: await getTokenAccountsByMint(connection, publicKey, new PublicKey(md.data.mint)), metadata: md })));

    return Promise.all(tokenAccounts.map(getNFTFromMetaData))
}

let tokenAccCache: {[pk: string]: PublicKey} = {}

async function getTokenAccountsByMint(connection: Connection, owner: PublicKey, mint: PublicKey): Promise<PublicKey> {
    if (!!tokenAccCache[mint.toString()]) {
        console.log("Cache hit", mint.toString())
        return tokenAccCache[mint.toString()]
    }

    const tokenAcc = (await connection.getTokenAccountsByOwner(owner, { mint }, 'confirmed')).value;

    if (!tokenAcc[0]) {
       throw Error("Couldn't find token accounts");
    }

    tokenAccCache[mint.toString()] = tokenAcc[0].pubkey

    return tokenAcc[0].pubkey
}

async function unpackTokenAccounts(connection: Connection, pubkey: PublicKey) {
    //@ts-ignore
    const mintAccountPubkey = new PublicKey((await connection.getParsedAccountInfo(pubkey, 'confirmed')).value!.data.parsed.info.mint);

    console.log(pubkey.toString(), mintAccountPubkey.toString())
}

async  function loadNFTData(uri: string): Promise<{ image: string, name: string }> {
    return (await axios.get(uri)).data 
}

async function getNFTFromMetaData({ tokenAccount,  metadata }: {tokenAccount: PublicKey, metadata: Metadata }): Promise<NFTAccount> {
    return { pubkey: tokenAccount, metaData: await loadNFTData(metadata.data.data.uri)}
}

export async function getNFTsByEscrowTokens(connection: Connection, escrowTokens: EscrowTokenAccount[]): Promise<NFTAccount[]> {
    console.log(escrowTokens)
    const nfts = await Promise.all(escrowTokens.map((et) => loadNFTByEscrowToken(connection, et)))
    console.log('nfts', nfts)
    return nfts
}

const cache: { [eTokenPk: string]: NFTAccount } = {};

async function loadNFTByEscrowToken(connection: Connection, eToken: EscrowTokenAccount): Promise<NFTAccount> {
    // if (cache[eToken.escrow_token_account]) {
    //     return cache[eToken.escrow_token_account]
    // }

    const parsedAccountInfo = await connection.getParsedAccountInfo(new PublicKey(eToken.escrow_token_account), 'confirmed');
    console.log('parsedAccountInfo', parsedAccountInfo)

    if (!parsedAccountInfo.value || Buffer.isBuffer(parsedAccountInfo.value)) {
        throw Error("Could not parse account info")
    }

    //@ts-ignore
    const mint = getMint(parsedAccountInfo.value)
    const pda = await Metadata.getPDA(mint);
    const metadata = await Metadata.load(connection, pda);

    const nft = await getNFTFromMetaData({ tokenAccount: new PublicKey(eToken.escrow_token_account), metadata});

    // cache[eToken.escrow_token_account] = nft;

    console.log('nft', nft)

    return nft
}

function getMint(accountInfo:AccountInfo<ParsedAccountData>): PublicKey {
    return accountInfo.data.parsed.info.mint
}

