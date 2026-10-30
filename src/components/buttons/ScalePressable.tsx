import * as Haptics from "expo-haptics";
import React, { useCallback, useRef } from "react";
import {
  AccessibilityRole,
  AccessibilityState,
  Animated,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";

interface Props {
  testID?: string;
  onPress?: () => void;
  onLongPress?: () => void; // Ajout du long press
  delayLongPress?: number; // Optionnel : délai avant déclenchement
  /** Appelés en plus de l'animation (ex. défilement continu des − / +) */
  onPressIn?: () => void;
  onPressOut?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  hitSlop?:
    | { top: number; bottom: number; left: number; right: number }
    | number;

  haptic?: boolean;
  containerStyle?: StyleProp<ViewStyle>;

  // Accessibilité (VoiceOver / TalkBack)
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
}

export function ScalePressable({
  onPress,
  testID,
  onLongPress,
  delayLongPress = 500,
  onPressIn,
  onPressOut,
  containerStyle,
  children,
  style,
  disabled,
  hitSlop,
  haptic = true,
  accessibilityLabel,
  accessibilityRole = "button",
  accessibilityState,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const press = () => {
    Animated.spring(scale, {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 50,
    }).start();
    onPressIn?.();
  };

  const release = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
    onPressOut?.();
  };

  const handlePress = useCallback(() => {
    if (haptic) Haptics.selectionAsync();
    onPress?.();
  }, [haptic, onPress]);

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      style={containerStyle}
      onLongPress={onLongPress}
      delayLongPress={delayLongPress}
      onPressIn={press}
      onPressOut={release}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled, ...accessibilityState }}
    >
      <Animated.View
        style={[
          style,
          { transform: [{ scale }] },
          disabled && { opacity: 0.4 },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
