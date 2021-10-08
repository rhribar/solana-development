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

export interface TradeTxContext {
    tx: Transaction
    connection: Connection,
    publicKey: PublicKey,
    signers: Keypair[],
    role: Roles,
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

export async function addTokenAccount(
    { tx, connection, signers, publicKey, role }: TradeTxContext,
    tradePk: PublicKey,
    tokenAccountPubkey: PublicKey,
) {
    //@ts-expect-error
    const mintAccountPubkey = new PublicKey((await connection.getParsedAccountInfo(tokenAccountPubkey, 'confirmed')).value!.data.parsed.info.mint);

    const tempTokenAccount = new Keypair();
    const createTempTokenAccountIx = SystemProgram.createAccount({
        programId: TOKEN_PROGRAM_ID,
        space: AccountLayout.span,
        lamports: await connection.getMinimumBalanceForRentExemption(AccountLayout.span, 'singleGossip'),
        fromPubkey: publicKey,
        newAccountPubkey: tempTokenAccount.publicKey
    });

    tx.add(createTempTokenAccountIx);
    signers.push(tempTokenAccount);

    const initTempAccountIx = Token.createInitAccountInstruction(TOKEN_PROGRAM_ID, mintAccountPubkey, tempTokenAccount.publicKey, publicKey);
    const transferXTokensToTempAccIx = Token.createTransferInstruction(TOKEN_PROGRAM_ID, tokenAccountPubkey, tempTokenAccount.publicKey, publicKey, [], 1);

    tx.add(initTempAccountIx);
    tx.add(transferXTokensToTempAccIx);

    const data = Buffer.from(serialize(TRADE_STATE_SCHEMA, new AddTokenAccountArgs({ role })));

    const programId = new PublicKey(TRADE_PROGRAM_ID);
    const addTokenAccountIx = new TransactionInstruction({
        programId,
        keys: [
            { pubkey: publicKey, isSigner: true, isWritable: false },
            { pubkey: tradePk, isSigner: false, isWritable: true },
            { pubkey: tempTokenAccount.publicKey, isSigner: true, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data
    })

    tx.add(addTokenAccountIx);
}

export async function removeTokenAccount(
    { tx, connection, signers, publicKey, role }: TradeTxContext,
    tradePk: PublicKey,
    pdaTokenAccountPubkey: PublicKey,
) {
    //@ts-expect-error
    const mintAccountPubkey = new PublicKey((await connection.getParsedAccountInfo(pdaTokenAccountPubkey, 'confirmed')).value!.data.parsed.info.mint);

    const [returnTokenAddress, _] = await PublicKey.findProgramAddress(
        [
            publicKey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            mintAccountPubkey.toBuffer()
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    )

    const programId = new PublicKey(TRADE_PROGRAM_ID);

    const [pda, _bumpSeed] = await getPda(new PublicKey(tradePk), programId);

    console.log("PDA", pda.toString())
    console.log("Return Address", returnTokenAddress.toString())

    const removeTokenAccIx = new TransactionInstruction({
        programId,
        keys: [
            { pubkey: publicKey, isSigner: true, isWritable: false },
            { pubkey: new PublicKey(tradePk), isSigner: false, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: returnTokenAddress, isSigner: false, isWritable: true },
            { pubkey: pdaTokenAccountPubkey, isSigner: false, isWritable: true },
            { pubkey: pda, isSigner: false, isWritable: true }
        ],
        data: Buffer.from(serialize(TRADE_STATE_SCHEMA, new RemoveTokenAccountArgs({ role })))
    })

    tx.add(removeTokenAccIx);
}

async function getPda(
    tradeAccountPubkey: PublicKey,
    programId: PublicKey
) {
    return PublicKey.findProgramAddress(
        [ Buffer.from("twf no monke"), tradeAccountPubkey.toBytes() ],
        programId,
    );
}