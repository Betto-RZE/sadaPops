export const REGISTRATION_THEMES = [
  { id: 'vino', name: 'Vino', hex: '#8B174C', scene: '#F6EAF0', paper: '#FFFAFC', accent: '#72113D', border: '#DDB5C7' },
  { id: 'fucsia', name: 'Fucsia', hex: '#E00078', scene: '#FBEAF2', paper: '#FFFAFC', accent: '#B0005C', border: '#E8B4CF' },
  { id: 'rosa', name: 'Rosa', hex: '#F28CBE', scene: '#FCEEF5', paper: '#FFFBFD', accent: '#9D225E', border: '#E8BED3' },
  { id: 'lila-claro', name: 'Lila claro', hex: '#D6ADE0', scene: '#F4EEF8', paper: '#FDFBFF', accent: '#743E86', border: '#D7C0E0' },
  { id: 'rosa-palido', name: 'Rosa pálido', hex: '#EFD5DF', scene: '#F8F0F3', paper: '#FFFCFD', accent: '#86465F', border: '#DFC7D1' },
] as const;

export type RegistrationTheme = (typeof REGISTRATION_THEMES)[number];
export const DEFAULT_REGISTRATION_THEME = REGISTRATION_THEMES[1];

// Paletas del antiguo visor: colores sin equivalente usan el tema inicial.
const LEGACY_THEME_IDS: Record<string, RegistrationTheme['id']> = {
  'rosa-dalia': 'fucsia',
  'morado-voxel': 'lila-claro',
  carmin: 'vino',
  cempasuchil: 'fucsia',
  jade: 'fucsia',
  cobalto: 'fucsia',
};

export function resolveRegistrationTheme(id: string | null): RegistrationTheme {
  const resolved = id ? LEGACY_THEME_IDS[id] ?? id : null;
  return REGISTRATION_THEMES.find(theme => theme.id === resolved) ?? DEFAULT_REGISTRATION_THEME;
}
