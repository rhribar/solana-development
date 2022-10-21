use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

// declare_id!("EA1TvB22QjPZEtUdr7nz3cfv7YPUpgk4jmjQxmg2bKd4");
declare_id!("Gfav6SNgJ3fMr35MH1kKux9v2WdGiMtWt1k2LuaAyWpY");

#[program]
pub mod crowdfunding {
    use super::*;

    pub fn create(ctx: Context<Create>, name: String, description: String) -> ProgramResult {
        let campaign = &mut ctx.accounts.campaign;
        campaign.name = name;
        campaign.description = description;
        campaign.amount_donated = 0; // campaign at start raised 0
        campaign.admin = *ctx.accounts.user.key;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> ProgramResult {
        let campaign = &mut ctx.accounts.campaign;
        let user = &mut ctx.accounts.user;
        if campaign.admin != *user.key { // the withdraw id needs to be the adming of the campaign
            return Err(ProgramError::IncorrectProgramId);
        }
        msg!("withdrawn on the chain");
        let rent_balance = Rent::get()?.minimum_balance(campaign.to_account_info().data_len());
        if **campaign.to_account_info().lamports.borrow() - rent_balance < amount { // if number of lamports in the account is less than the required amount (without the rent)
            return Err(ProgramError::InsufficientFunds);
        }
        **campaign.to_account_info().try_borrow_mut_lamports()? -= amount;
        **user.to_account_info().try_borrow_mut_lamports()? += amount;
        Ok(())
    }

    pub fn donate(ctx: Context<Donate>, amount: u64) -> ProgramResult {
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.campaign.key(),
            amount
        );
        msg!("donated on the chain");
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.campaign.to_account_info()
            ]
        );
        (&mut ctx.accounts.campaign).amount_donated += amount;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Create<'info> {
    #[account(init, payer=user, space=9000, seeds=[b"CAMPAIGN_DEMO".as_ref(), user.key().as_ref()], bump)] // creating a new campaign account
    pub campaign: Account<'info, Campaign>,
    #[account(mut)] // user account is mutable
    pub user: Signer<'info>, // user is the signer
    pub system_program: Program<'info, System>, // the system program, system specs of Sol blockchain
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub user: Signer<'info>
}

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>, // the system program, system specs of Sol blockchain
}

#[account]
pub struct Campaign {
    pub admin: Pubkey,
    pub name: String,
    pub description: String,
    pub amount_donated: u64,
}
