import { Image } from 'expo-image';
import type { DimensionValue } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

const assets = {
  logo: require('./VisualAssets/Vector-1.svg'), circle: require('./VisualAssets/Ellipse 7.svg'),
  star: require('./VisualAssets/Union.svg'), symbol: require('./VisualAssets/Union-1.svg'),
  stripes: require('./VisualAssets/Group 27.svg'), stripeLine: require('./VisualAssets/Mask group.svg'),
  checker: require('./VisualAssets/Rectangle 9.svg'), corners: require('./VisualAssets/Vector-4.svg'),
  chevrons: require('./VisualAssets/Vector-3.svg'), eye: require('./VisualAssets/Vector-9.svg'),
  eyeOff: require('./VisualAssets/Vector-10.svg'), history: require('./VisualAssets/Vector-7.svg'),
  person: require('./VisualAssets/Vector-2.svg'),
  arrow: require('./VisualAssets/arrow.svg'),
  globe: require('./VisualAssets/Vector.svg'),
  dumbbell: require('./VisualAssets/Union-2.svg'),
  measure: require('./VisualAssets/Vector-5.svg'),
  calendar: require('./VisualAssets/Vector-8.svg'),
  search: require('./VisualAssets/Vector-6.svg'),
  pencil: require('./VisualAssets/Vector-11.svg'),
};
type Props = { name: keyof typeof assets; width: DimensionValue; height?: DimensionValue; label?: string; color?: string };

export function Artwork({ name, width, height = width, label, color }: Props) {
  const theme = useTheme();
  const tint = color ?? (name === 'logo' || name === 'arrow' ? undefined : theme.accent);
  return (
    <Image source={assets[name]} style={{ width, height }} contentFit="contain" tintColor={tint}
      accessible={Boolean(label)} accessibilityLabel={label} />
  );
}
