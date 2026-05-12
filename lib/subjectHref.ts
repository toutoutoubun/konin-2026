export function subjectHref(slug: string) {
  if (slug === 'english') return '/subjects/english/'
  if (slug === 'math') return '/math/'
  if (slug === 'history') return '/history/'
  if (slug === 'geography') return '/geography/'
  if (slug === 'science-life') return '/science-society/'
  if (slug === 'physics') return '/physics/'
  return `/subjects/${slug}/`
}
