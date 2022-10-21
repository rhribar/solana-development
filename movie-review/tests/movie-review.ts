import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { MovieReview } from "../target/types/movie_review";

describe("movie-review", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.MovieReview as Program<MovieReview>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
