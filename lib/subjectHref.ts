export function subjectHref(slug: string) {
  if (slug === 'japanese') return '/japanese/'
  if (slug === 'english') return '/subjects/english/'
  if (slug === 'math') return '/math/'
  if (slug === 'history') return '/history/'
  if (slug === 'geography') return '/geography/'
  if (slug === 'science-life') return '/science-society/'
  if (slug === 'physics') return '/physics/'
  if (slug === 'chemistry') return '/chemistry/'
  if (slug === 'biology') return '/biology/'
  if (slug === 'earth-science') return '/earth-science/'
  return `/subjects/${slug}/`
}
