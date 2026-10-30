import { ScalePressable } from "@/src/components/buttons/ScalePressable";
import { MinusIcon, PlusIcon } from "@/src/components/Icons";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useRepeatPress } from "@/src/hooks/useRepeatPress";

interface Props {
  kind: "minus" | "plus";
  label: string;
  disabled: boolean;
  onStep: () => void;
}

/** Bouton rond − ou + : un appui = un cran, appui long = défilement continu. */
export function StepButton({ kind, label, disabled, onStep }: Props) {
  const { colors, SCALE } = useTheme();
  const repeat = useRepeatPress(onStep);
  const size = 56 * SCALE;

  return (
    <ScalePressable
      accessibilityLabel={label}
      disabled={disabled}
      onPress={repeat.onPress}
      onLongPress={repeat.onLongPress}
      onPressOut={repeat.onPressOut}
      delayLongPress={350}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.card2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {kind === "minus" ? (
        <MinusIcon color={colors.foreground} />
      ) : (
        <PlusIcon size={24} color={colors.foreground} />
      )}
    </ScalePressable>
  );
}
