use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod self_custodial_facebook {
    use super::*;

    pub fn create_account(
        ctx: Context<Initialize>, 
        name: String, 
        status: String, 
        twitter: String
    ) -> ProgramResult {
        
        let users_account_data = &mut ctx.accounts.facebook_account;
        users_account_data.bump = *ctx.bumps.get("facebook_account").unwrap(); // this searches which bump it has

        users_account_data.authority = *ctx.accounts.signer.key;
        users_account_data.name = name.to_owned();
        users_account_data.status = status.to_owned();
        users_account_data.twitter = twitter.to_owned();

        msg!("Created a new account with following details 
            Name :: {0}
            Status :: {1}
            Twitter :: {2}
            Bump :: {3}
            ", name, status, twitter, users_account_data.bump
        );

        Ok(())
    }

    pub fn update_status(
        ctx: Context<Update>, 
        new_status: String, 
    ) -> ProgramResult {
        msg!("Updating status from :: {0} -> to :: {1}", &ctx.accounts.facebook_account.status, &new_status);

        ctx.accounts.facebook_account.status = new_status;

        Ok(())
    }

    pub fn delete_account(
        _ctx: Context<Close>, 
    ) -> ProgramResult {

        msg!("Account Closed successfully through PDA");

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    // Creating a new account for every user with seed of their wallet address.
    // This constraint allow one-account per wallet address
    #[account(
        init, 
        payer = signer, 
        space = FacebookAccount::LEN, 
        seeds = ["self-custodial-facebook2".as_bytes(), signer.key().as_ref()], 
        bump,
    )] 
    pub facebook_account: Account<'info, FacebookAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = ["self-custodial-facebook2".as_bytes(), signer.key().as_ref()], 
        bump = facebook_account.bump,
    )] // se we get the same account but mutable?
    pub facebook_account: Account<'info, FacebookAccount>,
}

#[derive(Accounts)]
pub struct Close<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    // we will use `close` for closing user's facebook account.
    #[account(
        mut,
        seeds = ["self-custodial-facebook2".as_bytes(), signer.key().as_ref()], 
        bump = facebook_account.bump,
        close=signer
    )]
    pub facebook_account: Account<'info, FacebookAccount>,
}

#[account]
pub struct FacebookAccount {
    pub authority: Pubkey, // Authority of this account
    pub bump: u8,
    pub name: String, // Max 10 Chars
    pub status: String, // Max 100 Chars
    pub twitter: String // Max 10 Chars
}

impl FacebookAccount {
    const LEN: usize = 
        8 + // discriminator
        32 + // Pubkey
        1 + // bump
        (4 + 10) + // 10 chars of Name
        (4 + 100) + // 100 chars of Status  
        (4 + 10); // 10 chars' twitter
}
