use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, MintTo, SetAuthority, Transfer};
// use crate::instruction::ProxySetAuthority;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod mymoneydapp {
    use super::*;

    pub fn proxy_transfer(ctx: Context<ProxyTransfer>, amount: u64) -> Result<()> {
        token::transfer(ctx.accounts.into(), amount)
    }

    pub fn proxy_mint_to(ctx: Context<ProxyMintTo>, amount: u64) -> Result<()> {
        token::mint_to(ctx.accounts.into(), amount)
    }

    pub fn proxy_burn(ctx: Context<ProxyBurn>, amount: u64) -> Result<()> {
        token::burn(ctx.accounts.into(), amount)
    }

    pub fn proxy_set_authority(
        ctx: Context<ProxySetAuthority>, 
        authority_type: AuthorityType, 
        new_authority: Option<Pubkey>
    ) -> Result<()> {
        token::set_authority(ctx.accounts.into(), authority_type.into(), new_authority)
    }
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum AuthorityType {
    MintTokens,
    FreezeAccount,
    AccountOwner,
    CloseAccount
}

#[derive(Accounts)] // converting struct to account with the accounts macro
pub struct ProxyTransfer<'info> {
    /// CHECK: not unsafe
    #[account(signer)]
    pub authority: AccountInfo<'info>,
    /// CHECK: not unsafe
    #[account(mut)] // makes the underyling account mutable
    pub from: AccountInfo<'info>,
    /// CHECK: not unsafe
    #[account(mut)]
    pub to: AccountInfo<'info>,
    /// CHECK: not unsafe
    pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)] // this is an account of your token
pub struct ProxyMintTo<'info> {
    /// CHECK: not unsafe
    #[account(signer)]
    pub authority: AccountInfo<'info>,
    /// CHECK: not unsafe
    #[account(mut)] // makes the underyling account mutable
    pub mint: AccountInfo<'info>,
    /// CHECK: not unsafe
    #[account(mut)]
    pub to: AccountInfo<'info>,
    /// CHECK: not unsafe
    pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)] // this mint account gets disabled
pub struct ProxyBurn<'info> {
    /// CHECK: not unsafe
    #[account(signer)]
    pub authority: AccountInfo<'info>,
    /// CHECK: not unsafe
    #[account(mut)] // makes the underyling account mutable
    pub mint: AccountInfo<'info>,
    /// CHECK: not unsafe
    #[account(mut)]
    pub from: AccountInfo<'info>,
    /// CHECK: not unsafe
    pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)] // this mint account gets disabled
pub struct ProxySetAuthority<'info> {
    /// CHECK: not unsafe
    #[account(signer)]
    pub current_authority: AccountInfo<'info>,
    /// CHECK: not unsafe
    #[account(mut)]
    pub account_or_mint: AccountInfo<'info>, // if the new authority is going to be a new account or a mint
    /// CHECK: not unsafe
    pub token_program: AccountInfo<'info>, // token prog to identify the correct program call
}

impl <'a, 'b, 'c, 'info> From<&mut ProxyTransfer<'info>> // implementing from trait so we can transform types into required CpiContexts and CpiAccounts to perform CPI
    for CpiContext<'a, 'b, 'c, 'info, Transfer<'info>>
{
    fn from(accounts: &mut ProxyTransfer<'info>) -> CpiContext<'a, 'b, 'c, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer { // a list of CPI accounts
            from: accounts.from.clone(),
            to: accounts.to.clone(),
            authority: accounts.authority.clone(),
        };
        let cpi_program = accounts.token_program.clone(); // program which we want to call
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

impl<'a, 'b, 'c, 'info> From<&mut ProxyMintTo<'info>>
    for CpiContext<'a, 'b, 'c, 'info, MintTo<'info>>
{
    fn from(accounts: &mut ProxyMintTo<'info>) -> CpiContext<'a, 'b, 'c, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo { // a list of CPI accounts
            mint: accounts.mint.clone(),
            to: accounts.to.clone(),
            authority: accounts.authority.clone(),
        };
        let cpi_program = accounts.token_program.clone(); // program which we want to call
        CpiContext::new(cpi_program, cpi_accounts)
    }

}

impl<'a, 'b, 'c, 'info> From<&mut ProxyBurn<'info>> 
    for CpiContext<'a, 'b, 'c, 'info, Burn<'info>> 
{
    fn from(accounts: &mut ProxyBurn<'info>) -> CpiContext<'a, 'b, 'c, 'info, Burn<'info>> {
        let cpi_accounts = Burn { // a list of CPI accounts
            mint: accounts.mint.clone(),
            from: accounts.from.clone(),
            authority: accounts.authority.clone(),
        };
        let cpi_program = accounts.token_program.clone(); // program which we want to call
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

impl<'a, 'b, 'c, 'info> From<&mut ProxySetAuthority<'info>>
    for CpiContext<'a, 'b, 'c, 'info, SetAuthority<'info>>
{
    fn from(accounts: &mut ProxySetAuthority<'info>) -> CpiContext<'a, 'b, 'c, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority { // a list of CPI accounts
            account_or_mint: accounts.account_or_mint.clone(),
            current_authority: accounts.current_authority.clone(),
        };
        let cpi_program = accounts.token_program.clone(); // program which we want to call
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

impl From<AuthorityType> for spl_token::instruction::AuthorityType {
    fn from(authority_ty: AuthorityType) -> spl_token::instruction::AuthorityType {
        match authority_ty {
            AuthorityType::MintTokens => spl_token::instruction::AuthorityType::MintTokens,
            AuthorityType::FreezeAccount => spl_token::instruction::AuthorityType::FreezeAccount,
            AuthorityType::AccountOwner => spl_token::instruction::AuthorityType::AccountOwner,
            AuthorityType::CloseAccount => spl_token::instruction::AuthorityType::CloseAccount,
        }
    }
}