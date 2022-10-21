const assert = require('assert');
const anchor = require("@project-serum/anchor");

const { SystemProgram } = anchor.web3;

describe('mycalculatordapp', () => {
    const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);
    const calculator = anchor.web3.Keypair.generate(); // creating credentials for our calc app that we are creating
    // we can retrive our calc acc later through this keypair
    const program = anchor.workspace.Mycalculatordapp;

    it('Creates a calculator', async() => {
        await program.rpc.create("Welcome to Solana bro", {
            accounts: {
                calculator: calculator.publicKey,
                user: provider.wallet.publicKey,
                systemProgram: SystemProgram.programId
            },
            signers: [calculator] // pass in signers calc cuz we creating a new calc
        }) // create is the function we have defined
        const account = await program.account.calculator.fetch(calculator.publicKey);
        assert.ok(account.greeting === "Welcome to Solana bro")
    });

	it('Adds two numbers', async() => {
		// BN ... anchor big numbers
        await program.rpc.add(new anchor.BN(2), new anchor.BN(3), {
			accounts: {
				calculator: calculator.publicKey
			}
		})
        const account = await program.account.calculator.fetch(calculator.publicKey);
        assert.ok(account.result.eq(new anchor.BN(5)))
    });

	it('Multi two numbers', async() => {
		// BN ... anchor big numbers
        await program.rpc.multi(new anchor.BN(2), new anchor.BN(3), {
			accounts: {
				calculator: calculator.publicKey,
			},
		});

        const account = await program.account.calculator.fetch(calculator.publicKey);
        assert.ok(account.result.eq(new anchor.BN(6)));
    });

	it('Substract two numbers', async() => {
		// BN ... anchor big numbers
        await program.rpc.substract(new anchor.BN(5), new anchor.BN(3), {
			accounts: {
				calculator: calculator.publicKey,
			},
		});

        const account = await program.account.calculator.fetch(calculator.publicKey);
        assert.ok(account.result.eq(new anchor.BN(2)));
    });

	it('Divides two numbers', async() => {
		// BN ... anchor big numbers
        await program.rpc.divide(new anchor.BN(5), new anchor.BN(3), {
			accounts: {
				calculator: calculator.publicKey,
			},
		});

        const account = await program.account.calculator.fetch(calculator.publicKey);
        assert.ok(account.result.eq(new anchor.BN(1)));
        assert.ok(account.remainder.eq(new anchor.BN(2)));
    });
})

