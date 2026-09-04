import { ReactElement, useCallback, useRef } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { FlatList } from 'react-native-gesture-handler';
import { TourScrollProvider } from '../onboarding/TourScroll';
import { measureInWindow } from '../onboarding/tourLayout';
import { Player } from '../types';
import { PlayerColorOption } from './PlayerColorPicker';
import { TurnOrderPlayerCard } from './TurnOrderPlayerCard';

type Props = {
  players: Player[];
  contentContainerStyle?: StyleProp<ViewStyle>;
  listHeaderComponent?: ReactElement | null;
  listEmptyComponent?: ReactElement | null;
  listFooterComponent?: ReactElement | null;
  onChange: (players: Player[]) => void;
  onRemove: (playerId: string) => void;
  tokenColors?: readonly PlayerColorOption[];
  onChangeColor?: (playerId: string, color: string) => void;
};

export function ReorderablePlayersList({
  players,
  contentContainerStyle,
  listHeaderComponent,
  listEmptyComponent,
  listFooterComponent,
  onChange,
  onRemove,
  tokenColors,
  onChangeColor,
}: Props) {
  const viewportRef = useRef<View>(null);
  const listRef = useRef<FlatList<Player>>(null);
  const offsetRef = useRef(0);

  const measureViewport = useCallback(
    () => measureInWindow(viewportRef.current),
    [],
  );

  const scrollBy = useCallback((deltaY: number) => {
    listRef.current?.scrollToOffset({
      offset: Math.max(0, offsetRef.current + deltaY),
      animated: true,
    });
  }, []);

  return (
    <View ref={viewportRef} collapsable={false} style={styles.list}>
      <TourScrollProvider measureViewport={measureViewport} scrollBy={scrollBy}>
        <DraggableFlatList
          ref={listRef}
          style={styles.list}
          containerStyle={styles.list}
          data={players}
          keyExtractor={(item) => item.id}
          contentContainerStyle={contentContainerStyle}
          keyboardShouldPersistTaps="handled"
          activationDistance={12}
          ListHeaderComponent={listHeaderComponent}
          ListEmptyComponent={listEmptyComponent}
          ListFooterComponent={listFooterComponent}
          onScrollOffsetChange={(offset) => {
            offsetRef.current = offset;
          }}
          onDragEnd={({ data }) => onChange(data)}
          renderItem={({ item, drag, isActive }: RenderItemParams<Player>) => (
            <ScaleDecorator>
              <TurnOrderPlayerCard
                player={item}
                isActive={isActive}
                tokenColors={tokenColors}
                takenColors={players
                  .filter((player) => player.id !== item.id)
                  .map((player) => player.color)}
                onChangeColor={
                  onChangeColor
                    ? (color) => onChangeColor(item.id, color)
                    : undefined
                }
                onDrag={drag}
                onRemove={() => onRemove(item.id)}
              />
            </ScaleDecorator>
          )}
        />
      </TourScrollProvider>
    </View>
  );
}

const styles = {
  list: { flex: 1 },
};
