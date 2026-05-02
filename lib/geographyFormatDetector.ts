/**
 * 地理過去問の出題形式を検出する
 * format_tag検出ロジック
 */

export type GeoFormatTag =
  | '地図読解（地形図）'
  | '地図読解（主題図・階級区分図）'
  | '地図読解（正距方位図法・メルカトル図法）'
  | 'グラフ読解（人口・GDP・食料・エネルギー）'
  | '表の読み取り（国別・地域別統計）'
  | '会話文型'
  | 'レポート型'
  | '地域調査型'
  | '防災判断型（ハザードマップ・避難経路）'
  | '空欄補充'
  | '正誤判定'
  | '写真・景観読解'

export function detectGeoFormatTags(questionText: string): GeoFormatTag[] {
  const tags: GeoFormatTag[] = []

  if (/地形図|等高線|2万5千分の1|25000分の1|5万分の1/.test(questionText)) {
    tags.push('地図読解（地形図）')
  }
  if (/主題図|階級区分図|コロプレス|段階区分|ドットマップ|カルトグラム|分布図/.test(questionText)) {
    tags.push('地図読解（主題図・階級区分図）')
  }
  if (/正距方位図法|メルカトル図法|図法|モルワイデ|正積|正角/.test(questionText)) {
    tags.push('地図読解（正距方位図法・メルカトル図法）')
  }
  if (/グラフ|折れ線|棒グラフ|推移|円グラフ|帯グラフ|割合.*変化/.test(questionText)) {
    tags.push('グラフ読解（人口・GDP・食料・エネルギー）')
  }
  if (/表\s*\d|統計|輸出入|人口構成|国別|地域別|上位.*国|ランキング/.test(questionText)) {
    tags.push('表の読み取り（国別・地域別統計）')
  }
  if (/会話文|会話|対話|話し合/.test(questionText)) {
    tags.push('会話文型')
  }
  if (/レポート|報告書|まとめ/.test(questionText)) {
    tags.push('レポート型')
  }
  if (/地域調査|フィールドワーク|聞き取り調査|現地調査|ルートマップ/.test(questionText)) {
    tags.push('地域調査型')
  }
  if (/ハザードマップ|避難|災害リスク|防災マップ|浸水想定|避難経路/.test(questionText)) {
    tags.push('防災判断型（ハザードマップ・避難経路）')
  }
  if (/に当てはまる語句|空欄|に入れる|穴埋め|当てはまるもの/.test(questionText)) {
    tags.push('空欄補充')
  }
  if (/正誤の組合せ|適切でないもの|正しいもの|誤っているもの|適当でないもの|正誤|適切なもの/.test(questionText)) {
    tags.push('正誤判定')
  }
  if (/写真|景観|風景|外観|街並み/.test(questionText)) {
    tags.push('写真・景観読解')
  }

  return tags
}

/** テキスト全体から全出題形式の出現回数を集計 */
export function countAllGeoFormats(text: string): Record<GeoFormatTag, number> {
  const counts: Record<string, number> = {}
  const allTags: GeoFormatTag[] = [
    '地図読解（地形図）',
    '地図読解（主題図・階級区分図）',
    '地図読解（正距方位図法・メルカトル図法）',
    'グラフ読解（人口・GDP・食料・エネルギー）',
    '表の読み取り（国別・地域別統計）',
    '会話文型',
    'レポート型',
    '地域調査型',
    '防災判断型（ハザードマップ・避難経路）',
    '空欄補充',
    '正誤判定',
    '写真・景観読解'
  ]
  for (const tag of allTags) {
    counts[tag] = 0
  }

  const detected = detectGeoFormatTags(text)
  for (const tag of detected) {
    counts[tag] = (counts[tag] ?? 0) + 1
  }

  return counts as Record<GeoFormatTag, number>
}
