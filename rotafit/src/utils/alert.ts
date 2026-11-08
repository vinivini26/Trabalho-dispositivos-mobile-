import { Alert as NativeAlert, Platform } from 'react-native';
import type { AlertButton } from 'react-native';

// Web is used only for the UI verification harness; native builds use native dialogs.
export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[]) {
    if (Platform.OS !== 'web') return NativeAlert.alert(title, message, buttons);
    const action = buttons?.find((button) => button.style !== 'cancel');
    if (buttons?.some((button) => button.style === 'cancel')) {
      if (window.confirm(`${title}\n${message ?? ''}`)) action?.onPress?.();
    } else {
      window.alert(`${title}\n${message ?? ''}`);
      action?.onPress?.();
    }
  },
};
