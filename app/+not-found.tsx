import { Link, router, Stack } from 'expo-router';
import { ArrowLeft, Home } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Component cá Koi bơi lạc lối
const LostKoiFish = ({
  delay = 0,
  startX = 0,
  startY = 0,
  color = '#ea580c',
}: {
  delay?: number;
  startX?: number;
  startY?: number;
  color?: string;
}) => {
  const translateX = useRef(new Animated.Value(startX)).current;
  const translateY = useRef(new Animated.Value(startY)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createLostAnimation = () => {
      // Animation cá bơi lạc hướng - zigzag pattern
      const zigzagAnimation = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: Math.random() * (width - 100),
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: Math.random() * (height * 0.6) + 100,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
            Animated.timing(rotation, {
              toValue: Math.random() * 360,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(scale, {
            toValue: 0.8 + Math.random() * 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      zigzagAnimation.start();
    };

    createLostAnimation();
  }, [delay]);

  const rotateInterpolation = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      className="absolute"
      style={{
        transform: [
          { translateX },
          { translateY },
          { rotate: rotateInterpolation },
          { scale },
        ],
      }}
    >
      {/* Cá Koi với design chi tiết hơn */}
      <View className="relative">
        {/* Thân cá chính */}
        <View
          className="relative h-10 w-16 rounded-full opacity-70"
          style={{ backgroundColor: color }}
        >
          {/* Gradient overlay */}
          <View className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-600 to-orange-400" />

          {/* Đuôi cá */}
          <View
            className="absolute -right-4 top-1 h-8 w-6 rounded-l-full"
            style={{ backgroundColor: color }}
          />
          <View
            className="absolute -right-3 top-4 h-5 w-4 rounded-l-full opacity-80"
            style={{ backgroundColor: color }}
          />

          {/* Vây lưng */}
          <View
            className="absolute left-3 top-0 h-4 w-3 rounded-t-full"
            style={{ backgroundColor: color }}
          />

          {/* Vây bụng */}
          <View
            className="absolute bottom-0 left-4 h-3 w-2 rounded-b-full opacity-80"
            style={{ backgroundColor: color }}
          />

          {/* Mắt */}
          <View className="absolute left-3 top-2 h-3 w-3 rounded-full bg-white">
            <View className="absolute left-0.5 top-0.5 h-2 w-2 rounded-full bg-black">
              <View className="absolute left-0.5 top-0.5 h-0.5 w-0.5 rounded-full bg-white" />
            </View>
          </View>

          {/* Vây ngực */}
          <View
            className="absolute left-1 top-3 h-3 w-2 rounded-l-full opacity-60"
            style={{ backgroundColor: color }}
          />
        </View>

        {/* Bong bóng confusion */}
        <View className="absolute -right-1 -top-2 h-2 w-2 rounded-full bg-blue-200 opacity-50" />
        <View className="absolute -top-4 right-2 h-1.5 w-1.5 rounded-full bg-blue-300 opacity-40" />
        <View className="absolute -top-6 right-0 h-1 w-1 rounded-full bg-blue-400 opacity-30" />
      </View>
    </Animated.View>
  );
};

// Component số 404 với hiệu ứng nước
const WaterNumber = ({
  number,
  delay = 0,
}: {
  number: string;
  delay?: number;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(opacity, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ scale }, { translateY }],
      }}
    >
      <Text className="text-8xl font-bold tracking-wider text-primary/20">
        {number}
      </Text>
      {/* Water ripple effect */}
      <View className="absolute -bottom-2 left-1/2 h-2 w-16 -translate-x-1/2 transform rounded-full bg-blue-200 opacity-30" />
    </Animated.View>
  );
};

export default function NotFoundScreen() {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Stack.Screen
        options={{ title: 'Trang không tồn tại', headerShown: false }}
      />

      {/* Background với cá Koi bơi lạc */}
      <View className="absolute inset-0">
        {/* Nhiều cá Koi với màu sắc và timing khác nhau */}
        <LostKoiFish delay={0} startX={50} startY={100} color="#ea580c" />
        <LostKoiFish delay={1000} startX={200} startY={200} color="#0A3D62" />
        <LostKoiFish delay={2000} startX={100} startY={300} color="#fb923c" />
        <LostKoiFish delay={1500} startX={250} startY={150} color="#fdba74" />
        <LostKoiFish delay={3000} startX={80} startY={400} color="#ea580c" />

        {/* Pond ripples */}
        <View className="absolute bottom-0 left-0 right-0 h-32">
          <View className="absolute bottom-0 left-0 right-0 h-20 rounded-t-full bg-blue-100 opacity-20" />
          <View className="absolute bottom-4 left-4 right-4 h-16 rounded-t-full bg-blue-200 opacity-15" />
          <View className="absolute bottom-8 left-8 right-8 h-12 rounded-t-full bg-blue-300 opacity-10" />
        </View>
      </View>

      {/* Main content */}
      <View className="relative z-10 flex-1 items-center justify-center px-8">
        <Animated.View
          style={{
            opacity: fadeIn,
            transform: [{ translateY: slideUp }],
          }}
          className="items-center"
        >
          {/* 404 Numbers với hiệu ứng nước */}
          <View className="mb-8 flex-row items-center">
            <WaterNumber number="4" delay={200} />
            <View className="mx-2">
              {/* Koi fish icon giữa số 0 */}
              <View className="relative h-20 w-20">
                <View className="absolute inset-0 rounded-full border-8 border-primary/30" />
                <View className="absolute inset-2 items-center justify-center">
                  <View className="relative h-6 w-10 rounded-full bg-primary">
                    <View className="absolute -right-2 top-1 h-4 w-3 rounded-l-full bg-primary" />
                    <View className="absolute left-2 top-1 h-1.5 w-1.5 rounded-full bg-white" />
                  </View>
                </View>
              </View>
            </View>
            <WaterNumber number="4" delay={600} />
          </View>

          {/* Error message */}
          <View className="mb-8 items-center">
            <Text className="mb-2 text-center text-2xl font-bold text-foreground">
              Opps! Cá Koi bị lạc đường rồi
            </Text>
            <Text className="px-4 text-center text-lg leading-6 text-muted-foreground">
              Trang bạn đang tìm không tồn tại trong ao ZenKoi này.
            </Text>
            <Text className="mt-2 px-4 text-center text-base text-muted-foreground">
              Có vẻ như những chú cá Koi đã bơi nhầm đường!
            </Text>
          </View>

          {/* Action buttons */}
          <View className="w-full max-w-sm">
            {/* Home button */}
            <Link href="/(home)" asChild>
              <TouchableOpacity className="mb-2 flex-row items-center justify-center rounded-2xl bg-primary px-6 py-4 shadow-lg">
                <Home size={24} color="white" />
                <Text className="ml-2 text-lg font-semibold text-primary-foreground">
                  Về trang chủ
                </Text>
              </TouchableOpacity>
            </Link>

            {/* Back button */}
            <TouchableOpacity
              className="flex-row items-center justify-center rounded-2xl border border-border bg-card px-6 py-4"
              onPress={() => {
                router.back();
              }}
            >
              <ArrowLeft size={24} color="#ea580c" />
              <Text className="ml-2 text-lg font-semibold text-primary">
                Quay lại
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fun message */}
          <View className="mx-4 mt-8 rounded-xl border border-orange-200 bg-orange-50 p-4">
            <Text className="text-center text-sm italic text-orange-800">
              💡 Mẹo: Cá Koi bơi theo dòng nước, hãy theo dòng navigation để
              không bị lạc!
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Floating lily pads decoration */}
      <View className="absolute right-8 top-20">
        <View className="h-12 w-12 rounded-full bg-green-200 opacity-30" />
        <View className="absolute right-2 top-2 h-8 w-8 rounded-full bg-green-300 opacity-40" />
      </View>

      <View className="absolute left-12 top-40">
        <View className="h-10 w-10 rounded-full bg-green-200 opacity-25" />
        <View className="absolute left-1 top-1 h-6 w-6 rounded-full bg-green-300 opacity-35" />
      </View>

      <View className="absolute bottom-32 right-16">
        <View className="h-14 w-14 rounded-full bg-green-100 opacity-20" />
        <View className="absolute right-3 top-3 h-8 w-8 rounded-full bg-green-200 opacity-30" />
      </View>
    </SafeAreaView>
  );
}
