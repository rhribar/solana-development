import { AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction, Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
import { deserializeUnchecked, serialize, deserialize } from 'borsh';
import {
    AddTokenAccountArgs,
    CancelInstructionArgs, CloseInstructionArgs,
    ConfirmInstructionArgs,
    EscrowTokenExp,
    CreateTradeArgs,
    InitTakerArgs,
    MAX_TRADE_STATE_DATA_SIZE, RemoveTokenAccountArgs,
    Roles,
    TRADE_PROGRAM_ID,
    TRADE_STATE_SCHEMA, SWAP_STATE_SCHEMA,
    TradeState, TransferInstructionArgs, TRADE_PROGRAM_PK
} from "./trade-data";
import { useWallet } from "@solana/wallet-adapter-react";

// const connection = new Connection("https://api.testnet.solana.com", 'singleGossip');
//
//
//
// const pk = [94,210,228,150,16,117,10,187,251,151,49,142,140,244,174,208,183,146,156,209,195,163,210,105,73,116,85,156,11,173,237,230,150,188,86,254,187,104,11,11,73,166,113,55,230,191,237,186,229,167,11,160,91,195,114,131,187,68,135,236,126,237,247,7];
//
// const pk2 = [93,89,151,126,230,185,244,144,207,118,127,104,24,251,1,83,41,193,20,114,27,233,96,99,38,29,166,119,23,118,154,59,145,133,111,230,162,164,230,160,157,65,125,192,252,19,14,55,212,63,248,40,230,172,213,24,68,195,14,113,122,238,171,122];
//
// const makerWallet = Keypair.fromSecretKey(Uint8Array.from(pk));
// const takerWallet = Keypair.fromSecretKey(Uint8Array.from(pk2))

interface TradeTxContext {
    tx: Transaction
    connection: Connection,
    publicKey: PublicKey,
    signers: Keypair[]
}

export async function createTrade({tx, connection, publicKey, signers}: TradeTxContext): Promise<PublicKey> {
    const tradeStateAccount = Keypair.generate();
    const minRent = await connection.getMinimumBalanceForRentExemption(
        MAX_TRADE_STATE_DATA_SIZE,
    );

    const createTradeAccountTx = SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: tradeStateAccount.publicKey,
        lamports: minRent,
        space: MAX_TRADE_STATE_DATA_SIZE,
        programId: TRADE_PROGRAM_PK,
    });

    tx.add(createTradeAccountTx);
    signers.push(tradeStateAccount);

    const data = Buffer.from(serialize(TRADE_STATE_SCHEMA, new CreateTradeArgs()));
    const initTradeIx = new TransactionInstruction({
        programId: TRADE_PROGRAM_PK,
        keys: [
            { pubkey: publicKey, isSigner: true, isWritable: false },
            { pubkey: tradeStateAccount.publicKey, isSigner: true, isWritable: true },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
        ],
        data
    });

    tx.add(initTradeIx)

    return tradeStateAccount.publicKey
}

export async function fetchTradeState(connection: Connection, tradePubkey: PublicKey): Promise<TradeState> {
    const account = await connection.getAccountInfo(tradePubkey, 'confirmed');

    if (!account) {
        throw Error("Trade not found")
    }

    return deserializeUnchecked(SWAP_STATE_SCHEMA, TradeState, account.data as Buffer)
}
