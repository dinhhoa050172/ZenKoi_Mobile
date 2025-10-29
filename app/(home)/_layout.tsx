import { HapticTab } from '@/components/HapticTab';
import FishSvg from '@/components/icons/FishSvg';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { History, Home, QrCode, User } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Platform, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const tabBarHeight = 70;

// Custom Tab Bar Background
const CustomTabBarBackground = () => {
  // Các thông số cho phần lõm
  const center = width / 2;
  const notchRadius = 40; // Độ sâu và bán kính lõm, nên lớn hơn bán kính button một chút
  const notchWidth = 92; // Độ rộng của phần lõm

  // Tính toán các điểm cho path
  const leftNotch = center - notchWidth / 2;
  const rightNotch = center + notchWidth / 2;
  const notchDepth = 43; // Độ sâu của phần lõm

  const path = `
    M0 0
    Q${leftNotch / 2} 0, ${leftNotch} 0
    C${leftNotch + 5} 0, ${center - notchRadius} ${notchDepth}, ${center} ${notchDepth}
    C${center + notchRadius} ${notchDepth}, ${rightNotch - 5} 0, ${rightNotch} 0
    Q${width - (width - rightNotch) / 2} 0, ${width} 0
    V${tabBarHeight}
    H0
    Z
  `;

  return (
    <View style={{ position: 'absolute', inset: 0 }}>
      <Svg
        width={width}
        height={tabBarHeight}
        viewBox={`0 0 ${width} ${tabBarHeight}`}
        preserveAspectRatio="none"
      >
        <Path d={path} fill="white" stroke="#e5e7eb" strokeWidth={1} />
      </Svg>
    </View>
  );
};

// Center Tab Button (QR)
const CenterTabButton = ({ children, onPress }: any) => {
  return (
    <View style={{ top: -30, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        <LinearGradient
          colors={['#0A3D62', '#1e5f8a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {children}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0A3D62',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarButton: (props) => <HapticTab {...(props as any)} />,
        tabBarBackground: CustomTabBarBackground,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 20,
          right: 20,
          height: tabBarHeight,
          backgroundColor: 'transparent',
          borderRadius: 30,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          paddingBottom: Platform.OS === 'ios' ? 25 : 15,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIconStyle: { marginLeft: 20, marginTop: 10 },
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => (
            <Home
              size={focused ? 26 : 24}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />

      {/* Koi */}
      <Tabs.Screen
        name="koi/index"
        options={{
          title: 'Cá Koi',
          tabBarIcon: ({ color, focused }) => (
            <FishSvg size={focused ? 26 : 24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="koi/[id]"
        options={{
          href: null,
          title: 'Chi tiết cá Koi',
        }}
      />

      <Tabs.Screen
        name="koi/add/index"
        options={{
          href: null,
          title: 'Thêm cá Koi',
        }}
      />

      <Tabs.Screen
        name="koi/edit/index"
        options={{
          href: null,
          title: 'Chi tiết cá Koi',
        }}
      />

      {/* Scan QR */}
      <Tabs.Screen
        name="scan/index"
        options={{
          title: '',
          tabBarIcon: () => (
            <QrCode size={32} color="white" strokeWidth={2.5} />
          ),
          tabBarButton: (props) => (
            <CenterTabButton {...props}>
              <QrCode size={32} color="white" strokeWidth={2.5} />
            </CenterTabButton>
          ),
        }}
      />

      {/* History */}
      <Tabs.Screen
        name="breeding/index"
        options={{
          title: 'Sinh sản',
          tabBarIcon: ({ color, focused }) => (
            <History
              size={focused ? 26 : 24}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="breeding/[id]/index"
        options={{
          href: null,
          title: 'Chi tiết sinh sản',
        }}
      />

      <Tabs.Screen
        name="breeding/[id]/fish-list/index"
        options={{
          href: null,
          title: 'Danh sách cá định danh',
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color, focused }) => (
            <User
              size={focused ? 26 : 24}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="tasks/index"
        options={{
          href: null,
          title: 'Nhiệm vụ',
        }}
      />

      <Tabs.Screen
        name="water/index"
        options={{
          href: null,
          title: 'Danh sách hồ cá',
        }}
      />

      <Tabs.Screen
        name="water/[id]"
        options={{
          href: null,
          title: 'Chi tiết hồ cá',
        }}
      />

      <Tabs.Screen
        name="pond/index"
        options={{ href: null, title: 'Danh sách loại hồ' }}
      />
    </Tabs>
  );
}
