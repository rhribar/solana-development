use anchor_lang::prelude::*;
use borsh::{BorshSerialize, BorshDeserialize};
use anchor_lang::solana_program::{
    program_pack::{IsInitialized, Sealed},
};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct MovieAccountState {
    pub is_initialized: bool,
    pub rating: u8,
    pub description: String,
    pub title: String
}

impl Sealed for MovieAccountState {}

impl IsInitialized for MovieAccountState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
