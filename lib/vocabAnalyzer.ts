import winkNLP from 'wink-nlp'
import model from 'wink-eng-lite-web-model'
import cefrData from '@/data/cefrVocab.json'

const nlp = winkNLP(model)
const its = nlp.its

/* ========== CEFR lookup sets ========== */
const cefrSets: Record<string, Set<string>> = {
  A1: new Set(cefrData.A1),
  A2: new Set(cefrData.A2),
  B1: new Set(cefrData.B1),
  B2: new Set(cefrData.B2)
}
const functionWordSet = new Set(cefrData.functionWords)
const preCefrExamSet = new Set((cefrData as any).preCefrExamVocab ?? [])

/* ========== Derivative suffix rules for stem-based lookup ========== */
type SuffixRule = { suffix: string; replacements: string[] }
const suffixRules: SuffixRule[] = (cefrData.derivativeSuffixes?.rules ?? []) as SuffixRule[]
// Sort by suffix length descending so longer suffixes match first
const sortedSuffixRules = [...suffixRules].sort((a, b) => b.suffix.length - a.suffix.length)

/* ========== Known proper-noun patterns (country names, months, etc.) ========== */
const knownProperPatterns = new Set(cefrData.properNounPatterns ?? [])

/* ========== POS mapping ========== */
type PosLabel = 'noun' | 'verb' | 'adjective' | 'adverb' | 'properNoun'
const posMap: Record<string, PosLabel> = {
  NOUN: 'noun',
  PROPN: 'properNoun',
  VERB: 'verb',
  ADJ: 'adjective',
  ADV: 'adverb'
}
// Content POS tags to extract (including PROPN for tracking, but they'll be categorized separately)
const contentPosTags = new Set(['NOUN', 'PROPN', 'VERB', 'ADJ', 'ADV'])

export const posLabelJa: Record<PosLabel, string> = {
  noun: '名詞',
  verb: '動詞',
  adjective: '形容詞',
  adverb: '副詞',
  properNoun: '固有名詞'
}

/* ========== Types ========== */
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'pre-CEFR' | 'unknown'
export type WordCategory = 'content' | 'properNoun'

export type CefrResolution = {
  level: CefrLevel
  /** If CEFR was resolved via stem/derivative/lemma lookup, the base form used */
  resolvedVia?: string
  /** How the level was determined */
  method: 'direct' | 'lemma' | 'stem' | 'prefix' | 'compound' | 'preCefr' | 'none'
}

export type VocabItem = {
  word: string
  pos: PosLabel
  cefrLevel: CefrLevel
  count: number
  category: WordCategory
  /** If CEFR was resolved via stem/derivative lookup, the base form used */
  resolvedVia?: string
  /** How the CEFR level was resolved */
  method?: CefrResolution['method']
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
  properNounCount: number
  /** Breakdown of 'unknown': how many were resolved vs truly unknown */
  unknownBreakdown: {
    /** Words whose stem matched a CEFR entry (derivative/inflection) */
    resolvedByStem: number
    /** Words that remain truly unclassified */
    trulyUnknown: number
    /** Proper nouns excluded from CEFR classification */
    properNouns: number
    /** Pre-CEFR exam vocabulary (demonyms, exam instructions, etc.) */
    preCefr: number
  }
}

/* ========== Helpers ========== */

/**
 * Look up CEFR level by exact match in the word lists.
 */
function getCefrLevelDirect(word: string): CefrLevel {
  const lower = word.toLowerCase()
  if (cefrSets.A1.has(lower)) return 'A1'
  if (cefrSets.A2.has(lower)) return 'A2'
  if (cefrSets.B1.has(lower)) return 'B1'
  if (cefrSets.B2.has(lower)) return 'B2'
  return 'unknown'
}

/**
 * Try to find the CEFR level by stripping known derivative suffixes
 * and looking up the resulting stem in the CEFR lists.
 * Returns { level, via } where `via` is the matched base form, or null if no match.
 */
function getCefrLevelByStem(word: string): { level: CefrLevel; via: string } | null {
  const lower = word.toLowerCase()

  for (const rule of sortedSuffixRules) {
    if (!lower.endsWith(rule.suffix)) continue
    const stem = lower.slice(0, -rule.suffix.length)
    if (stem.length < 2) continue

    for (const replacement of rule.replacements) {
      const candidate = stem + replacement
      if (candidate.length < 2) continue
      const level = getCefrLevelDirect(candidate)
      if (level !== 'unknown') {
        return { level, via: candidate }
      }
    }
  }
  return null
}

/**
 * Try splitting compound/hyphenated words and checking each part.
 * Returns the highest CEFR level found among parts, or null.
 */
function getCefrLevelByCompound(word: string): { level: CefrLevel; via: string } | null {
  const lower = word.toLowerCase()

  // Try hyphen splitting (e.g., "well-known" → "well" + "known")
  if (lower.includes('-')) {
    const parts = lower.split('-').filter((p) => p.length >= 2)
    if (parts.length >= 2) {
      const levels: CefrLevel[] = parts
        .map((p) => getCefrLevelDirect(p))
        .filter((l) => l !== 'unknown')
      if (levels.length > 0) {
        // Return the highest level found
        const order: CefrLevel[] = ['B2', 'B1', 'A2', 'A1']
        const highest = order.find((l) => levels.includes(l)) ?? levels[0]
        return { level: highest, via: parts.join(' + ') }
      }
    }
  }

  // Try camelCase-like compound detection for long words (e.g., "earthquake" → "earth" + "quake")
  // Only for words ≥ 8 chars where no other method works
  if (lower.length >= 8) {
    for (let splitPos = 3; splitPos <= lower.length - 3; splitPos++) {
      const left = lower.slice(0, splitPos)
      const right = lower.slice(splitPos)
      const leftLevel = getCefrLevelDirect(left)
      const rightLevel = getCefrLevelDirect(right)
      if (leftLevel !== 'unknown' && rightLevel !== 'unknown') {
        const order: CefrLevel[] = ['B2', 'B1', 'A2', 'A1']
        const highest = order.find((l) => l === leftLevel || l === rightLevel) ?? leftLevel
        return { level: highest, via: `${left} + ${right}` }
      }
    }
  }

  return null
}

/* Prefix patterns for prefix-stripping resolution */
const prefixPatterns = [
  { prefix: 'un', minStem: 3 },
  { prefix: 're', minStem: 3 },
  { prefix: 'dis', minStem: 3 },
  { prefix: 'pre', minStem: 3 },
  { prefix: 'over', minStem: 3 },
  { prefix: 'mis', minStem: 3 },
  { prefix: 'out', minStem: 3 },
  { prefix: 'non', minStem: 3 },
  { prefix: 'sub', minStem: 3 },
  { prefix: 'inter', minStem: 3 },
  { prefix: 'semi', minStem: 3 },
  { prefix: 'anti', minStem: 3 },
  { prefix: 'super', minStem: 3 },
  { prefix: 'under', minStem: 3 },
  { prefix: 'multi', minStem: 3 },
  { prefix: 'co', minStem: 4 }
]

/**
 * Unified CEFR resolution with multi-layer fallback.
 * This is the canonical function used by both vocabAnalyzer and textAnalyzer.
 *
 * Resolution order:
 * 1. Direct lookup in CEFR word lists
 * 2. Lemma lookup (wink-NLP lemmatization)
 * 3. Derivative suffix stripping (e.g., "environmental" → "environment")
 * 4. Prefix removal (e.g., "uncomfortable" → "comfortable")
 * 5. Compound word splitting (e.g., "well-known" → "well" + "known")
 * 6. Pre-CEFR exam vocabulary (demonyms, exam instruction words, etc.)
 * 7. Unknown
 */
export function resolveCefrLevel(word: string, lemma?: string): CefrResolution {
  const lower = word.toLowerCase()

  // 1. Direct lookup
  const direct = getCefrLevelDirect(lower)
  if (direct !== 'unknown') return { level: direct, method: 'direct' }

  // 2. Lemma lookup (wink-NLP lemmatization: e.g. "organizations" → "organization")
  if (lemma && lemma !== lower) {
    const lemmaLevel = getCefrLevelDirect(lemma)
    if (lemmaLevel !== 'unknown') return { level: lemmaLevel, resolvedVia: lemma, method: 'lemma' }
  }

  // 3. Derivative suffix stripping (e.g. "environmental" → "environment")
  const stemResult = getCefrLevelByStem(lower)
  if (stemResult) return { level: stemResult.level, resolvedVia: stemResult.via, method: 'stem' }

  // 4. Prefix removal (un-, re-, dis-, pre-, over-, etc.)
  for (const { prefix, minStem } of prefixPatterns) {
    if (lower.startsWith(prefix) && lower.length >= prefix.length + minStem) {
      const withoutPrefix = lower.slice(prefix.length)
      const prefixLevel = getCefrLevelDirect(withoutPrefix)
      if (prefixLevel !== 'unknown') return { level: prefixLevel, resolvedVia: withoutPrefix, method: 'prefix' }
      // Also try suffix stripping on the prefix-stripped word
      const stemOfStripped = getCefrLevelByStem(withoutPrefix)
      if (stemOfStripped) return { level: stemOfStripped.level, resolvedVia: stemOfStripped.via, method: 'prefix' }
    }
  }

  // 5. Compound word splitting
  const compoundResult = getCefrLevelByCompound(lower)
  if (compoundResult) return { level: compoundResult.level, resolvedVia: compoundResult.via, method: 'compound' }

  // 6. Pre-CEFR exam vocabulary check
  if (preCefrExamSet.has(lower)) {
    return { level: 'pre-CEFR', method: 'preCefr' }
  }
  // Also check lemma against pre-CEFR set
  if (lemma && preCefrExamSet.has(lemma)) {
    return { level: 'pre-CEFR', resolvedVia: lemma, method: 'preCefr' }
  }

  // 7. Unknown
  return { level: 'unknown', method: 'none' }
}

/**
 * Determine if a word is a proper noun based on:
 * 1. wink-NLP POS tag (PROPN)
 * 2. Known proper-noun patterns (country names, months, etc.)
 */
function isProperNoun(pos: string, word: string): boolean {
  if (pos === 'PROPN') return true
  if (knownProperPatterns.has(word.toLowerCase())) return true
  return false
}

export function isFunctionWord(word: string): boolean {
  return functionWordSet.has(word.toLowerCase())
}

/* ========== Grammar detection (mirrors textAnalyzer logic) ========== */
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

/* ========== Main analysis ========== */
export function analyzeVocabulary(text: string): VocabAnalysisResult {
  const doc = nlp.readDoc(text || '')

  /* --- Step 1: Extract content words with POS, lemma, and proper noun detection --- */
  const wordCounts = new Map<string, { pos: PosLabel; count: number; category: WordCategory; lemma: string }>()

  doc.tokens().each((token: any) => {
    const type = token.out(its.type) as string
    if (type !== 'word') return

    const pos = token.out(its.pos) as string
    if (!contentPosTags.has(pos)) return

    const normal = (token.out(its.normal) as string).toLowerCase()
    const lemma = (token.out(its.lemma) as string).toLowerCase()
    const originalWord = token.out(its.value) as string

    if (normal.length < 2) return
    if (isFunctionWord(normal)) return
    if (isFunctionWord(lemma)) return

    // Detect proper nouns
    const properNoun = isProperNoun(pos, originalWord)
    const posLabel = properNoun ? 'properNoun' : (posMap[pos] ?? 'noun')
    const category: WordCategory = properNoun ? 'properNoun' : 'content'

    // Use lemma as the key for content words to group inflections together
    const key = properNoun ? normal : (lemma || normal)

    const existing = wordCounts.get(key)
    if (existing) {
      existing.count += 1
    } else {
      wordCounts.set(key, { pos: posLabel, count: 1, category, lemma })
    }
  })

  /* --- Step 2: Assign CEFR levels with multi-layer resolution --- */
  let properNounCount = 0
  let resolvedByStem = 0
  let trulyUnknown = 0
  let preCefrCount = 0

  const vocabItems: VocabItem[] = Array.from(wordCounts.entries())
    .map(([word, data]) => {
      // Proper nouns get 'unknown' CEFR and are tracked separately
      if (data.category === 'properNoun') {
        properNounCount += data.count

        // Check if it's a known pre-CEFR word (demonyms like "Japanese", "English")
        const preCefrCheck = resolveCefrLevel(word, data.lemma)
        if (preCefrCheck.level === 'pre-CEFR') {
          preCefrCount += data.count
          return {
            word,
            pos: data.pos,
            cefrLevel: 'pre-CEFR' as CefrLevel,
            count: data.count,
            category: data.category,
            method: 'preCefr' as const
          }
        }

        return {
          word,
          pos: data.pos,
          cefrLevel: 'unknown' as CefrLevel,
          count: data.count,
          category: data.category,
          method: 'none' as const
        }
      }

      // Multi-layer CEFR resolution for content words
      const resolution = resolveCefrLevel(word, data.lemma)

      if (resolution.level === 'unknown') {
        trulyUnknown += data.count
      } else if (resolution.level === 'pre-CEFR') {
        preCefrCount += data.count
      } else if (resolution.method !== 'direct') {
        resolvedByStem += data.count
      }

      return {
        word,
        pos: data.pos,
        cefrLevel: resolution.level,
        count: data.count,
        category: data.category,
        resolvedVia: resolution.resolvedVia,
        method: resolution.method
      }
    })
    .sort((a, b) => b.count - a.count)

  // Content words only (excluding proper nouns) for statistics
  const contentItems = vocabItems.filter((item) => item.category === 'content')
  const totalContentWords = contentItems.reduce((sum, item) => sum + item.count, 0)

  /* --- Step 3: CEFR distribution (content words only) --- */
  const levelCounts: Record<CefrLevel, number> = { A1: 0, A2: 0, B1: 0, B2: 0, 'pre-CEFR': 0, unknown: 0 }
  contentItems.forEach((item) => {
    levelCounts[item.cefrLevel] += item.count
  })

  const cefrDistribution: CefrDistributionRow[] = (['A1', 'A2', 'B1', 'B2', 'pre-CEFR', 'unknown'] as CefrLevel[]).map((level) => ({
    level,
    count: levelCounts[level],
    rate: totalContentWords > 0 ? Math.round((levelCounts[level] / totalContentWords) * 1000) / 10 : 0
  }))

  /* --- Step 4: Grammar × CEFR cross tabulation (content words only) --- */
  const crossMap = new Map<string, number>()
  const sentences = doc.sentences().out() as string[]

  sentences.forEach((sentence) => {
    const grammarTags = detectGrammarTags(sentence)
    if (!grammarTags.length) return

    const sentenceDoc = nlp.readDoc(sentence)
    const sentenceLevels = new Set<CefrLevel>()

    sentenceDoc.tokens().each((token: any) => {
      const type = token.out(its.type) as string
      if (type !== 'word') return
      const pos = token.out(its.pos) as string
      if (!contentPosTags.has(pos)) return
      if (pos === 'PROPN') return // Exclude proper nouns from cross analysis
      const normal = (token.out(its.normal) as string).toLowerCase()
      const lemma = (token.out(its.lemma) as string).toLowerCase()
      if (normal.length < 2 || isFunctionWord(normal) || isFunctionWord(lemma)) return
      const { level } = resolveCefrLevel(normal, lemma)
      sentenceLevels.add(level)
    })

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
    totalContentWords,
    properNounCount,
    unknownBreakdown: {
      resolvedByStem,
      trulyUnknown,
      properNouns: properNounCount,
      preCefr: preCefrCount
    }
  }
}
