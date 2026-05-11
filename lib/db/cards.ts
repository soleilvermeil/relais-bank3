import { dbGet } from "./client";

export type CardType = "debit" | "credit";

export type CardRow = {
  id: number;
  user_id: number;
  account_id: number;
  card_type: CardType;
  brand: string;
  pan: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
  holder_first_name: string;
  holder_last_name: string;
};

export type Card = {
  id: number;
  accountId: number;
  cardType: CardType;
  brand: string;
  pan: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  holderFirstName: string;
  holderLastName: string;
};

function rowToCard(row: CardRow): Card {
  return {
    id: row.id,
    accountId: row.account_id,
    cardType: row.card_type,
    brand: row.brand,
    pan: row.pan,
    expiryMonth: row.expiry_month,
    expiryYear: row.expiry_year,
    cvv: row.cvv,
    holderFirstName: row.holder_first_name,
    holderLastName: row.holder_last_name,
  };
}

export async function getCardForAccount(
  userId: number,
  accountId: number,
): Promise<Card | null> {
  const row = await dbGet<CardRow>(
    `SELECT id, user_id, account_id, card_type, brand, pan,
            expiry_month, expiry_year, cvv, holder_first_name, holder_last_name
     FROM cards
     WHERE user_id = @userId AND account_id = @accountId
     ORDER BY id ASC
     LIMIT 1`,
    { userId, accountId },
  );
  return row ? rowToCard(row) : null;
}
