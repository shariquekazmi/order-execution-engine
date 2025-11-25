const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export type Dex = "raydium" | "meteora";

export interface Quote {
  dex: Dex;
  price: number;
  fee: number;
}

export interface ExecuteResult {
  dex: Dex;
  txHash: string;
  executedPrice: number;
}

export class MockDexRouter {
  private basePrice = 10; // just some anchor price

  async getRaydiumQuote(
    tokenIn: string,
    tokenOut: string,
    amount: number
  ): Promise<Quote> {
    await sleep(200);
    const price = this.basePrice * (0.98 + Math.random() * 0.04); // 98%–102%
    return { dex: "raydium", price, fee: 0.003 };
  }

  async getMeteoraQuote(
    tokenIn: string,
    tokenOut: string,
    amount: number
  ): Promise<Quote> {
    await sleep(200);
    const price = this.basePrice * (0.97 + Math.random() * 0.05); // 97%–102%
    return { dex: "meteora", price, fee: 0.002 };
  }

  async routeBest(
    tokenIn: string,
    tokenOut: string,
    amount: number
  ): Promise<Quote> {
    const [ray, met] = await Promise.all([
      this.getRaydiumQuote(tokenIn, tokenOut, amount),
      this.getMeteoraQuote(tokenIn, tokenOut, amount),
    ]);

    // For a market BUY, lower price is better
    return ray.price <= met.price ? ray : met;
  }

  async executeSwap(bestQuote: Quote): Promise<ExecuteResult> {
    await sleep(2000 + Math.random() * 1000); // 2–3s

    const executedPrice = bestQuote.price * (0.99 + Math.random() * 0.02); // tiny slippage
    const txHash = "0x" + Math.random().toString(16).slice(2).padEnd(64, "0");

    return {
      dex: bestQuote.dex,
      txHash,
      executedPrice,
    };
  }
}
