export enum UserRole {
  ARTIST = 'ARTIST',
  VIEWER = 'VIEWER'
}

export enum ArtworkStatus {
  NOT_FOR_SALE = 'NOT_FOR_SALE',
  FIXED_PRICE = 'FIXED_PRICE',
  SOLD = 'SOLD'
}

export enum TransactionType {
  ONE_TIME_PURCHASE = 'ONE_TIME_PURCHASE',
  PAY_TO_VIEW = 'PAY_TO_VIEW'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export const Categories = ['Digital Art', 'Oil Paintings', 'Photography', 'Sculptures', 'Watercolor', 'Mixed Media']
