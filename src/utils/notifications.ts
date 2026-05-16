import Toast from 'react-native-toast-message';

export const notify = {
  success: (title: string, body?: string) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: body,
      position: 'top',
      visibilityTime: 4000,
    });
  },
  error: (title: string, body?: string) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: body,
      position: 'top',
      visibilityTime: 5000,
    });
  },
  info: (title: string, body?: string) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: body,
      position: 'top',
      visibilityTime: 4000,
    });
  }
};
