import { Card, Button } from '@globalid/design-system';
import { ThemeConsumer } from 'styled-components';
import * as Styled from './Inventory.styled'

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {FC, useCallback, useEffect, useMemo, useState} from "react";
import {getNFTsByPublicKey, NFTAccount} from "../solana-sdk/nft";
import {InventoryItem} from "./InventoryItem";
import {Spinner} from "./Spinner/Spinner";

export const InventoryCard: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [inventory, setInventory] = useState([] as NFTAccount[])
    const [loading, setLoading] = useState(false);

    // const invn = useMemo(() => {
    //     if (!publicKey) {
    //         console.log("No pk")
    //         return
    //     }
    //
    //     return getNFTsByPublicKey(connection, publicKey);
    // }, [publicKey])

    const loadInventory = () => {
        console.log("Loading inventory", publicKey ? publicKey.toString() : "no pk")
        if (!publicKey) {
            return
        }
        (async () => {
            setLoading(true)
            setInventory(await getNFTsByPublicKey(connection, publicKey));
            setLoading(false)
        })();
    }

    useEffect(loadInventory, [publicKey])

    useEffect(() => {
        console.log(inventory)
    }, [inventory])

    return (
        <ThemeConsumer key="">
        {(theme) => (
            <Styled.Card>
                <Card isHoverable={false}>
                    <div style={{ display: 'flex', alignItems: 'center'}}>
                        <div>
                            <h1 style={{ color: theme.color.TEXT_1, marginTop: '0' }}>Your Inventory</h1>
                            {!publicKey ? <h3 style={{color: theme.color.TEXT_1 }}>No Wallet Connected</h3> : null}
                            { loading ? <Spinner/> : null}
                            {inventory.map((nft: NFTAccount) => InventoryItem({ nft }))}
                        </div>
                    </div>
                </Card>
            </Styled.Card>
        )}
      </ThemeConsumer>
    )
  }