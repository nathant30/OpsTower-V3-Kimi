// Bond contract definitions

export const BOND_CONSTANTS = {
  MIN_BOND_AMOUNT: 5000, // ₱5,000 for 2W
  MIN_BOND_AMOUNT_4W: 10000, // ₱10,000 for 4W
  MAX_WITHDRAWAL_PER_DAY: 2000, // ₱2,000 max withdrawal per day
  DEDUCTIBLE_AMOUNT_ACCIDENT: 1000, // ₱1,000 deductible for accidents
  DEDUCTIBLE_AMOUNT_NOSHOW: 500, // ₱500 for no-show
};

export interface BondDeductionRequest {
  driverId: string;
  amount: number;
  reason: string;
  referenceId?: string;
  referenceType?: string;
}

export interface BondDepositRequest {
  driverId: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
}

export const bondContract = {
  constants: BOND_CONSTANTS,
  
  validateDeduction: (balance: number, amount: number): boolean => {
    return balance >= amount;
  },
  
  validateWithdrawal: (amount: number, dailyTotal: number): boolean => {
    return amount <= BOND_CONSTANTS.MAX_WITHDRAWAL_PER_DAY && 
           (dailyTotal + amount) <= BOND_CONSTANTS.MAX_WITHDRAWAL_PER_DAY;
  }
};
