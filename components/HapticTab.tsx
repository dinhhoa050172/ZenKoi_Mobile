import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import React from "react";
import { TouchableWithoutFeedback, View } from "react-native";

export function HapticTab(props: BottomTabBarButtonProps): React.ReactNode {
  return (
    <TouchableWithoutFeedback
      onPress={(ev) => {
        if (process.env.EXPO_OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPress?.(ev);
      }}
    >
      <View>{props.children}</View>
    </TouchableWithoutFeedback>
  );
}
