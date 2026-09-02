import type { AppTheme } from './types';

export const darkTheme: AppTheme = {
  bg: '#0F1419',
  surface: '#1A2332',
  surfaceLight: '#243044',
  border: '#2D3F56',
  text: '#F0F4F8',
  textMuted: '#8B9CB3',
  accent: '#4ECDC4',
  accentDark: '#2A9D8F',
  danger: '#E85D4C',
  warning: '#F5A623',
  success: '#50C878',
  onAccent: '#0F1419',
};

export const lightTheme: AppTheme = {
  bg: '#F0F4F8',
  surface: '#FFFFFF',
  surfaceLight: '#E8EDF3',
  border: '#C5D0DE',
  text: '#1A2332',
  textMuted: '#5A6B7F',
  accent: '#2A9D8F',
  accentDark: '#1F7A6F',
  danger: '#D94A3A',
  warning: '#D4880A',
  success: '#2EAA5E',
  onAccent: '#FFFFFF',
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;
