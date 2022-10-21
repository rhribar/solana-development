const anchor = require('@project-serum/anchor')

const main = async() => {
  console.log("starting tests ...")

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Gifportal


  const baseAccount = anchor.web3.Keypair.generate();
  const tx = await program.rpc.startStuffOff({ // you can use snake case in rust and camel case in js, anchor transforms
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    },
    signers: [baseAccount]
  });
  console.log("Your transaction signature", tx);

  let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log("gif count", account.totalGifs.toString());

  await program.rpc.addGif("https://i.gifer.com/EItU.gif", { // we pass in our acc context, this time just one, which is base acount
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
    },
  });

  account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log("gif count", account.totalGifs.toString());
  console.log("gif list", account.gifList);
}

const runMain = async() => {
  try {
    await main()
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

runMain();
