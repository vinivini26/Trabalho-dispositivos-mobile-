import { StyleSheet, Text } from 'react-native';
import { Screen } from './Screen';
import { Card } from './Card';
import { ThemePicker } from './ThemePicker';
import { spacing, useTheme } from '@/theme';

export function ConfigurationScreen() {
  const { theme } = useTheme();
  return (
    <Screen scroll>
      <Text style={[styles.title, { color: theme.text }]}>RotaFit</Text>
      <Card>
        <Text style={[styles.heading, { color: theme.text }]}>Configuração inicial</Text>
        <Text style={[styles.copy, { color: theme.muted }]}>
          O serviço de acesso ainda não foi configurado nesta instalação. Consulte o
          README para conectar o Supabase e habilitar o login com Google.
        </Text>
        <Text style={[styles.copy, { color: theme.muted }]}>
          Suas corridas serão vinculadas à sua conta após essa configuração.
        </Text>
      </Card>
      <Text style={[styles.heading, { color: theme.text }]}>Aparência</Text>
      <ThemePicker />
      <Text style={{ color: theme.muted }}>Desenvolvido por vinivini26</Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  title: { fontSize: 32, fontWeight: '800', marginVertical: spacing.xl },
  heading: { fontSize: 18, fontWeight: '700', marginVertical: spacing.md },
  copy: { fontSize: 15, lineHeight: 24, marginBottom: spacing.md },
});
