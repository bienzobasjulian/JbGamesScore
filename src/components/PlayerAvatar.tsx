import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';
import {
  PLAYER_AVATAR_SVG_PATHS,
  PLAYER_AVATAR_SVG_VIEWBOX,
} from '../utils/playerAvatarPaths';
import {
  getPlayerInitial,
  isPlayerAvatarId,
  type PlayerAvatarId,
} from '../utils/playerAvatars';
import { getPlayerAvatarTextColor } from '../utils/players';

type IconProps = {
  color: string;
  knockout: string;
  size: number;
};

function GameIconPath({
  color,
  d,
  size,
  viewBox = '0 0 512 512',
}: {
  color: string;
  d: string;
  size: number;
  viewBox?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox={viewBox}>
      <Path d={d} fill={color} fillRule="evenodd" />
    </Svg>
  );
}

const DICE_PIPS: Record<number, [number, number][]> = {
  1: [[12, 12]],
  2: [
    [7.6, 7.6],
    [16.4, 16.4],
  ],
  3: [
    [7.6, 7.6],
    [12, 12],
    [16.4, 16.4],
  ],
  4: [
    [7.6, 7.6],
    [16.4, 7.6],
    [7.6, 16.4],
    [16.4, 16.4],
  ],
  5: [
    [7.6, 7.6],
    [16.4, 7.6],
    [12, 12],
    [7.6, 16.4],
    [16.4, 16.4],
  ],
  6: [
    [7.6, 7.2],
    [7.6, 12],
    [7.6, 16.8],
    [16.4, 7.2],
    [16.4, 12],
    [16.4, 16.8],
  ],
};

function DiceFace({
  pips,
  color,
  knockout,
  size,
}: IconProps & { pips: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3.2} y={3.2} width={17.6} height={17.6} rx={3.4} fill={color} />
      {(DICE_PIPS[pips] ?? []).map(([cx, cy], index) => (
        <Circle key={index} cx={cx} cy={cy} r={1.65} fill={knockout} />
      ))}
    </Svg>
  );
}

function TrainIcon({ color, knockout, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3.6} y={10} width={12.2} height={6.6} rx={1.1} fill={color} />
      <Rect x={12.8} y={5.6} width={7.6} height={11} rx={1.2} fill={color} />
      <Rect x={15.4} y={3.2} width={2.6} height={2.8} rx={0.5} fill={color} />
      <Rect x={14.6} y={7.2} width={4} height={2.6} rx={0.5} fill={knockout} />
      <Circle cx={8} cy={18.4} r={2.3} fill={color} />
      <Circle cx={16.6} cy={18.4} r={2.3} fill={color} />
      <Circle cx={8} cy={18.4} r={0.9} fill={knockout} />
      <Circle cx={16.6} cy={18.4} r={0.9} fill={knockout} />
    </Svg>
  );
}

function SevenIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path fill={color} d="M6.4 4.4h12.2l-6.8 15.4H8.4L14.4 7H6.4Z" />
    </Svg>
  );
}

function HeartsIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M12 21.2 10.4 19.8C5.2 15.1 2 12.2 2 8.6 2 5.6 4.4 3.2 7.4 3.2c1.8 0 3.5.8 4.6 2.2 1.1-1.4 2.8-2.2 4.6-2.2 3 0 5.4 2.4 5.4 5.4 0 3.6-3.2 6.5-8.4 11.2L12 21.2Z"
      />
    </Svg>
  );
}

function DiamondsIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon points="12,2.4 21.2,12 12,21.6 2.8,12" fill={color} />
    </Svg>
  );
}

function ClubsIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={8.1} cy={13.2} r={4.1} fill={color} />
      <Circle cx={15.9} cy={13.2} r={4.1} fill={color} />
      <Circle cx={12} cy={8} r={4.1} fill={color} />
      <Path fill={color} d="M12 14.2 9.4 21.4h5.2Z" />
    </Svg>
  );
}

const DRAWN_ICONS: Partial<
  Record<PlayerAvatarId, (props: IconProps) => ReactElement>
> = {
  dice1: (props) => <DiceFace {...props} pips={1} />,
  dice2: (props) => <DiceFace {...props} pips={2} />,
  dice3: (props) => <DiceFace {...props} pips={3} />,
  dice4: (props) => <DiceFace {...props} pips={4} />,
  dice5: (props) => <DiceFace {...props} pips={5} />,
  dice6: (props) => <DiceFace {...props} pips={6} />,
  train: TrainIcon,
  seven: SevenIcon,
  hearts: HeartsIcon,
  diamonds: DiamondsIcon,
  clubs: ClubsIcon,
};

type PlayerAvatarIconProps = IconProps & {
  id: PlayerAvatarId;
};

export function PlayerAvatarIcon({
  id,
  color,
  knockout,
  size,
}: PlayerAvatarIconProps) {
  const svgPath = PLAYER_AVATAR_SVG_PATHS[id];
  if (svgPath) {
    return (
      <GameIconPath
        d={svgPath}
        color={color}
        size={size}
        viewBox={PLAYER_AVATAR_SVG_VIEWBOX[id]}
      />
    );
  }
  const Drawn = DRAWN_ICONS[id];
  if (!Drawn) return null;
  return <Drawn color={color} knockout={knockout} size={size} />;
}

type PlayerAvatarProps = {
  name: string;
  color: string;
  avatar?: string | null;
  size?: number;
  radius?: number;
};

export function PlayerAvatar({
  name,
  color,
  avatar,
  size = 48,
  radius,
}: PlayerAvatarProps) {
  const fg = getPlayerAvatarTextColor(color);
  const resolvedRadius = radius ?? Math.round(size * 0.28);
  const iconSize = Math.round(size * 0.72);
  const fontSize = Math.round(size * 0.42);
  const avatarId = avatar && isPlayerAvatarId(avatar) ? avatar : null;
  const initial = getPlayerInitial(name);

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={name || 'Avatar'}
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: resolvedRadius,
          backgroundColor: color,
          borderColor: fg === '#000000' ? 'rgba(0,0,0,0.22)' : 'transparent',
        },
      ]}
    >
      {avatarId ? (
        <PlayerAvatarIcon
          id={avatarId}
          color={fg}
          knockout={color}
          size={iconSize}
        />
      ) : initial ? (
        <Text style={[styles.initial, { color: fg, fontSize }]}>
          {initial}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
  },
  initial: {
    fontWeight: '800',
  },
});
