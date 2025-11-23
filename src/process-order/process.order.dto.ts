export type OrderSide = "buy" | "sell";

export interface ProcessOrderDto {
  baseToken: string;
  quoteToken: string;
  amount: number;
  side: OrderSide;
}
