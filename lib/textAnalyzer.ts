import winkNLP from 'wink-nlp'
import model from 'wink-eng-lite-web-model'
import type { GrammarTag, VocabularyLevel } from './tagMapper'

const nlp = winkNLP(model)
const its = nlp.its

const A1 = new Set(['be', 'have', 'do', 'go', 'get', 'make', 'take', 'see', 'come', 'know', 'good', 'new', 'first', 'last', 'day', 'time', 'people', 'school', 'work', 'like', 'want', 'need', 'can', 'will'])
const A2 = new Set(['because', 'before', 'after', 'during', 'without', 'important', 'different', 'example', 'question', 'answer', 'travel', 'health', 'music', 'family', 'country', 'information'])
const B1 = new Set(['although', 'however', 'therefore', 'environment', 'experience', 'community', 'education', 'develop', 'provide', 'increase', 'compare', 'relationship', 'opportunity'])

function pushTag(map: Map<string, { count: number; examples: Set<string> }>, name: string, example: string) {
  const item = map.get(name) ?? { count: 0, examples: new Set<string>() }
  item.count += 1
  if (example) item.examples.add(example.slice(0, 90))
  map.set(name, item)
}

export function analyzeEnglishText(text: string): { grammarTags: GrammarTag[]; vocabularyLevels: VocabularyLevel[] } {
  const doc = nlp.readDoc(text || '')
  const sentences = doc.sentences().out() as string[]
  const tokenValues = doc.tokens().filter((token: any) => token.out(its.type) === 'word').out(its.normal) as string[]
  const grammarMap = new Map<string, { count: number; examples: Set<string> }>()

  sentences.forEach((sentence) => {
    const lower = sentence.toLowerCase()
    if (/\b(will|be going to)\b/.test(lower)) pushTag(grammarMap, '未来', sentence)
    if (/\b(has|have)\s+\w+(ed|en)\b/.test(lower)) pushTag(grammarMap, '現在完了', sentence)
    if (/\bhad\s+\w+(ed|en)\b/.test(lower)) pushTag(grammarMap, '過去完了', sentence)
    if (/\b(was|were|is|are|be|been)\s+\w+(ed|en)\b/.test(lower)) pushTag(grammarMap, '受動', sentence)
    if (/\bif\b.*\b(would|could|were|had)\b/.test(lower)) pushTag(grammarMap, '仮定法', sentence)
    if (/\b(who|which|that|whom|whose)\b/.test(lower)) pushTag(grammarMap, '関係代名詞', sentence)
    if (/\b(where|when|why)\b/.test(lower)) pushTag(grammarMap, '関係副詞', sentence)
    if (/\bto\s+[a-z]+\b/.test(lower)) pushTag(grammarMap, '不定詞', sentence)
    if (/\b[a-z]+ing\b/.test(lower)) pushTag(grammarMap, '動名詞', sentence)
    if (/\b[a-z]+(ing|ed)\b/.test(lower)) pushTag(grammarMap, '分詞', sentence)
    if (/\bas\s+\w+\s+as\b/.test(lower)) pushTag(grammarMap, '原級', sentence)
    if (/\b\w+er\s+than\b|\bmore\s+\w+\s+than\b/.test(lower)) pushTag(grammarMap, '比較級', sentence)
    if (/\b(the\s+\w+est|the\s+most\s+\w+)\b/.test(lower)) pushTag(grammarMap, '最上級', sentence)
    if (/\b(and|but|or|because|although|when|while|if|so|since)\b/.test(lower)) pushTag(grammarMap, '接続詞', sentence)
    if (/\b(in|on|at|by|for|with|from|to|into|over|under|between|among|during|before|after)\b/.test(lower)) pushTag(grammarMap, '前置詞', sentence)
  })

  const past = tokenValues.filter((word) => /ed$/.test(word)).length
  if (past) pushTag(grammarMap, '過去', `${past} past-like tokens`)
  const present = tokenValues.filter((word) => /s$/.test(word) && word.length > 3).length
  if (present) pushTag(grammarMap, '現在', `${present} present-like tokens`)
  if (!grammarMap.has('能動')) pushTag(grammarMap, '能動', 'Active voice is used as the baseline in extracted sentences.')

  const levelCounts: Record<VocabularyLevel['level'], number> = { A1: 0, A2: 0, B1: 0, B2: 0 }
  tokenValues.forEach((word) => {
    if (A1.has(word) || word.length <= 4) levelCounts.A1 += 1
    else if (A2.has(word) || word.length <= 7) levelCounts.A2 += 1
    else if (B1.has(word) || word.length <= 10) levelCounts.B1 += 1
    else levelCounts.B2 += 1
  })

  return {
    grammarTags: Array.from(grammarMap.entries())
      .map(([name, value]) => ({ name, count: value.count, examples: Array.from(value.examples).slice(0, 3) }))
      .sort((a, b) => b.count - a.count),
    vocabularyLevels: (Object.entries(levelCounts) as Array<[VocabularyLevel['level'], number]>).map(([level, count]) => ({ level, count }))
  }
}
