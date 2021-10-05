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
    SwapState, TransferInstructionArgs, TRADE_PROGRAM_PK
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
    // tx.recentBlockhash = (await connection.getRecentBlockhash('singleGossip')).blockhash;
    // tx.sign(...signers)
    //
    // const res = await sendAndConfirmTransaction(connection, tx, signers);
    //
    // return {
    //     response: res,
    //     swapAccount: tradeStateAccount.publicKey
    // }

    return tradeStateAccount.publicKey
}

export async function initTaker(
    tradeAccountPubkeyString: string
): Promise<any> {
    const tx = new Transaction();
    const signers = [];

    const tradeAccountPubkey = new PublicKey(tradeAccountPubkeyString);

    const data = Buffer.from(serialize(TRADE_STATE_SCHEMA, new InitTakerArgs()))

    const initTakerIx = new TransactionInstruction({
        programId: new PublicKey(TRADE_PROGRAM_ID),
        keys: [
            { pubkey: takerWallet.publicKey, isSigner: true, isWritable: false },
            { pubkey: tradeAccountPubkey, isSigner: false, isWritable: true }
        ],
        data
    });

    signers.push(takerWallet);

    tx.add(initTakerIx);
    tx.recentBlockhash = (await connection.getRecentBlockhash('singleGossip')).blockhash;
    tx.sign(...signers)

    return sendAndConfirmTransaction(connection, tx, signers);
}

// export async function addTokenAccount(    

// ) {
//     const tx = new Transaction();


// }

export async function mintYourselfRandomToken(maker: boolean) {

    const wallet = maker ? makerWallet : takerWallet;

    const tx = new Transaction();
    const signers = [];

    const mintAccount = new Keypair();
    console.log(`Mint Pubk ${mintAccount.publicKey.toBase58()}`);

    const minLamports = await connection.getMinimumBalanceForRentExemption(MintLayout.span, 'singleGossip');

    const createMintAccountIx = SystemProgram.createAccount({
        programId: TOKEN_PROGRAM_ID,
        space: MintLayout.span,
        lamports: minLamports,
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintAccount.publicKey
    })

    tx.add(createMintAccountIx)
    signers.push(wallet);
    signers.push(mintAccount);

    const mintInitIx = Token.createInitMintInstruction(
        TOKEN_PROGRAM_ID,
        mintAccount.publicKey,
        0,
        wallet.publicKey,
        wallet.publicKey
    );

    tx.add(mintInitIx);

    const [tokenAddress, _] = await PublicKey.findProgramAddress(
        [
            wallet.publicKey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            mintAccount.publicKey.toBuffer()
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    )

    console.log(`Token Acc Pubk ${tokenAddress.toBase58()}`);

    const createTokenAccountIx = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintAccount.publicKey,
        tokenAddress,
        wallet.publicKey,
        wallet.publicKey,
    );

    tx.add(createTokenAccountIx);
    
    const mintToIx = Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        mintAccount.publicKey,
        tokenAddress,
        wallet.publicKey,
        [],
        1,
    );

    tx.add(mintToIx);

    tx.recentBlockhash = (await connection.getRecentBlockhash('singleGossip')).blockhash;
    tx.sign(...signers)

    const res = await sendAndConfirmTransaction(connection, tx, signers);

    return {
        response: res,
        tokenPubkey: tokenAddress,
        mintPubkey: mintAccount.publicKey,
    }
}

export async function addTokenAccoutToEscrow(
    swapAccountPubkeyStr: string,
    tokenAccountPubkeyStr: string,
    maker: boolean
) {
    const wallet = maker ? makerWallet : takerWallet;
    const tx = new Transaction();
    const signers = [];

    const swapAccountPubkey = new PublicKey(swapAccountPubkeyStr);
    const tokenAccountPubkey = new PublicKey(tokenAccountPubkeyStr);

    //@ts-expect-error
    const mintAccountPubkey = new PublicKey((await connection.getParsedAccountInfo(tokenAccountPubkey, 'singleGossip')).value!.data.parsed.info.mint);

    const tempTokenAccount = new Keypair();
    const createTempTokenAccountIx = SystemProgram.createAccount({
        programId: TOKEN_PROGRAM_ID,
        space: AccountLayout.span,
        lamports: await connection.getMinimumBalanceForRentExemption(AccountLayout.span, 'singleGossip'),
        fromPubkey: wallet.publicKey,
        newAccountPubkey: tempTokenAccount.publicKey
    });

    tx.add(createTempTokenAccountIx);

    signers.push(wallet)
    signers.push(tempTokenAccount);

    const initTempAccountIx = Token.createInitAccountInstruction(TOKEN_PROGRAM_ID, mintAccountPubkey, tempTokenAccount.publicKey, wallet.publicKey);
    const transferXTokensToTempAccIx = Token.createTransferInstruction(TOKEN_PROGRAM_ID, tokenAccountPubkey, tempTokenAccount.publicKey, wallet.publicKey, [], 1);

    tx.add(initTempAccountIx);
    tx.add(transferXTokensToTempAccIx);

    const data = Buffer.from(serialize(TRADE_STATE_SCHEMA, new AddTokenAccountArgs({ role: maker ? Roles.Maker : Roles.Taker })));

    const programId = new PublicKey(TRADE_PROGRAM_ID);
    const addTokenAccountIx = new TransactionInstruction({
        programId,
        keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
            { pubkey: swapAccountPubkey, isSigner: false, isWritable: true },
            { pubkey: tempTokenAccount.publicKey, isSigner: true, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data
    })

    tx.add(addTokenAccountIx);

    tx.recentBlockhash = (await connection.getRecentBlockhash('singleGossip')).blockhash;
    tx.sign(...signers)

    console.log("Sending tx to add token", tokenAccountPubkeyStr)
    const res = await sendAndConfirmTransaction(connection, tx, signers);

    console.log("Done", res)
}

export async function fetchSwapState(swapStatePubkeyString: string): Promise<SwapState> {
    const swapStatePubkey = new PublicKey(swapStatePubkeyString);
    
    const account = await connection.getAccountInfo(swapStatePubkey, 'singleGossip');

    console.log(account);

    const des = deserializeUnchecked(SWAP_STATE_SCHEMA, SwapState, account?.data as Buffer)

    console.log(des)

    return des
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

export async function removeTokenAccount(
    swapAccountPubkeyStr: string,
    tokenAccountPubkeyStr: string,
    maker: boolean
) {
    const tx = new Transaction();
    const signers = [];
    const wallet = maker ? makerWallet : takerWallet;

    const pdaTokenAccountPubkey = new PublicKey(tokenAccountPubkeyStr);
    //@ts-expect-error
    const mintAccountPubkey = new PublicKey((await connection.getParsedAccountInfo(pdaTokenAccountPubkey, 'singleGossip')).value!.data.parsed.info.mint);

    const [returnTokenAddress, _] = await PublicKey.findProgramAddress(
        [
            wallet.publicKey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            mintAccountPubkey.toBuffer()
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    )
    const programId = new PublicKey(TRADE_PROGRAM_ID);

    const [pda, _bumpSeed] = await getPda(new PublicKey(swapAccountPubkeyStr), programId);

    console.log("PDA", pda.toString())
    console.log("Return Address", returnTokenAddress.toString())


    const removeTokenAccIx = new TransactionInstruction({
        programId,
        keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
            { pubkey: new PublicKey(swapAccountPubkeyStr), isSigner: false, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: returnTokenAddress, isSigner: false, isWritable: true },
            { pubkey: new PublicKey(tokenAccountPubkeyStr), isSigner: false, isWritable: true },
            { pubkey: pda, isSigner: false, isWritable: true }
        ],
        data: Buffer.from(serialize(TRADE_STATE_SCHEMA, new RemoveTokenAccountArgs({ role: maker ? Roles.Maker : Roles.Taker })))
    })

    tx.add(removeTokenAccIx);
    signers.push(wallet);


    tx.recentBlockhash = (await connection.getRecentBlockhash('singleGossip')).blockhash;
    tx.sign(...signers)

    console.log("Sending tx to remove token", tokenAccountPubkeyStr)
    const res = await sendAndConfirmTransaction(connection, tx, signers);

    console.log("Done", res)
}

export async function confirm(
    tradeState: SwapState,
    is_maker: boolean,
    tradeAccountPubkeyString: string
) {
    const tx = new Transaction();
    const signers = [];
    const wallet = is_maker ? makerWallet : takerWallet;

    const programId = new PublicKey(TRADE_PROGRAM_ID);

    const tradeAccountPubkey = new PublicKey(tradeAccountPubkeyString);

    const keys: { pubkey: PublicKey, isSigner: boolean, isWritable: boolean }[] = [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        { pubkey: tradeAccountPubkey, isSigner: false, isWritable: true },
    ];
    
    signers.push(wallet);

    const escrowAccounts = is_maker ? tradeState.taker_temp_token_acc : tradeState.maker_temp_token_acc;
    const expected_token_accounts: EscrowTokenExp[] = [];
 
    for (let i = 0; i < escrowAccounts.length; i++) {
        const escrowAccountPubkey = new PublicKey(escrowAccounts[i].escrow_token_account);
        
        //@ts-expect-error
        const escrowAccountInfo = (await connection.getParsedAccountInfo(escrowAccountPubkey, 'singleGossip')).value!.data.parsed.info
        const mintAccountPubkey = new PublicKey(escrowAccountInfo.mint);

        let tokenAddress;

        if (escrowAccounts[i].recipient_account == null) {
            const [pTokenAddress, _] = await PublicKey.findProgramAddress(
                [
                    wallet.publicKey.toBuffer(),
                    TOKEN_PROGRAM_ID.toBuffer(),
                    mintAccountPubkey.toBuffer()
                ],
                ASSOCIATED_TOKEN_PROGRAM_ID
            )

            tokenAddress = pTokenAddress
            
            const createTokenAccountIx = Token.createAssociatedTokenAccountInstruction(
                ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                mintAccountPubkey,
                tokenAddress,
                wallet.publicKey,
                wallet.publicKey,
            );
        
            tx.add(createTokenAccountIx);
        } else {
            tokenAddress = new PublicKey(escrowAccounts[i].recipient_account as string)
        }

        
        
        keys.push({ pubkey: escrowAccountPubkey, isSigner: false, isWritable: false });
        keys.push({ pubkey: tokenAddress, isSigner: false, isWritable: true });

        console.log(escrowAccountInfo)

        expected_token_accounts.push(new EscrowTokenExp({ pk: escrowAccountPubkey.toBytes(), amount: escrowAccountInfo.tokenAmount.uiAmount }))
    }


    const dataObject = new ConfirmInstructionArgs({ 
        role: is_maker ? Roles.Maker : Roles.Taker,
        expected_token_accounts,
    })

    console.log(dataObject)

    const data = Buffer.from(serialize(TRADE_STATE_SCHEMA, dataObject));

    const confirmIx = new TransactionInstruction({
        programId,
        keys,
        data,
    })

    
    // //@ts-expect-error
    // const escrowAccountInfo = (await connection.getParsedAccountInfo(new PublicKey("6HgwC7WY1ZTuDMmCsuY3NMGuATYDiG5J8dXjC4VM42n1"), 'singleGossip')).value!.data.parsed.info

    // console.log(escrowAccountInfo);

    tx.add(confirmIx);

    tx.recentBlockhash = (await connection.getRecentBlockhash('singleGossip')).blockhash;
    tx.sign(...signers)

    console.log("Sending tx to confirm escrow", is_maker ? "as maker" : "as taker");
    const res = await sendAndConfirmTransaction(connection, tx, signers);

    console.log("Done", res)

    return res
}

export async function cancel(
    is_maker: boolean,
    tradeAccountPubkeyStr: string,
) {
    const tx = new Transaction();
    const signers = [];
    const wallet = is_maker ? makerWallet : takerWallet;


    const programId = new PublicKey(TRADE_PROGRAM_ID);

    const tradeAccountPubkey = new PublicKey(tradeAccountPubkeyStr);

    const cancelIx = new TransactionInstruction({
        programId,
        keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
            { pubkey: tradeAccountPubkey, isSigner: false, isWritable: true },
        ],
        data: Buffer.from(serialize(TRADE_STATE_SCHEMA, new CancelInstructionArgs({ role: is_maker ? Roles.Maker : Roles.Taker })))
    })

    signers.push(wallet);

    tx.add(cancelIx);

    tx.recentBlockhash = (await connection.getRecentBlockhash('singleGossip')).blockhash;
    tx.sign(...signers)

    console.log("Sending tx to cancel escrow", is_maker ? "as maker" : "as taker");
    const res = await sendAndConfirmTransaction(connection, tx, signers);

    console.log("Done", res)

    return res
}

export async function transfer(isMaker: boolean, tradeState: SwapState, tradeAccountPubkeyStr: string) {
    const tx = new Transaction();
    const signers = [];

    const wallet = isMaker ? makerWallet : takerWallet;

    const programId = new PublicKey(TRADE_PROGRAM_ID);

    const tradeAccountPubkey = new PublicKey(tradeAccountPubkeyStr);

    const [pdaMaker, _bumpSeedM] = await getPda(tradeAccountPubkey, programId);

    console.log("pdaM", pdaMaker.toString())

    const keys: { pubkey: PublicKey, isSigner: boolean, isWritable: boolean }[] = [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        { pubkey: tradeAccountPubkey, isSigner: false, isWritable: true },
        { pubkey: new PublicKey(tradeState.maker_pk), isSigner: false, isWritable: true },
        { pubkey: new PublicKey(tradeState.taker_pk as string), isSigner: false, isWritable: true },
        { pubkey: pdaMaker, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
    ];

    let escrowAccounts = [...tradeState.maker_temp_token_acc, ...tradeState.taker_temp_token_acc];
    for (let i = 0; i < escrowAccounts.length; i++) {
        let escrowAccount = escrowAccounts[i];
        keys.push(
            { pubkey: new PublicKey(escrowAccount.escrow_token_account), isSigner: false, isWritable: true },
            { pubkey: new PublicKey(escrowAccount.recipient_account as string), isSigner: false, isWritable: true }
        )
    }

    let transferIx = new TransactionInstruction({
        programId,
        keys,
        data: Buffer.from(serialize(TRADE_STATE_SCHEMA, new TransferInstructionArgs()))
    })

    tx.add(transferIx);
    signers.push(wallet);

    tx.recentBlockhash = (await connection.getRecentBlockhash('singleGossip')).blockhash;
    tx.sign(...signers)

    console.log("Sending transfer tx");
    const res = await sendAndConfirmTransaction(connection, tx, signers);

    console.log("Done", res)

    return res
}

export async function close(
    tradeAccountPubkeyString: string
) {
    const wallet = makerWallet;
    const tx = new Transaction();
    const signers = [];


    const tradeAccountPubkey = new PublicKey(tradeAccountPubkeyString);

    const programId = new PublicKey(TRADE_PROGRAM_ID);
    const data = Buffer.from(serialize(TRADE_STATE_SCHEMA, new CloseInstructionArgs()));
    const closeIx = new TransactionInstruction({
        programId,
        keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
            { pubkey: tradeAccountPubkey, isSigner: false, isWritable: true },
        ],
        data,
    })

    tx.add(closeIx);
    signers.push(wallet);

    tx.recentBlockhash = (await connection.getRecentBlockhash('singleGossip')).blockhash;
    tx.sign(...signers)

    console.log("Sending close tx");
    const res = await sendAndConfirmTransaction(connection, tx, signers);

    console.log("Done", res)

    return res
}
