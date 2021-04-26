
export default function SymbolMapper(symbol: string, assets: Set<string>): string {
  const regex = /LD(.*)/;
  if (assets.has(symbol)) {
    return symbol;
  }  if (regex.exec(symbol)) {
    // @ts-ignore
    const withouthPrefix = regex.exec(symbol)[1];
    if (assets.has(withouthPrefix)) {
      return withouthPrefix;
    }
  }

  throw new Error(`Unknow asset: ${symbol}`);
}
