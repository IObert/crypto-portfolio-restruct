
const map = {
    "LDEUR": "EUR"
}

export default function SymbolMapper(symbol: string): string {
    //@ts-ignore
    return map[symbol] || symbol;
} 