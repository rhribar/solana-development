use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("9Hz4Py3AZGNAf4njVWDzX62puZxceLb81nXsvqyvm7jD");

#[program]
pub mod gifportal {
    use super::*;

    pub fn start_stuff_off(ctx: Context<StartStuffOff>) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account; // &mut it is muttable
        base_account.total_gifs = 0;
        Ok(())
    }

    pub fn add_gif(ctx: Context<AddGif>, gif_link: String) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        let user = &mut ctx.accounts.user; // now we have user account in our context, by adding this

        let item = ItemStruct {
            gif_link: gif_link.to_string(),
            user_address: *user.to_account_info().key
        };

        base_account.gif_list.push(item);
        base_account.total_gifs += 1;
        Ok(())
    }
}

#[derive(Accounts)] // like class inheritance in js
pub struct StartStuffOff<'info> {
    #[account(init, payer=user, space=9000)] // init = new account for the payer program, payer will be the user, 9000 bytes of space for our account
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct AddGif<'info> {
    #[account(mut)] // because we need to change the amount of gifs, we do not to call init, because we are modifying existing program
    pub base_account: Account<'info, BaseAccount>, // we need the account info
    #[account(mut)]
    pub user: Signer<'info> // we need the user
}

// base account interface
#[account]
pub struct BaseAccount { // like an interface
    pub total_gifs: u64, 
    pub gif_list: Vec<ItemStruct>
}

// interface for gif list
#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ItemStruct {
    pub gif_link: String,
    pub user_address: Pubkey
}

