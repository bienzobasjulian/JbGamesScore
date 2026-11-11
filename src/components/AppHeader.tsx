import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { TourAnchor } from '../onboarding';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';

type Props = {
  title: string;
  subtitle?: string;
  onMenuPress?: () => void;
  onBack?: () => void;
  showLogo?: boolean;
  menuTourAnchorId?: string;
  menuIcon?: 'menu' | 'more';
  plain?: boolean;
};

export function AppHeader({
  title,
  subtitle,
  onMenuPress,
  onBack,
  showLogo = false,
  menuTourAnchorId,
  menuIcon = 'menu',
  plain = false,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={12}
          style={styles.plainBtn}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
      ) : showLogo ? (
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          accessibilityLabel="JbGamesScore"
        />
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
      <View style={styles.titles}>
        <Text
          style={[styles.title, plain && styles.titleCentered]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onMenuPress ? (
        <MenuButton
          onPress={onMenuPress}
          icon={menuIcon === 'more' ? '⋮' : '☰'}
          tourAnchorId={menuTourAnchorId}
          styles={styles}
        />
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
    </View>
  );
}

function MenuButton({
  onPress,
  icon,
  tourAnchorId,
  styles,
}: {
  onPress: () => void;
  icon: string;
  tourAnchorId?: string;
  styles: ReturnType<typeof createStyles>;
}) {
  const button = (
    <Pressable onPress={onPress} hitSlop={12} style={styles.iconBtn}>
      <Text style={[styles.menuIcon, icon === '⋮' && styles.moreIcon]}>
        {icon}
      </Text>
    </Pressable>
  );
  if (!tourAnchorId) return button;
  return <TourAnchor id={tourAnchorId}>{button}</TourAnchor>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  plainBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 40,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  menuIcon: {
    fontSize: 20,
    color: theme.text,
    fontWeight: '700',
  },
  moreIcon: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
  },
  backIcon: {
    fontSize: 22,
    color: theme.text,
    fontWeight: '600',
  },
  titles: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.text,
  },
  titleCentered: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textMuted,
  },
});
