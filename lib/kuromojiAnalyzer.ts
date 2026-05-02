/**
 * 日本語テキストからキーワードを抽出する
 * kuromoji.jsはNode.jsのfsモジュールに依存するため、
 * Next.js static exportでは使用できない。
 * 代わりに正規表現ベースでカタカナ語・漢字複合語・固有名詞を抽出する。
 */

/** カタカナ語を抽出（2文字以上） */
function extractKatakana(text: string): string[] {
  const matches = text.match(/[ァ-ヴー]{2,}/g)
  return matches ?? []
}

/** 漢字複合語を抽出（2文字以上） */
function extractKanji(text: string): string[] {
  const matches = text.match(/[一-龥々]{2,}/g)
  return matches ?? []
}

/** 漢字+カタカナの混合語を抽出 */
function extractMixed(text: string): string[] {
  const matches = text.match(/[一-龥々ァ-ヴー]{3,}/g)
  return matches ?? []
}

/** アルファベット略語を抽出（2文字以上の大文字） */
function extractAcronyms(text: string): string[] {
  const matches = text.match(/[A-Z]{2,}/g)
  return matches ?? []
}

/** テキスト全体からキーワード候補を抽出する */
export async function extractNouns(text: string): Promise<string[]> {
  const results: string[] = []

  results.push(...extractKatakana(text))
  results.push(...extractKanji(text))
  results.push(...extractAcronyms(text))

  return results
}

/** テキスト全体から複合名詞も含めて抽出 */
export async function extractCompoundNouns(text: string): Promise<string[]> {
  const results: string[] = []

  results.push(...extractKatakana(text))
  results.push(...extractKanji(text))
  results.push(...extractMixed(text))
  results.push(...extractAcronyms(text))

  // 重複を除去
  return Array.from(new Set(results))
}
