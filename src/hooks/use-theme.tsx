import { createContext, useContext, useState, type PropsWithChildren } from 'react';
import { Colors } from '@/constants/theme';

type Theme = { [Key in keyof typeof Colors]: string } & { setAccentColor: (color: string) => void };
const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [accent, setAccentColor] = useState<string>(Colors.accent);
  return <ThemeContext.Provider value={{ ...Colors, accent, setAccentColor }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('O tema precisa estar dentro de ThemeProvider.');
  return theme;
}
