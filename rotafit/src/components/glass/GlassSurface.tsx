import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

interface GlassSurfaceProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  tint?: string; // cor de destaque do vidro (ex.: cor do time, do status)
  opacity?: number; // 0 a 1: quanto mais alto, mais sólida a cor (menos "vidro")
}

// Vidro leve feito com cor translúcida, reflexo em degradê e borda fina.
// Usa apenas componentes do React Native e Expo LinearGradient, sem blur nativo.
export function GlassSurface({
  children,
  style,
  radius = 24,
  tint,
  opacity,
}: GlassSurfaceProps) {
  const { theme } = useTheme();
  const glassTint = tint ?? theme.glass;

  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: glassTint,
            opacity: opacity ?? (theme.mode === 'dark' ? 0.88 : 0.76),
          },
        ]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[tint ? 'rgba(255,255,255,0.16)' : theme.glassHighlight, 'transparent']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.7, y: 0.8 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: radius, borderWidth: 1, borderColor: theme.glassBorder },
        ]}
      />
      <View style={{ borderRadius: radius }}>{children}</View>
    </View>
  );
}

// Sombra colorida por baixo do vidro — o "glow" que dá profundidade ao efeito.
export function glassShadow(color: string): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: color,
      shadowOpacity: 0.35,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 6 },
    default: {
      shadowColor: color,
      shadowOpacity: 0.35,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
  }) as ViewStyle;
}
