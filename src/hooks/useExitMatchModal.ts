import { useCallback, useEffect, useState } from 'react';
import { BackHandler, Platform } from 'react-native';

export function useExitMatchModal() {
  const [exitModalVisible, setExitModalVisible] = useState(false);

  const requestExit = useCallback(() => {
    setExitModalVisible(true);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (exitModalVisible) {
          setExitModalVisible(false);
          return true;
        }
        requestExit();
        return true;
      },
    );

    return () => subscription.remove();
  }, [exitModalVisible, requestExit]);

  return {
    exitModalVisible,
    setExitModalVisible,
    requestExit,
  };
}
