
const map = {
  LDEUR: "EUR",
  LDBNB: "BNB",
};

export default function SymbolMapper(symbol: string): string {
    // @ts-ignore
  return map[symbol] || symbol;
}
