import { X } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number;
}

const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  visible,
  onClose,
  title = 'Chi tiết',
  children,
  height = 80,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;

  // Calculate actual height based on percentage
  const screenHeight = Dimensions.get('window').height;
  const modalHeight = (screenHeight * height) / 100;

  useEffect(() => {
    if (visible) {
      // Reset panY to 0 when modal opens to prevent position issues from previous drag gestures
      panY.setValue(0);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, panY, slideAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120) {
          onClose();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [modalHeight, 0],
  });

  if (!visible) return null;

  return (
    <>
      {/* Overlay Background */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999998,
          elevation: 998,
          opacity: slideAnim,
        }}
      />

      {/* Bottom Sheet */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: modalHeight,
          backgroundColor: 'white',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          transform: [{ translateY }, { translateY: panY }],
          zIndex: 999999,
          elevation: 999,
        }}
        {...panResponder.panHandlers}
      >
        {/* Drag handle */}
        <View className="mb-2 mt-3 h-1.5 w-12 self-center rounded-full bg-gray-300" />

        {/* Header */}
        <View className="mb-4 flex-row items-center justify-between px-6">
          <Text className="text-xl font-bold">{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="red" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView className="px-4">{children}</ScrollView>
      </Animated.View>
    </>
  );
};

export default BottomSheetModal;
