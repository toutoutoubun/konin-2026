import winkNLP from 'wink-nlp'
import model from 'wink-eng-lite-web-model'
import { resolveCefrLevel, isFunctionWord } from './vocabAnalyzer'
import type { GrammarTag, VocabularyLevel } from './tagMapper'

const nlp = winkNLP(model)
const its = nlp.its

/* ---------- Grammar detection ---------- */
function pushTag(map: Map<string, { count: number; examples: Set<string> }>, name: string, example: string) {
  const item = map.get(name) ?? { count: 0, examples: new Set<string>() }
  item.count += 1
  if (example) item.examples.add(example.slice(0, 90))
  map.set(name, item)
}

export function analyzeEnglishText(text: string): { grammarTags: GrammarTag[]; vocabularyLevels: VocabularyLevel[] } {
  const doc = nlp.readDoc(text || '')
  const sentences = doc.sentences().out() as string[]
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

  const tokenValues = doc.tokens().filter((token: any) => token.out(its.type) === 'word').out(its.normal) as string[]
  const past = tokenValues.filter((word) => /ed$/.test(word)).length
  if (past) pushTag(grammarMap, '過去', `${past} past-like tokens`)
  const present = tokenValues.filter((word) => /s$/.test(word) && word.length > 3).length
  if (present) pushTag(grammarMap, '現在', `${present} present-like tokens`)
  if (!grammarMap.has('能動')) pushTag(grammarMap, '能動', 'Active voice is used as the baseline in extracted sentences.')

  /* ---------- Vocabulary level classification (unified CEFR resolution) ---------- */
  const levelCounts: Record<VocabularyLevel['level'], number> = { A1: 0, A2: 0, B1: 0, B2: 0 }

  // Filter to content words only (skip proper nouns and function words)
  doc.tokens().each((token: any) => {
    const type = token.out(its.type) as string
    if (type !== 'word') return
    const pos = token.out(its.pos) as string
    if (pos === 'PROPN') return // Skip proper nouns
    const normal = (token.out(its.normal) as string).toLowerCase()
    const lemma = (token.out(its.lemma) as string).toLowerCase()
    if (normal.length < 2) return
    if (isFunctionWord(normal)) return
    if (isFunctionWord(lemma)) return

    // Use the unified CEFR resolution from vocabAnalyzer
    const resolution = resolveCefrLevel(normal, lemma)

    // Map to the 4-level VocabularyLevel system used by textAnalyzer
    // pre-CEFR and unknown are excluded from this count (they are tracked separately in vocabAnalyzer)
    if (resolution.level === 'A1' || resolution.level === 'A2' || resolution.level === 'B1' || resolution.level === 'B2') {
      levelCounts[resolution.level] += 1
    }
    // pre-CEFR and unknown words are intentionally not counted here
    // They are properly tracked and displayed by vocabAnalyzer's own distribution
  })

  return {
    grammarTags: Array.from(grammarMap.entries())
      .map(([name, value]) => ({ name, count: value.count, examples: Array.from(value.examples).slice(0, 3) }))
      .sort((a, b) => b.count - a.count),
    vocabularyLevels: (Object.entries(levelCounts) as Array<[VocabularyLevel['level'], number]>).map(([level, count]) => ({ level, count }))
  }
}
