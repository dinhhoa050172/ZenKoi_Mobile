import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, Easing, View } from "react-native";

const { width, height } = Dimensions.get("window");

const KoiFish = ({
  delay = 0,
  duration = 15000,
  startX = -100,
  endX = width + 100,
  yPosition = height / 2,
  size = 60,
  color = "#FF6B6B",
  verticalShift = 0,
}: {
  delay?: number;
  duration?: number;
  startX?: number;
  endX?: number;
  yPosition?: number;
  size?: number;
  color?: string;
  verticalShift?: number;
}) => {
  const animatedX = useRef(new Animated.Value(startX)).current;
  // animatedY is the small bob (local float). animatedSwimY controls the main swim path.
  const animatedY = useRef(new Animated.Value(0)).current;
  const animatedSwimY = useRef(new Animated.Value(0)).current;
  const animatedRotate = useRef(new Animated.Value(0)).current;
  const animatedScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initialize swim Y position. Use provided yPosition as swim start if available,
    // otherwise start slightly off-screen at bottom.
  // start from off-screen bottom so fishes swim bottom -> top
  const swimStartY = height + 100;
  // keep deltaX == deltaY for ~45deg but clamp so fish don't go offscreen
  const rawEndY = swimStartY - (endX - startX);
  // apply verticalShift to move the swim endpoint upward if requested
  const swimEndY = Math.max(40, Math.min(height - 40, rawEndY - verticalShift));
    animatedSwimY.setValue(swimStartY);

    // Swim animation (bottom-left -> top-right -> back)
     
    const swimAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        // Ensure sprite faces the swim direction before moving
        Animated.timing(animatedScale, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        // Move diagonally up-right (endX, swimEndY)
        Animated.parallel([
          Animated.timing(animatedX, {
            toValue: endX,
            duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animatedSwimY, {
            toValue: swimEndY,
            duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        // Flip to face the opposite direction
        Animated.timing(animatedScale, {
          toValue: -1,
          duration: 120,
          useNativeDriver: true,
        }),
        // Move back diagonally down-left to start
        Animated.parallel([
          Animated.timing(animatedX, {
            toValue: startX,
            duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animatedSwimY, {
            toValue: swimStartY,
            duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Tail wagging
    const wagTail = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedRotate, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(animatedRotate, {
          toValue: -1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    // Floating up & down (smaller amplitude + slight random phase)
    const floatAmplitude = Math.random() * 12 + 8; // 8-20
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedY, {
          toValue: -floatAmplitude,
          duration: 2500 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedY, {
          toValue: floatAmplitude,
          duration: 2500 + Math.random() * 1000,
          useNativeDriver: true,
        }),
      ])
    );

  swimAnimation.start();
    wagTail.start();
    floatAnimation.start();

    return () => {
      swimAnimation.stop();
      wagTail.stop();
      floatAnimation.stop();
    };
  }, []);

  const rotate = animatedRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-5deg", "5deg"],
  });

  // rotate the GIF based on swim direction (animatedScale = 1 -> forward/up-right, -1 -> return)
  const gifRotate = animatedScale.interpolate({
    inputRange: [-1, 1],
    outputRange: ["180deg", "90deg"],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        transform: [
          { translateX: animatedX },
          // combine main swim Y and small bobbing Y
          { translateY: animatedSwimY },
          { translateY: animatedY },
          { rotate },
          { scaleX: animatedScale },
        ],
      }}
    >
      {/* Use koi-fish.gif from assets as the fish sprite; rotate according to swim direction */}
      <Animated.Image
        source={require("@/assets/videos/koi-fish-nobg.gif")}
        style={{ width: size, height: size * 0.6, transform: [{ rotate: gifRotate }] }}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

// Bubble component
const Bubble = ({ delay = 0 }: { delay?: number }) => {
  const animatedY = useRef(new Animated.Value(height)).current;
  const animatedX = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  const randomX = useMemo(() => Math.random() * width, []);
  const size = useMemo(() => 8 + Math.random() * 12, []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(animatedY, {
            toValue: -50,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(animatedOpacity, {
              toValue: 0.6,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(animatedOpacity, {
              toValue: 0,
              duration: 1000,
              delay: 6000,
              useNativeDriver: true,
            }),
          ]),
          Animated.loop(
            Animated.sequence([
              Animated.timing(animatedX, {
                toValue: 10,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(animatedX, {
                toValue: -10,
                duration: 2000,
                useNativeDriver: true,
              }),
            ])
          ),
        ]),
        Animated.timing(animatedY, {
          toValue: height,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: randomX,
        transform: [{ translateY: animatedY }, { translateX: animatedX }],
        opacity: animatedOpacity,
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#E3F2FD",
          borderWidth: 1,
          borderColor: "#90CAF9",
        }}
      />
    </Animated.View>
  );
};

export default function AnimatedBackground() {
  return (
    <View style={{ position: "absolute", inset: 0 }}>
      <View
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(59,130,246,0.06)",
        }}
      />
      <KoiFish
        delay={0}
        duration={20000}
        yPosition={height * 0.2}
        size={80}
        color="#FF6B6B"
        verticalShift={80}
      />
      <KoiFish
        delay={3000}
        duration={25000}
        yPosition={height * 0.4}
        size={60}
        color="#4ECDC4"
        verticalShift={80}
      />
      <KoiFish
        delay={6000}
        duration={18000}
        yPosition={height * 0.6}
        size={70}
        color="#FFE66D"
        verticalShift={80}
      />
      <KoiFish
        delay={9000}
        duration={22000}
        yPosition={height * 0.8}
        size={65}
        color="#FF8B94"
        verticalShift={80}
      />
      <KoiFish
        delay={12000}
        duration={19000}
        yPosition={height * 0.3}
        size={75}
        color="#B4A7D6"
        verticalShift={80}
      />
      {[0, 2000, 4000, 6000, 8000].map((d, i) => (
        <Bubble key={i} delay={d} />
      ))}
    </View>
  );
}
