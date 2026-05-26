import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { theme } from '../constants';
import { Player, RoundScores } from '../types';
import { RankedPlayer } from '../utils/match';
import { MatchProgressChart } from './MatchProgressChart';
import { MatchRanking } from './MatchRanking';
import { RoundHistory } from './RoundHistory';

type PageKey = 'podium' | 'chart';

const PAGES: { key: PageKey; label: string }[] = [
  { key: 'podium', label: 'Podio' },
  { key: 'chart', label: 'Evolución' },
];

type Props = {
  ranking: RankedPlayer[];
  players: Player[];
  rounds: RoundScores[];
};

export function MatchResultsPager({ ranking, players, rounds }: Props) {
  const listRef = useRef<FlatList<PageKey>>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pagerScrollEnabled, setPagerScrollEnabled] = useState(true);
  const pages = rounds.length > 1 ? PAGES : [PAGES[0]];
  const hasMultiplePages = pages.length > 1;

  useEffect(() => {
    if (activeIndex >= pages.length) {
      setActiveIndex(0);
      if (pageWidth > 0) {
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
      }
    }
  }, [activeIndex, pageWidth, pages.length]);

  const onPagerLayout = (e: LayoutChangeEvent) => {
    setPageWidth(e.nativeEvent.layout.width);
  };

  const goToPage = (index: number) => {
    if (pageWidth <= 0) return;
    listRef.current?.scrollToOffset({ offset: index * pageWidth, animated: true });
    setActiveIndex(index);
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pageWidth <= 0) return;
    const index = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    setActiveIndex(index);
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const idx = viewableItems[0]?.index;
      if (idx != null) setActiveIndex(idx);
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

  const renderPage = ({ item }: { item: PageKey }) => (
    <View style={[styles.page, pageWidth > 0 && { width: pageWidth }]}>
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {item === 'podium' ? (
          <>
            <MatchRanking ranking={ranking} />
            {rounds.length > 0 && (
              <RoundHistory
                players={players}
                rounds={rounds}
                onHorizontalScrollStart={() => setPagerScrollEnabled(false)}
                onHorizontalScrollEnd={() => setPagerScrollEnabled(true)}
              />
            )}
          </>
        ) : (
          <MatchProgressChart players={players} rounds={rounds} />
        )}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.wrap} onLayout={onPagerLayout}>
      {hasMultiplePages ? (
        <View style={styles.tabs}>
          {pages.map((page, index) => {
            const active = activeIndex === index;
            return (
              <Pressable
                key={page.key}
                onPress={() => goToPage(index)}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {page.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {pageWidth > 0 ? (
        <FlatList
          ref={listRef}
          style={styles.pager}
          data={pages.map((p) => p.key)}
          keyExtractor={(key) => key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={hasMultiplePages && pagerScrollEnabled}
          decelerationRate="fast"
          snapToInterval={pageWidth}
          snapToAlignment="start"
          disableIntervalMomentum
          onMomentumScrollEnd={onScrollEnd}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: pageWidth,
            offset: pageWidth * index,
            index,
          })}
          renderItem={renderPage}
        />
      ) : (
        <View style={styles.placeholder} />
      )}

      {hasMultiplePages ? (
        <>
          <View style={styles.dots}>
            {pages.map((page, index) => (
              <Pressable
                key={page.key}
                onPress={() => goToPage(index)}
                style={[styles.dot, activeIndex === index && styles.dotActive]}
                accessibilityLabel={page.label}
              />
            ))}
          </View>

          <Text style={styles.hint}>Desliza para cambiar de sección</Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 0,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: theme.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.textMuted,
  },
  tabTextActive: {
    color: '#0F1419',
  },
  pager: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  pageScroll: {
    flex: 1,
  },
  pageScrollContent: {
    gap: 12,
    paddingBottom: 8,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.border,
  },
  dotActive: {
    backgroundColor: theme.accent,
    width: 20,
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 6,
  },
});
