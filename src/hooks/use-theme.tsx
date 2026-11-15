import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { accentColors } from '@/utils/registration';

type Theme = { [Key in keyof typeof Colors]: string } & { setAccentColor: (color: string) => void; persistenceMessage: string };
const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [accent, setAccent] = useState<string>(Colors.accent);
  const [persistenceMessage, setPersistenceMessage] = useState('');
  const selected = useRef(false);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('@workin/accent').then(value => {
      if (active && !selected.current && accentColors.some(color => color.value === value)) setAccent(value!);
    }).catch(() => { if (active) setPersistenceMessage('Não foi possível recuperar a cor salva.'); });
    return () => { active = false; };
  }, []);

  function setAccentColor(color: string) {
    if (!accentColors.some(option => option.value === color)) return;
    selected.current = true;
    setAccent(color);
    setPersistenceMessage('');
    // Serializa escolhas rápidas para a última cor também ser a última gravada.
    writes.current = writes.current.then(() => AsyncStorage.setItem('@workin/accent', color))
      .catch(() => setPersistenceMessage('A cor foi aplicada, mas não pôde ser salva neste dispositivo.'));
  }
  return <ThemeContext.Provider value={{ ...Colors, accent, setAccentColor, persistenceMessage }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('O tema precisa estar dentro de ThemeProvider.');
  return theme;
}
