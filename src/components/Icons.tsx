import Svg, { Circle, Path, Rect } from "react-native-svg";

type P = { size?: number; color: string };

export const PauseIcon = ({ size = 28, color }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x={6} y={4.5} width={4} height={15} rx={1.2} fill={color} />
    <Rect x={14} y={4.5} width={4} height={15} rx={1.2} fill={color} />
  </Svg>
);

export const PlayIcon = ({ size = 28, color }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M7 4.8v14.4a1 1 0 0 0 1.5.86l12-7.2a1 1 0 0 0 0-1.72l-12-7.2A1 1 0 0 0 7 4.8z"
      fill={color}
    />
  </Svg>
);

export const ResetIcon = ({ size = 28, color }: P) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M3 12a9 9 0 1 0 3-6.7" />
    <Path d="M3 4v5h5" />
  </Svg>
);

export const StopIcon = ({ size = 24, color }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x={5} y={5} width={14} height={14} rx={3} fill={color} />
  </Svg>
);

export const ClockIcon = ({ size = 20, color }: P) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Circle cx={12} cy={12} r={9} />
    <Path d="M12 7.5V12l3 2" />
  </Svg>
);

/** Historique : trois barres, comme des stats */
export const ChartIcon = ({ size = 24, color }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x={4} y={12} width={4} height={8} rx={1.5} fill={color} />
    <Rect x={10} y={7} width={4} height={13} rx={1.5} fill={color} />
    <Rect x={16} y={3.5} width={4} height={16.5} rx={1.5} fill={color} />
  </Svg>
);

export const CheckIcon = ({ size = 46, color }: P) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);

export const ChevronLeft = ({ size = 24, color }: P) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2.4}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M15 5l-7 7 7 7" />
  </Svg>
);

export const PlusIcon = ({ size = 84, color }: P) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2.4}
    strokeLinecap="round"
  >
    <Path d="M12 4v16" />
    <Path d="M4 12h16" />
  </Svg>
);

export const MinusIcon = ({ size = 24, color }: P) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2.6}
    strokeLinecap="round"
  >
    <Path d="M5 12h14" />
  </Svg>
);
