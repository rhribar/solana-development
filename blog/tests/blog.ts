import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Blog } from "../target/types/blog";
import { PublicKey } from "@solana/web3.js";

describe("blog", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const kp = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from([170,34,235,186,72,160,153,8,133,104,142,64,149,196,214,135,86,6,117,50,251,234,111,73,134,122,196,158,136,44,52,95,95,171,74,92,46,154,119,37,194,88,214,119,243,177,223,227,172,136,255,71,104,75,144,233,63,68,213,94,65,52,28,207])
  );

  const seeds_to_use = Uint8Array.from([
    97, 98, 100, 49, 50, 51
  ])

  const program = anchor.workspace.Blog as Program<Blog>;
  const pda = PublicKey.findProgramAddressSync([seeds_to_use], program.programId)


  it("create post", async () => {
    // Add your test here.
    const tx = await program.methods
    .createPost(seeds_to_use)
    .accounts({
      accountData: pda[0], 
      payer: kp.publicKey
    })
    .singers([kp])
    .rpc();

    console.log("Your transaction signature", tx);
  });
});
