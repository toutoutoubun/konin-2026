/**
 * 歴史過去問の出題形式を検出する
 * 「次の〜のうちから一つ選べ」の前後のパターンで形式を判定
 */

export type FormatTag =
  | '空欄補充'
  | '正誤判定'
  | '年代順並び替え'
  | '資料読解（一次資料）'
  | '資料読解（グラフ・統計）'
  | '資料読解（写真・図版）'
  | '資料読解（地図）'
  | '会話文読解'
  | '探究活動型'

export function detectFormatTags(questionText: string): FormatTag[] {
  const tags: FormatTag[] = []

  if (/に当てはまる語句|空欄|(\s|　)*に入れる|穴埋め|当てはまるもの/.test(questionText)) {
    tags.push('空欄補充')
  }
  if (/正誤の組合せ|正しいもの|誤っているもの|適当でないもの|正誤|正しい組合せ|適切なもの/.test(questionText)) {
    tags.push('正誤判定')
  }
  if (/年代の古い順|年代順|古い順に並べ|並べ替え|時代順/.test(questionText)) {
    tags.push('年代順並び替え')
  }
  if (/資料\s*\d+|意訳してある|次の資料|資料を読|一次資料|史料/.test(questionText)) {
    tags.push('資料読解（一次資料）')
  }
  if (/グラフ|統計|推移|表\s*\d+|数値|割合|増減/.test(questionText)) {
    tags.push('資料読解（グラフ・統計）')
  }
  if (/写真|図版|絵|画像|肖像/.test(questionText)) {
    tags.push('資料読解（写真・図版）')
  }
  if (/地図|位置|地域.*示/.test(questionText)) {
    tags.push('資料読解（地図）')
  }
  if (/会話文|会話|対話|話し合/.test(questionText)) {
    tags.push('会話文読解')
  }
  if (/レポート|まとめ|探究|調べ学習|発表|プレゼン/.test(questionText)) {
    tags.push('探究活動型')
  }

  return tags
}

/** テキスト全体から全出題形式の出現回数を集計 */
export function countAllFormats(text: string): Record<FormatTag, number> {
  const counts: Record<string, number> = {}
  const allTags: FormatTag[] = [
    '空欄補充', '正誤判定', '年代順並び替え',
    '資料読解（一次資料）', '資料読解（グラフ・統計）',
    '資料読解（写真・図版）', '資料読解（地図）',
    '会話文読解', '探究活動型'
  ]
  for (const tag of allTags) {
    counts[tag] = 0
  }

  const detected = detectFormatTags(text)
  for (const tag of detected) {
    counts[tag] = (counts[tag] ?? 0) + 1
  }

  return counts as Record<FormatTag, number>
}
