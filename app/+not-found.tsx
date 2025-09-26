import { Link, router, Stack } from 'expo-router';
import { ArrowLeft, Home } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Component cá Koi bơi lạc lối
const LostKoiFish = ({ 
  delay = 0, 
  startX = 0, 
  startY = 0,
  color = '#ea580c' 
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
          className="w-16 h-10 rounded-full relative opacity-70"
          style={{ backgroundColor: color }}
        >
          {/* Gradient overlay */}
          <View className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 rounded-full" />
          
          {/* Đuôi cá */}
          <View 
            className="absolute -right-4 top-1 w-6 h-8 rounded-l-full"
            style={{ backgroundColor: color }}
          />
          <View 
            className="absolute -right-3 top-4 w-4 h-5 rounded-l-full opacity-80"
            style={{ backgroundColor: color }}
          />
          
          {/* Vây lưng */}
          <View 
            className="absolute top-0 left-3 w-3 h-4 rounded-t-full"
            style={{ backgroundColor: color }}
          />
          
          {/* Vây bụng */}
          <View 
            className="absolute bottom-0 left-4 w-2 h-3 rounded-b-full opacity-80"
            style={{ backgroundColor: color }}
          />
          
          {/* Mắt */}
          <View className="absolute top-2 left-3 w-3 h-3 bg-white rounded-full">
            <View className="absolute top-0.5 left-0.5 w-2 h-2 bg-black rounded-full">
              <View className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-white rounded-full" />
            </View>
          </View>
          
          {/* Vây ngực */}
          <View 
            className="absolute left-1 top-3 w-2 h-3 rounded-l-full opacity-60"
            style={{ backgroundColor: color }}
          />
        </View>
        
        {/* Bong bóng confusion */}
        <View className="absolute -top-2 -right-1 w-2 h-2 bg-blue-200 rounded-full opacity-50" />
        <View className="absolute -top-4 right-2 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-40" />
        <View className="absolute -top-6 right-0 w-1 h-1 bg-blue-400 rounded-full opacity-30" />
      </View>
    </Animated.View>
  );
};

// Component số 404 với hiệu ứng nước
const WaterNumber = ({ number, delay = 0 }: { number: string; delay?: number }) => {
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
      <Text className="text-8xl font-bold text-primary/20 tracking-wider">
        {number}
      </Text>
      {/* Water ripple effect */}
      <View className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-blue-200 rounded-full opacity-30" />
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
      <Stack.Screen options={{ title: 'Trang không tồn tại', headerShown: false }} />
      
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
          <View className="absolute bottom-0 left-0 right-0 h-20 bg-blue-100 opacity-20 rounded-t-full" />
          <View className="absolute bottom-4 left-4 right-4 h-16 bg-blue-200 opacity-15 rounded-t-full" />
          <View className="absolute bottom-8 left-8 right-8 h-12 bg-blue-300 opacity-10 rounded-t-full" />
        </View>
      </View>

      {/* Main content */}
      <View className="flex-1 justify-center items-center px-8 relative z-10">
        <Animated.View
          style={{
            opacity: fadeIn,
            transform: [{ translateY: slideUp }],
          }}
          className="items-center"
        >
          {/* 404 Numbers với hiệu ứng nước */}
          <View className="flex-row items-center mb-8">
            <WaterNumber number="4" delay={200} />
            <View className="mx-2">
              {/* Koi fish icon giữa số 0 */}
              <View className="w-20 h-20 relative">
                <View className="absolute inset-0 border-8 border-primary/30 rounded-full" />
                <View className="absolute inset-2 items-center justify-center">
                  <View className="w-10 h-6 bg-primary rounded-full relative">
                    <View className="absolute -right-2 top-1 w-3 h-4 bg-primary rounded-l-full" />
                    <View className="absolute top-1 left-2 w-1.5 h-1.5 bg-white rounded-full" />
                  </View>
                </View>
              </View>
            </View>
            <WaterNumber number="4" delay={600} />
          </View>

          {/* Error message */}
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-foreground mb-2 text-center">
              Opps! Cá Koi bị lạc đường rồi
            </Text>
            <Text className="text-lg text-muted-foreground text-center leading-6 px-4">
              Trang bạn đang tìm không tồn tại trong ao ZenKoi này.
            </Text>
            <Text className="text-base text-muted-foreground text-center mt-2 px-4">
              Có vẻ như những chú cá Koi đã bơi nhầm đường!
            </Text>
          </View>

          {/* Action buttons */}
          <View className="w-full max-w-sm">
            {/* Home button */}
            <Link href="/(home)" asChild>
              <TouchableOpacity className="bg-primary rounded-2xl py-4 px-6 flex-row items-center justify-center shadow-lg mb-2">
                <Home size={24} color="white" />
                <Text className="text-primary-foreground font-semibold text-lg ml-2">
                  Về trang chủ
                </Text>
              </TouchableOpacity>
            </Link>

            {/* Back button */}
            <TouchableOpacity 
              className="bg-card border border-border rounded-2xl py-4 px-6 flex-row items-center justify-center"
              onPress={() => { router.back(); }}
            >
              <ArrowLeft size={24} color="#ea580c" />
              <Text className="text-primary font-semibold text-lg ml-2">
                Quay lại
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fun message */}
          <View className="mt-8 bg-orange-50 border border-orange-200 rounded-xl p-4 mx-4">
            <Text className="text-orange-800 text-center text-sm italic">
              💡 Mẹo: Cá Koi bơi theo dòng nước, hãy theo dòng navigation để không bị lạc!
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Floating lily pads decoration */}
      <View className="absolute top-20 right-8">
        <View className="w-12 h-12 bg-green-200 rounded-full opacity-30" />
        <View className="absolute top-2 right-2 w-8 h-8 bg-green-300 rounded-full opacity-40" />
      </View>
      
      <View className="absolute top-40 left-12">
        <View className="w-10 h-10 bg-green-200 rounded-full opacity-25" />
        <View className="absolute top-1 left-1 w-6 h-6 bg-green-300 rounded-full opacity-35" />
      </View>

      <View className="absolute bottom-32 right-16">
        <View className="w-14 h-14 bg-green-100 rounded-full opacity-20" />
        <View className="absolute top-3 right-3 w-8 h-8 bg-green-200 rounded-full opacity-30" />
      </View>
    </SafeAreaView>
  );
}