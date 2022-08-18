use anchor_lang::prelude::*;

declare_id!("GqkqySXmzJURYZrzQjtVUAwbSdT73pPJ9Gj3Lq3bccFe");

#[program]
pub mod blog {
    use super::*;

    pub fn create_post(ctx: Context<Create>, seeds_to_use: [u8; 8]) -> Result<()> {
        Ok(())
    }

    pub fn update_post(
        ctx: Context<Update>, 
        title: [u8; 32],
        description: [u8; 64],
        content: [u8; 512],
    ) -> Result<()> {
        let mut account = ctx.accounts.account_data.load_mut()?;
        account.title = title;
        account.description = description;
        account.content = content;
        Ok(())
    }

    pub fn delete_post(ctx: Context<Delete>) -> Result<()> {
        let mut account = ctx.accounts.account_data.load_mut()?;
        account.title = [0u8; 32];
        account.description = [0u8; 64];
        account.content = [0u8; 512];
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(seeds_to_use: [u8; 8])]
pub struct Create<'info> {
    #[account(init, payer=payer, space=8 + 32 + 64 + 512, seeds=[&seeds_to_use], bump)]
    pub account_data: AccountLoader<'info, Post>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub account_data: AccountLoader<'info, Post>,
    #[account(mut)]
    pub payer: Signer<'info>,
}

#[derive(Accounts)]
pub struct Delete<'info> {
    #[account(mut)]
    pub account_data: AccountLoader<'info, Post>,
    #[account(mut)]
    pub payer: Signer<'info>,
}

#[account(zero_copy)] // very scarce with the data
pub struct Post {
    pub title: [u8; 32],
    pub description: [u8; 64],
    pub content: [u8; 512], // 512 chars
}
