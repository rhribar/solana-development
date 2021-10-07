import {createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState} from "react";
import {Connection, Keypair, PublicKey, Transaction} from "@solana/web3.js";
import {getNFTsByEscrowTokens, NFTAccount} from "../solana-sdk/nft";
import {Roles} from "../solana-sdk/trade-data";
import {createTrade, fetchTradeState} from "../solana-sdk/trade-program";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";

interface IProgramSDK {
    initTrade: () => void,
}

export interface TradeContext {
    initialized: boolean
    tradePubkey?: PublicKey
    myOffer: NFTAccount[]
    theirPubkey?: PublicKey
    theirOffer: NFTAccount[]
    myRole?: Roles
    sdk?: IProgramSDK
}

const TradeContext = createContext<TradeContext>({
    initialized: false,
    myOffer: [],
    theirOffer: [],
});

class ProgramSKD {
    connection: Connection;
    publicKey: PublicKey;
    constructor(connection: Connection, publicKey: PublicKey, sendTransaction: (tx: Transaction, con: Connection) => Promise<string>) {
        this.connection = connection;
        this.publicKey = publicKey;
    }
    async initTrade() {
        const tx = new Transaction();
        const signers: Keypair[] = [];
        const tradeKey = await createTrade({ tx, connection: this.connection, publicKey: this.publicKey, signers })
        await this.signTransaction(tx, signers)

        return tradeKey
    }

    private signTransaction(tx: Transaction, signers: Keypair[]) {

    }
}

export function TradeContextProvider(children: PropsWithChildren<any>) {
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
            console.log("Pk missing")
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
        if (!tradePubkey) {
            return
        }

        (async () => {
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
