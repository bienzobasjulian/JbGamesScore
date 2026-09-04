import { useContext } from 'react';
import { OnboardingContext } from './OnboardingContext';

export function useOnboarding() {
  const value = useContext(OnboardingContext);
  if (!value) {
    throw new Error('useOnboarding debe usarse dentro de OnboardingProvider');
  }
  return value;
}
