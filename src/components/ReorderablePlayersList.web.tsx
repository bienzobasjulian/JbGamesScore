import { ReactElement, useMemo, useState } from 'react';
import { ScrollView, StyleProp, ViewStyle } from 'react-native';
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

function movePlayerById(players: Player[], fromId: string, toId: string): Player[] {
  const fromIndex = players.findIndex((player) => player.id === fromId);
  const toIndex = players.findIndex((player) => player.id === toId);

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return players;
  }

  const next = [...players];
  const [player] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, player);
  return next;
}

export function ReorderablePlayersList({
  players,
  contentContainerStyle,
  listHeaderComponent,
  listEmptyComponent,
  listFooterComponent,
  onChange,
  onRemove,
}: Props) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const canRenderItems = useMemo(() => players.length > 0, [players.length]);

  return (
    <ScrollView
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps="handled"
    >
      {listHeaderComponent}
      {!canRenderItems ? listEmptyComponent : null}

      {canRenderItems
        ? players.map((player) => {
            const isDragged = draggedId === player.id;
            const isOver = overId === player.id && draggedId !== player.id;

            return (
              <div
                key={player.id}
                draggable
                onDragStart={(event) => {
                  setDraggedId(player.id);
                  event.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (draggedId && draggedId !== player.id) {
                    setOverId(player.id);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggedId && draggedId !== player.id) {
                    onChange(movePlayerById(players, draggedId, player.id));
                  }
                  setDraggedId(null);
                  setOverId(null);
                }}
                onDragEnd={() => {
                  setDraggedId(null);
                  setOverId(null);
                }}
                style={{
                  cursor: 'grab',
                  opacity: isDragged ? 0.7 : 1,
                  transform: isDragged ? 'scale(1.01)' : 'scale(1)',
                  outline: isOver ? '2px solid #4ECDC4' : 'none',
                  outlineOffset: '2px',
                }}
              >
                <TurnOrderPlayerCard
                  player={player}
                  isActive={isDragged}
                  onDrag={() => {}}
                  onRemove={() => onRemove(player.id)}
                />
              </div>
            );
          })
        : null}
      {listFooterComponent}
    </ScrollView>
  );
}
