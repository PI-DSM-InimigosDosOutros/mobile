export const Colors = {
  background: '#20212B',
  surface: '#292A34',
  text: '#CBD1D2',
  textSecondary: '#A5ABB0',
  accent: '#BAE068',
  onAccent: '#20212B',
  border: '#62666C',
  field: '#CBD1D2',
  onField: '#20212B',
  placeholder: '#555B62',
  error: '#FFB4AB',
  backdrop: 'rgba(0, 0, 0, 0.72)',
} as const;

export const Fonts = {
  sans: 'SpaceGrotesk-Regular',
  medium: 'SpaceGrotesk-Medium',
  bold: 'SpaceGrotesk-Bold',
  mono: 'DMMono-Regular',
  monoMedium: 'DMMono-Medium',
};
export const Decoration = { watermarkOpacity: 0.055 } as const;
export const Spacing = { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 } as const;
export const MaxContentWidth = 440;
