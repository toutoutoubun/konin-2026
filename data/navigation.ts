// Primary navigation items shown on every page.
// Design intent (per design-doc review B-1):
//   The site identity is "four independent tools + entry page".
//   That structure should be visible on every page so users can
//   always see the whole and where they currently are.
//
// "公式過去問PDF傾向分析" is rendered separately as a subject dropdown
// in the Header, so it is not included in this list.
export type NavItem = { label: string; href: string }

export const primaryNavItems: NavItem[] = [
  { label: 'トップ', href: '/' },
  { label: '出願Todo', href: '/application-todo/' },
  { label: 'ルート比較', href: '/route-compare/' },
  { label: '免除確認', href: '/exemption-check/' },
  { label: '分析科目', href: '/analysis/' },
]

// Secondary links collected in the footer (per review B-1):
//   Tag dictionary / change log / official PDF live in the footer
//   so the main nav stays focused on the four tools.
export const footerSecondaryItems: NavItem[] = [
  { label: 'タグ定義', href: '/tags/' },
  { label: '更新履歴', href: '/updates/' },
]
