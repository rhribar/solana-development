use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
// Result<()>

#[program]
pub mod mycalculatordapp {
    use super::*;
    pub fn create(ctx: Context<Create>, init_message: String) -> Result<()>  {
        let calculator = &mut ctx.accounts.calculator; // defining an account into which we store variables, &mut set the var to be mutable
        calculator.greeting = init_message;
        // you let Solana know that the function has been run successfully
        Ok(())
    }

    pub fn add(ctx: Context<Addition>, num1: i64, num2: i64) -> Result<()> { // ctx a list of accounts that need to be passed to fun in order to run
        let calculator = &mut ctx.accounts.calculator; // retrieving the calculator
        calculator.result = num1 + num2;
        Ok(())
    }

    pub fn multi(ctx: Context<Multi>, num1: i64, num2: i64) -> Result<()> {
        let calculator = &mut ctx.accounts.calculator;
        calculator.result = num1 * num2;
        Ok(())
    }

    pub fn substract(ctx: Context<Substract>, num1: i64, num2: i64) -> Result<()> {
        let calculator = &mut ctx.accounts.calculator;
        calculator.result = num1 - num2;
        Ok(())
    }

    pub fn divide(ctx: Context<Divide>, num1: i64, num2: i64) -> Result<()> {
        let calculator = &mut ctx.accounts.calculator;
        calculator.result = num1 / num2;
        calculator.remainder = num1 % num2;
        
        Ok(())
    }
    
}

#[derive(Accounts)] // this is a derive accounts macro, deriving from accounts
pub struct Create<'info> {
    #[account(init, payer=user, space=264)]
    // init ... creates a new calculator, we need this line because we are actually creating a new account in our function
    // payer=user ... money required to create this account will be paid by the user
    // space=264 ... number of space to be allocated on the solana blockchain for this calculator count, can be changed, 264 is optimal
    pub calculator: Account<'info, Calculator>, 
    #[account(mut)] // makes user account mutable
    pub user: Signer<'info>, // user who is calling the function, as a signer => they need to sign the contract for the transaction
    pub system_program: Program<'info, System> // system specification for the Solana blockchain
}

#[derive(Accounts)] 
pub struct Addition<'info> {
    #[account(mut)] // set account to mutable, we will modify the calculator in fn add
    pub calculator: Account<'info, Calculator>
}

#[derive(Accounts)] 
pub struct Multi<'info> {
    #[account(mut)]
    pub calculator: Account<'info, Calculator>
}

#[derive(Accounts)] 
pub struct Substract<'info> {
    #[account(mut)]
    pub calculator: Account<'info, Calculator>
}

#[derive(Accounts)] 
pub struct Divide<'info> {
    #[account(mut)]
    pub calculator: Account<'info, Calculator>
}

#[account]
pub struct Calculator { // identifying the fields of our calculator, interface
    pub greeting: String,
    pub result: i64,
    pub remainder: i64
}