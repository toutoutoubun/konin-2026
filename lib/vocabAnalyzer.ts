import winkNLP from 'wink-nlp'
import model from 'wink-eng-lite-web-model'
import cefrData from '@/data/cefrVocab.json'

const nlp = winkNLP(model)
const its = nlp.its

/* ---------- CEFR lookup sets ---------- */
const cefrSets: Record<string, Set<string>> = {
  A1: new Set(cefrData.A1),
  A2: new Set(cefrData.A2),
  B1: new Set(cefrData.B1),
  B2: new Set(cefrData.B2)
}
const functionWordSet = new Set(cefrData.functionWords)

/* ---------- POS mapping ---------- */
type PosLabel = 'noun' | 'verb' | 'adjective' | 'adverb'
const posMap: Record<string, PosLabel> = {
  NOUN: 'noun',
  PROPN: 'noun',
  VERB: 'verb',
  ADJ: 'adjective',
  ADV: 'adverb'
}
const contentPosTags = new Set(['NOUN', 'PROPN', 'VERB', 'ADJ', 'ADV'])

export const posLabelJa: Record<PosLabel, string> = {
  noun: '名詞',
  verb: '動詞',
  adjective: '形容詞',
  adverb: '副詞'
}

/* ---------- Types ---------- */
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'unknown'

export type VocabItem = {
  word: string
  pos: PosLabel
  cefrLevel: CefrLevel
  count: number
}

export type CefrDistributionRow = {
  level: CefrLevel
  count: number
  rate: number
}

export type GrammarVocabCrossCell = {
  grammar: string
  cefrLevel: CefrLevel
  count: number
}

export type VocabAnalysisResult = {
  vocabItems: VocabItem[]
  cefrDistribution: CefrDistributionRow[]
  grammarVocabCross: GrammarVocabCrossCell[]
  totalContentWords: number
}

/* ---------- Helpers ---------- */
function getCefrLevel(word: string): CefrLevel {
  const lower = word.toLowerCase()
  if (cefrSets.A1.has(lower)) return 'A1'
  if (cefrSets.A2.has(lower)) return 'A2'
  if (cefrSets.B1.has(lower)) return 'B1'
  if (cefrSets.B2.has(lower)) return 'B2'
  return 'unknown'
}

function isFunctionWord(word: string): boolean {
  return functionWordSet.has(word.toLowerCase())
}

/* ---------- Grammar detection (mirrors textAnalyzer logic) ---------- */
function detectGrammarTags(sentence: string): string[] {
  const lower = sentence.toLowerCase()
  const tags: string[] = []
  if (/\b(will|be going to)\b/.test(lower)) tags.push('未来')
  if (/\b(has|have)\s+\w+(ed|en)\b/.test(lower)) tags.push('現在完了')
  if (/\bhad\s+\w+(ed|en)\b/.test(lower)) tags.push('過去完了')
  if (/\b(was|were|is|are|be|been)\s+\w+(ed|en)\b/.test(lower)) tags.push('受動')
  if (/\bif\b.*\b(would|could|were|had)\b/.test(lower)) tags.push('仮定法')
  if (/\b(who|which|that|whom|whose)\b/.test(lower)) tags.push('関係代名詞')
  if (/\b(where|when|why)\b/.test(lower)) tags.push('関係副詞')
  if (/\bto\s+[a-z]+\b/.test(lower)) tags.push('不定詞')
  if (/\b[a-z]+ing\b/.test(lower)) tags.push('動名詞')
  if (/\b[a-z]+(ing|ed)\b/.test(lower)) tags.push('分詞')
  if (/\bas\s+\w+\s+as\b/.test(lower)) tags.push('原級')
  if (/\b\w+er\s+than\b|\bmore\s+\w+\s+than\b/.test(lower)) tags.push('比較級')
  if (/\b(the\s+\w+est|the\s+most\s+\w+)\b/.test(lower)) tags.push('最上級')
  if (/\b(and|but|or|because|although|when|while|if|so|since)\b/.test(lower)) tags.push('接続詞')
  if (/\b(in|on|at|by|for|with|from|to|into|over|under|between|among|during|before|after)\b/.test(lower)) tags.push('前置詞')
  return tags
}

/* ---------- Main analysis ---------- */
export function analyzeVocabulary(text: string): VocabAnalysisResult {
  const doc = nlp.readDoc(text || '')

  /* --- Step 1: Extract content words with POS --- */
  const wordCounts = new Map<string, { pos: PosLabel; count: number }>()

  doc.tokens().each((token: any) => {
    const type = token.out(its.type) as string
    if (type !== 'word') return

    const pos = token.out(its.pos) as string
    if (!contentPosTags.has(pos)) return

    const normal = (token.out(its.normal) as string).toLowerCase()
    if (normal.length < 2) return
    if (isFunctionWord(normal)) return

    const posLabel = posMap[pos] ?? 'noun'
    const existing = wordCounts.get(normal)
    if (existing) {
      existing.count += 1
    } else {
      wordCounts.set(normal, { pos: posLabel, count: 1 })
    }
  })

  /* --- Step 2: Assign CEFR levels --- */
  const vocabItems: VocabItem[] = Array.from(wordCounts.entries())
    .map(([word, data]) => ({
      word,
      pos: data.pos,
      cefrLevel: getCefrLevel(word),
      count: data.count
    }))
    .sort((a, b) => b.count - a.count)

  const totalContentWords = vocabItems.reduce((sum, item) => sum + item.count, 0)

  /* --- Step 3: CEFR distribution --- */
  const levelCounts: Record<CefrLevel, number> = { A1: 0, A2: 0, B1: 0, B2: 0, unknown: 0 }
  vocabItems.forEach((item) => {
    levelCounts[item.cefrLevel] += item.count
  })

  const cefrDistribution: CefrDistributionRow[] = (['A1', 'A2', 'B1', 'B2', 'unknown'] as CefrLevel[]).map((level) => ({
    level,
    count: levelCounts[level],
    rate: totalContentWords > 0 ? Math.round((levelCounts[level] / totalContentWords) * 1000) / 10 : 0
  }))

  /* --- Step 4: Grammar × CEFR cross tabulation --- */
  const crossMap = new Map<string, number>()
  const sentences = doc.sentences().out() as string[]

  sentences.forEach((sentence) => {
    const grammarTags = detectGrammarTags(sentence)
    if (!grammarTags.length) return

    // Extract content words from this sentence to get their CEFR levels
    const sentenceDoc = nlp.readDoc(sentence)
    const sentenceLevels = new Set<CefrLevel>()

    sentenceDoc.tokens().each((token: any) => {
      const type = token.out(its.type) as string
      if (type !== 'word') return
      const pos = token.out(its.pos) as string
      if (!contentPosTags.has(pos)) return
      const normal = (token.out(its.normal) as string).toLowerCase()
      if (normal.length < 2 || isFunctionWord(normal)) return
      sentenceLevels.add(getCefrLevel(normal))
    })

    // Cross: each grammar tag × each CEFR level in the sentence
    grammarTags.forEach((grammar) => {
      sentenceLevels.forEach((level) => {
        const key = `${grammar}|${level}`
        crossMap.set(key, (crossMap.get(key) ?? 0) + 1)
      })
    })
  })

  const grammarVocabCross: GrammarVocabCrossCell[] = Array.from(crossMap.entries()).map(([key, count]) => {
    const [grammar, cefrLevel] = key.split('|')
    return { grammar, cefrLevel: cefrLevel as CefrLevel, count }
  })

  return {
    vocabItems,
    cefrDistribution,
    grammarVocabCross,
    totalContentWords
  }
}
