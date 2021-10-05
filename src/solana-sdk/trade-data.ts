import { PublicKey } from "@solana/web3.js";

export const TRADE_PROGRAM_ID = "CmXjoSSjqrnHwNuwT6mtKDbXRv3UDCJ4gaFUCcUGZnb4";
export const TRADE_PROGRAM_PK = new PublicKey(TRADE_PROGRAM_ID);

export const MAX_N_TOKEN_ACCOUNTS = 6;
export const MAX_ESCROW_TOKEN_ACCOUNT_SIZE = 2 * 32;
export const MAX_TRADE_STATE_DATA_SIZE = 8
    + 32
    + 32
    + 2 * ( MAX_N_TOKEN_ACCOUNTS * MAX_ESCROW_TOKEN_ACCOUNT_SIZE)
    + 8 + 8;

export enum Roles {
    Maker = 0,
    Taker = 1,
}

export class CreateTradeArgs {
    instruction: number = 0;
}

export class InitTakerArgs {
    instruction: number = 1;
}

export class AddTokenAccountArgs {
    instruction: number = 2;
    role: Roles;
    constructor(args: { role: Roles }) {
        this.role = args.role;
    }
}

export class RemoveTokenAccountArgs {
    instruction: number = 3;
    role: Roles;
    constructor(args: { role: Roles }) {
        this.role = args.role;
    }
}

export class ConfirmInstructionArgs {
    instruction: number = 4;
    role: Roles;
    expected_token_accounts: EscrowTokenExp[]
    constructor(args: { role: Roles, expected_token_accounts: EscrowTokenExp[] }) {
        this.role = args.role;
        this.expected_token_accounts = args.expected_token_accounts;

    }
}

export class EscrowTokenExp {
    pk: Uint8Array;
    amount: number;
    constructor(args: { pk: Uint8Array, amount: number}) {
        this.pk = args.pk;
        this.amount = args.amount
    }
}

export class CancelInstructionArgs {
    instruction: number = 5;
    role: Roles;
    constructor(args: { role: Roles }) {
        this.role = args.role;
    }
}

export class TransferInstructionArgs {
    instruction: number = 6;
}

export class CloseInstructionArgs {
    instruction: number = 7;
}


export const TRADE_STATE_SCHEMA = new Map<any, any>([
    [
        CreateTradeArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
            ],
        },
    ],
    [
        InitTakerArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8']
            ]
        }
    ],
    [
        AddTokenAccountArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['role', 'u8'],
            ]
        }
    ],
    [
        RemoveTokenAccountArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['role', 'u8'],
            ]
        }
    ],
    [
        ConfirmInstructionArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['role', 'u8'],
                ['expected_token_accounts', [EscrowTokenExp]]
            ]
        }
    ],
    [
        EscrowTokenExp,
        {
            kind: 'struct',
            fields: [
                ['pk', [32]],
                ['amount', 'u64']
            ]
        }
    ],
    [
        CancelInstructionArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['role', 'u8'],
            ]
        }
    ],
    [
        TransferInstructionArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
            ]
        }
    ],
    [
        CloseInstructionArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
            ]
        }
    ]
]);

export type Pubkey = string;

export class SwapState{
    key: number;
    maker_pk: Pubkey;
    taker_pk: Pubkey | null;
    taker_temp_token_acc: EscrowTokenAccount[];
    maker_temp_token_acc: EscrowTokenAccount[];
    maker_confirmed: boolean;
    taker_confirmed: boolean;

    constructor(args: {
        key: number,
        maker_pk: Pubkey,
        taker_pk: Pubkey | null,
        taker_temp_token_acc: EscrowTokenAccount[],
        maker_temp_token_acc: EscrowTokenAccount[],
        maker_confirmed: boolean,
        taker_confirmed: boolean,
    }) {
        this.key = args.key;
        this.maker_pk = new PublicKey(args.maker_pk).toString();
        this.taker_pk = args.taker_pk ? new PublicKey(args.taker_pk).toString() : args.taker_pk;
        this.maker_temp_token_acc = args.maker_temp_token_acc;
        this.taker_temp_token_acc = args.taker_temp_token_acc;
        this.maker_confirmed = args.maker_confirmed;
        this.taker_confirmed = args.taker_confirmed;
    }
}

export class EscrowTokenAccount {
    escrow_token_account: Pubkey;
    recipient_account: Pubkey | null;
    constructor(
        args: {
            escrow_token_account: Pubkey, 
            recipient_account: Pubkey | null
        }
    ) {
        this.escrow_token_account = new PublicKey(args.escrow_token_account).toString();
        this.recipient_account = args.recipient_account ?  new PublicKey(args.recipient_account).toString() : null;
    }
}


export const SWAP_STATE_SCHEMA = new Map<any, any>([
    [
        SwapState,
        {
            kind: 'struct',
            fields: [
                ['key', 'u8'],
                ['maker_pk', [32]],
                ['taker_pk', { kind: 'option', type: [32] }],
                ['maker_temp_token_acc', [EscrowTokenAccount]],
                ['taker_temp_token_acc', [EscrowTokenAccount]],
                ['maker_confirmed', 'u8'],
                ['taker_confirmed', 'u8'],
            ]
        }
    ],
    [
        EscrowTokenAccount,
        {
            kind: 'struct',
            fields: [
                ['escrow_token_account', [32]],
                ['recipient_account', { kind: 'option', type: [32] }]
            ]
        }
    ]
]);