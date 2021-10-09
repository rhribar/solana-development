import {createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState} from "react";
import {Connection, Keypair, PublicKey, Transaction} from "@solana/web3.js";
import {getNFTsByEscrowTokens, NFTAccount} from "../solana-sdk/nft";
import {EscrowTokenAccount, Roles, TradeState} from "../solana-sdk/trade-data";
import {
    addTokenAccount,
    cancel,
    confirm,
    createTrade,
    fetchTradeState,
    removeTokenAccount,
    TradeTxContext,
    transfer,
    close
} from "../solana-sdk/trade-program";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {SendTransactionOptions} from "@solana/wallet-adapter-base";

interface IProgramSDK {
    initTrade: () => void,
    addToken: (pk: PublicKey) => void,
    removeToken: (pk: PublicKey) => void,
    confirm: () => void,
    cancel: () => void,
    transfer: () => void,
    close: () => void,
}

export interface ITradeContext {
    initialized: boolean
    tradePubkey?: PublicKey
    myOffer: NFTAccount[]
    theirPubkey?: PublicKey
    theirOffer: NFTAccount[]
    myRole?: Roles
    sdk?: IProgramSDK
    myConfirmation: boolean
    theirConfirmation: boolean,
    tradeEmpty: boolean,
}

export const TradeContext = createContext<ITradeContext>({
    initialized: false,
    myOffer: [],
    theirOffer: [],
    myConfirmation: false,
    theirConfirmation: false,
    tradeEmpty: true,
});

type SendTx = (tx: Transaction, con: Connection, options: SendTransactionOptions) => Promise<string>

// #4JZxUC9yAPmvtKj7wn9n5ZF3pTM3B8w6ZqgpW4iP1Rmg

class ProgramSKD {
    connection: Connection;
    publicKey: PublicKey;
    sendTransaction: SendTx;
    role: Roles | undefined;
    tradePk: PublicKey | undefined;

    constructor(connection: Connection, publicKey: PublicKey, sendTransaction: SendTx) {
        this.connection = connection;
        this.publicKey = publicKey;
        this.sendTransaction = sendTransaction
    }

    setRole(role: Roles) {
        this.role = role;
    }

    setTradePk(tradePk: PublicKey) {
        this.tradePk = tradePk;
    }

    getTradeContext(tx: Transaction, signers: Keypair[]): TradeTxContext  {
        return { tx, connection: this.connection, publicKey: this.publicKey, signers, role: this.role }
    }

    async initTrade() {
        console.log('Initializing trade')
        const tx = new Transaction();
        const signers: Keypair[] = [];
        const tradeKey = await createTrade(this.getTradeContext(tx, signers));
        await this.signTransaction(tx, signers)
        console.log(`Done, trade key ${tradeKey}`);
        this.tradePk = tradeKey;
        return tradeKey
    }

    async addToken(tradePk: PublicKey, tokenAccount: PublicKey) {
        console.log('Adding token account')
        const tx = new Transaction()
        const signers: Keypair[] = [];

        await addTokenAccount(this.getTradeContext(tx, signers), tradePk, tokenAccount);
        await this.signTransaction(tx, signers);
    }

    async removeToken(tradePk: PublicKey, pdaTokenAccPK: PublicKey) {
        console.log('Removing token account')
        const tx = new Transaction()
        const signers: Keypair[] = [];

        await removeTokenAccount(this.getTradeContext(tx, signers), tradePk, pdaTokenAccPK);
        await this.signTransaction(tx, signers);
    }

    async confirmTrade(tradeState: TradeState) {
        if (!this.tradePk) {
            throw Error('Trade Missing')
        }

        const tx = new Transaction()
        const signers: Keypair[] = [];

        await confirm(this.getTradeContext(tx, signers), tradeState, this.tradePk)
        await this.signTransaction(tx, signers);
    }

    async cancel() {
        if (!this.tradePk) {
            throw Error('Trade Missing')
        }

        const tx = new Transaction()
        const signers: Keypair[] = [];

        await cancel(this.getTradeContext(tx, signers), this.tradePk);
        await this.signTransaction(tx, signers);
    }

    async transfer(tradeState: TradeState) {
        if (!this.tradePk) {
            throw Error('Trade Missing')
        }

        const tx = new Transaction()
        const signers: Keypair[] = [];
        await transfer(this.getTradeContext(tx, signers), tradeState, this.tradePk);
        await this.signTransaction(tx, signers);
    }

    async close() {
        if (!this.tradePk) {
            throw Error('Trade Missing')
        }

        const tx = new Transaction()
        const signers: Keypair[] = [];
        await close(this.getTradeContext(tx, signers), this.tradePk);
        await this.signTransaction(tx, signers);
    }

    private async signTransaction(tx: Transaction, signers: Keypair[]) {
        const sig = await this.sendTransaction(tx, this.connection, { signers });
        return this.connection.confirmTransaction(sig, 'confirmed');
    }
}

export function TradeContextProvider({ children }: PropsWithChildren<any>) {
    const [ initialized, setInitialized ] = useState(false);
    const [ tradePubkey, setTradePubkey] = useState<PublicKey | undefined>(undefined);
    const [ myOffer, setMyOffer] = useState<NFTAccount[]>([]);
    const [ theirOffer, setTheirOffer] = useState<NFTAccount[]>([]);
    const [ myRole, setMyRole] = useState<Roles.Maker | Roles.Taker | undefined>(undefined);
    const [ myConfirmation, setMyConfirmation ] = useState(false);
    const [ theirConfirmation, setTheirConfirmation ] = useState(false);
    const [ tradeState, setTradeState ] = useState<TradeState | undefined>(undefined);
    const [ finished,  setFinished ] = useState(false);
    const [ tradeEmpty,  setTradeEmpty ] = useState(false);

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const programSDK = useMemo(() => {
        if (!publicKey) {
            return
        }

        return new ProgramSKD(connection, publicKey, sendTransaction)
    }, [connection, publicKey, sendTransaction, myRole])


    const initTrade = useCallback(async () => {
        if (!programSDK) {
            throw Error("MISSING PROGRAM SDK")
        }

        const tradeKey = await programSDK.initTrade();
        setInitialized(true);
        setTradePubkey(tradeKey);
        setMyRole(Roles.Maker);

    }, [programSDK]);

    const addToken = useCallback(async (tokenAccount: PublicKey) => {
        if (!programSDK) {
            throw Error("MISSING PROGRAM SDK")
        }

        if (!tradePubkey) {
            throw Error("Missing trade key")
        }

        try {
            await programSDK.addToken(tradePubkey, tokenAccount)
            fetchState();
        } catch (e) {
            console.log(e)
        }

    }, [tradePubkey, programSDK])

    const removeToken = useCallback(async (pdaTokenAccount: PublicKey) => {
        if (!programSDK) {
            throw Error("MISSING PROGRAM SDK")
        }

        if (!tradePubkey) {
            throw Error("Missing trade key")
        }

        try {
            await programSDK.removeToken(tradePubkey, pdaTokenAccount)
            fetchState();
        } catch (e) {
            console.log(e)
        }

    }, [tradePubkey, programSDK])

    const confirm = useCallback(async () => {
        if (!tradePubkey || !tradeState || !programSDK) {
            return
        }

        await programSDK.confirmTrade(tradeState);
        setMyConfirmation(true);

    }, [tradePubkey, tradePubkey, programSDK])

    const transfer = useCallback(async () => {
        if (!tradePubkey || !tradeState || !programSDK) {
            return
        }

        await programSDK.transfer(tradeState);
        await setFinished(true);

    }, [tradePubkey, tradePubkey, programSDK])

    const cancel = useCallback(async () => {
        if (!tradePubkey || !tradeState || !programSDK) {
            return
        }
        await programSDK.cancel();
        setMyConfirmation(false);

    }, [tradePubkey, tradePubkey, programSDK]);

    const close = useCallback(async () => {
        if (!tradePubkey || !tradeState || !programSDK) {
            return
        }

        await programSDK.close();

        setInitialized(false);
        setTradePubkey(undefined);
        window.location.hash = "";

    }, [tradePubkey, tradePubkey, programSDK]);

    useEffect(() => {
        const tradeKey = window.location.hash;
        if (tradeKey) {
            console.log('Setting pk', tradeKey)
            setTradePubkey(new PublicKey(tradeKey.substring(1)));
            setInitialized(true);
        }

    }, [publicKey]);

    useEffect(() => {
        if (!programSDK || !tradePubkey) {
            return
        }

        window.location.hash = tradePubkey.toBase58();
        programSDK.setTradePk(tradePubkey);

    }, [tradePubkey, programSDK])

    useEffect(() => {
        if (!tradeState) {
            return
        }

        setTradeEmpty(tradeState.taker_temp_token_acc.length === 0 && tradeState.maker_temp_token_acc.length === 0);
    }, [tradeState])


    const fetchState = async () => {
        if (!tradePubkey || !publicKey) {
            return
        }

        const tradeState = await fetchTradeState(connection, tradePubkey)

        setTradeState(tradeState);

        let myTokens;
        let theirTokens;
        let myConfirmation;
        let theirConfirmation;

        if (tradeState.maker_pk === publicKey.toString()) {
            myTokens = tradeState.maker_temp_token_acc
            theirTokens = tradeState.taker_temp_token_acc
            myConfirmation = tradeState.maker_confirmed
            theirConfirmation = tradeState.taker_confirmed
            setMyRole(Roles.Maker)
        } else {
            myTokens = tradeState.taker_temp_token_acc
            theirTokens = tradeState.maker_temp_token_acc
            myConfirmation = tradeState.taker_confirmed
            theirConfirmation = tradeState.maker_confirmed
            setMyRole(Roles.Taker)
        }

        setMyOffer(await getNFTsByEscrowTokens(connection, myTokens));
        setTheirOffer(await getNFTsByEscrowTokens(connection, theirTokens));
        setMyConfirmation(myConfirmation);
        setTheirConfirmation(theirConfirmation);
    }

    useEffect(() => { fetchState() }, [connection, tradePubkey])

    return (
        <TradeContext.Provider value={{
            myRole,
            initialized,
            tradePubkey,
            theirOffer: theirOffer,
            myOffer: myOffer,
            myConfirmation,
            theirConfirmation,
            tradeEmpty,
            sdk: {
                initTrade,
                addToken,
                removeToken,
                confirm,
                close,
                cancel,
                transfer,
            }
        }}
        >
            { children }
        </TradeContext.Provider>
    )
}
