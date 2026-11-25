import { Alert, Platform, type AlertButton } from 'react-native';

export function showDialog(title: string, message: string, buttons?: AlertButton[]) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  const text = [title, message].filter(Boolean).join('\n\n');
  const confirm = buttons?.find((button) => button.style !== 'cancel');
  if (buttons?.some((button) => button.style === 'cancel')) {
    if (globalThis.confirm(text)) confirm?.onPress?.();
  } else {
    globalThis.alert(text);
    confirm?.onPress?.();
  }
}
