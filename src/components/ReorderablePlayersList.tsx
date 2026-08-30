import { ReactElement } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { Player } from '../types';
import { TurnOrderPlayerCard } from './TurnOrderPlayerCard';

type Props = {
  players: Player[];
  contentContainerStyle?: StyleProp<ViewStyle>;
  listHeaderComponent?: ReactElement | null;
  listEmptyComponent?: ReactElement | null;
  listFooterComponent?: ReactElement | null;
  onChange: (players: Player[]) => void;
  onRemove: (playerId: string) => void;
};

export function ReorderablePlayersList({
  players,
  contentContainerStyle,
  listHeaderComponent,
  listEmptyComponent,
  listFooterComponent,
  onChange,
  onRemove,
}: Props) {
  return (
    <View style={styles.list}>
      <DraggableFlatList
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
        onDragEnd={({ data }) => onChange(data)}
        renderItem={({ item, drag, isActive }: RenderItemParams<Player>) => (
          <ScaleDecorator>
            <TurnOrderPlayerCard
              player={item}
              isActive={isActive}
              onDrag={drag}
              onRemove={() => onRemove(item.id)}
            />
          </ScaleDecorator>
        )}
      />
    </View>
  );
}

const styles = {
  list: { flex: 1 },
};
