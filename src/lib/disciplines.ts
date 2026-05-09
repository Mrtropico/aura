export const DISCIPLINES = [
  { id: 'graffiti',      label: 'Graffiti',       emoji: '🎨' },
  { id: 'peinture',      label: 'Peinture',        emoji: '🖌️' },
  { id: 'musique',       label: 'Musique',         emoji: '🎵' },
  { id: 'photographie',  label: 'Photographie',    emoji: '📸' },
  { id: 'sculpture',     label: 'Sculpture',       emoji: '🗿' },
  { id: 'danse',         label: 'Danse',           emoji: '💃' },
  { id: 'digital',       label: 'Art Digital',     emoji: '💻' },
  { id: 'tatouage',      label: 'Tatouage',        emoji: '⚡' },
  { id: 'cinema',        label: 'Cinéma',          emoji: '🎬' },
  { id: 'performance',   label: 'Performance',     emoji: '🎭' },
  { id: 'ceramique',     label: 'Céramique',       emoji: '🏺' },
  { id: 'street_art',    label: 'Street Art',      emoji: '🏙️' },
  { id: 'illustration',  label: 'Illustration',    emoji: '✏️' },
  { id: 'bijouterie',    label: 'Bijouterie',      emoji: '💎' },
] as const;

export type DisciplineId = typeof DISCIPLINES[number]['id'];
