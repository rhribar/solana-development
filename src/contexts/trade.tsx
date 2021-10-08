import {createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState} from "react";
import {Connection, Keypair, PublicKey, Transaction} from "@solana/web3.js";
import {getNFTsByEscrowTokens, NFTAccount} from "../solana-sdk/nft";
import {Roles} from "../solana-sdk/trade-data";
import {createTrade, fetchTradeState} from "../solana-sdk/trade-program";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {ThemeContext} from "styled-components";
import {SendTransactionOptions} from "@solana/wallet-adapter-base";

interface IProgramSDK {
    initTrade: () => void,
}

export interface ITradeContext {
    initialized: boolean
    tradePubkey?: PublicKey
    myOffer: NFTAccount[]
    theirPubkey?: PublicKey
    theirOffer: NFTAccount[]
    myRole?: Roles
    sdk?: IProgramSDK
}

export const TradeContext = createContext<ITradeContext>({
    initialized: false,
    myOffer: [],
    theirOffer: [],
});

type SendTx = (tx: Transaction, con: Connection, options: SendTransactionOptions) => Promise<string>

// #4JZxUC9yAPmvtKj7wn9n5ZF3pTM3B8w6ZqgpW4iP1Rmg

class ProgramSKD {
    connection: Connection;
    publicKey: PublicKey;
    sendTransaction: SendTx;
    constructor(connection: Connection, publicKey: PublicKey, sendTransaction: SendTx) {
        this.connection = connection;
        this.publicKey = publicKey;
        this.sendTransaction = sendTransaction
    }
    async initTrade() {
        console.log('Initializing trade')
        const tx = new Transaction();
        const signers: Keypair[] = [];
        const tradeKey = await createTrade({ tx, connection: this.connection, publicKey: this.publicKey, signers })
        await this.signTransaction(tx, signers)
        console.log(`Done, trade key ${tradeKey}`);
        return tradeKey
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
    const [ myRole, setMyRole] = useState<Roles | undefined>(undefined);
    const [ myConfirmation, setMyConfirmation ] = useState(false);
    const [ theirConfirmation, setTheirConfirmation ] = useState(false);


    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const programSDK = useMemo(() => {
        if (!publicKey) {
            return
        }

        return new ProgramSKD(connection, publicKey, sendTransaction)
    }, [connection, publicKey, sendTransaction])


    const initTrade = useCallback(async () => {
        if (!programSDK) {
            throw Error("MISSING PROGRAM SDK")
        }

        const tradeKey = await programSDK.initTrade();
        setInitialized(true);
        setTradePubkey(tradeKey);
        setMyRole(Roles.Maker);

    }, [programSDK]);

    useEffect(() => {
        const tradeKey = window.location.hash;
        if (tradeKey) {
            console.log('Setting pk', tradeKey)
            setTradePubkey(new PublicKey(tradeKey.substring(1)));
            setInitialized(true);
        }

    }, [publicKey]);

    useEffect(() => {
        if (tradePubkey) {
            window.location.hash = tradePubkey?.toBase58();
        }
    }, [tradePubkey])


    useEffect(() => {
        (async () => {
            if (!tradePubkey) {
                return
            }

            const tradeState = await fetchTradeState(connection, tradePubkey)

            let myTokens;
            let theirTokens;
            let myConfirmation;
            let theirConfirmation;

            if (myRole == Roles.Maker) {
                myTokens = tradeState.maker_temp_token_acc
                theirTokens = tradeState.taker_temp_token_acc
                myConfirmation = tradeState.maker_confirmed
                theirConfirmation = tradeState.taker_confirmed
            } else {
                myTokens = tradeState.taker_temp_token_acc
                theirTokens = tradeState.maker_temp_token_acc
                myConfirmation = tradeState.taker_confirmed
                theirConfirmation = tradeState.maker_confirmed
            }

            setMyOffer(await getNFTsByEscrowTokens(connection, myTokens));
            setTheirOffer(await getNFTsByEscrowTokens(connection, theirTokens));
            setMyConfirmation(myConfirmation);
            setTheirConfirmation(theirConfirmation);

        })()
    }, [connection, tradePubkey])

    return (
        <TradeContext.Provider value={{
            myRole,
            initialized,
            tradePubkey,
            theirOffer: [],
            myOffer: [],
            sdk: {
                initTrade
            }
        }}
        >
            { children }
        </TradeContext.Provider>
    )
}
