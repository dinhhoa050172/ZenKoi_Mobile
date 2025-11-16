import AnimatedBackground from '@/components/AnimatedBackground';
import WaterAlertBottomSheet from '@/components/WaterAlertBottomSheet';
import FishSvg from '@/components/icons/FishSvg';
import PondSvg from '@/components/icons/PondSvg';
import {
  useGetFarmQuickStats,
  useGetFarmStatistics,
} from '@/hooks/useFarmDashboard';
import { useGetWaterAlerts } from '@/hooks/useWaterAlert';
import { Severity, WaterAlert } from '@/lib/api/services/fetchWaterAlert';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { AlertTriangle, Bell, Calendar, History } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

interface QuickAction {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  route: string;
  gradient: string[];
}

interface SummaryData {
  value: string;
  label: string;
  gradient: [string, string];
  icon: string;
}

// Alert Item Component
interface AlertItemProps {
  alert: WaterAlert;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert }) => {
  const severity = alert.severity;
  let bgClass = 'bg-orange-500';
  let label = 'Cảnh báo';

  if (severity === Severity.HIGH || severity === Severity.URGENT) {
    bgClass = 'bg-red-500';
    label = 'Nguy hiểm';
  } else if (severity === Severity.MEDIUM) {
    bgClass = 'bg-orange-500';
    label = 'Cảnh báo';
  } else if (severity === Severity.LOW) {
    bgClass = 'bg-yellow-500';
    label = 'Thấp';
  }

  return (
    <View className="mb-2 flex-row items-center justify-between rounded-lg bg-white p-3">
      <Text className="flex-1 text-sm text-gray-800">{alert.message}</Text>
      <View className={`rounded px-2 py-1 ${bgClass}`}>
        <Text className="text-xs font-medium uppercase text-white">
          {label}
        </Text>
      </View>
    </View>
  );
};

// Quick Action Card Component
interface QuickActionCardProps {
  action: QuickAction;
  onPress: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  action,
  onPress,
}) => {
  const Icon = action.icon;
  return (
    <View className="w-1/2 p-1.5">
      <TouchableOpacity
        onPress={onPress}
        className="overflow-hidden rounded-2xl bg-white shadow-md"
        activeOpacity={0.8}
        style={{
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }}
      >
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          className="items-center justify-center p-5"
        >
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
            <Icon size={40} color="#0A3D62" />
          </View>
          <Text className="mt-2 text-center text-base font-bold text-gray-900">
            {action.title}
          </Text>
          <Text className="mt-1 text-center text-sm leading-4 text-gray-500">
            {action.subtitle}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// Summary Item Component
interface SummaryItemProps {
  item: SummaryData;
}

const SummaryItem: React.FC<SummaryItemProps> = ({ item }) => (
  <View className="w-1/2 p-1.5">
    <LinearGradient
      colors={item.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="overflow-hidden rounded-2xl p-4"
      style={{
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      }}
    >
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-3xl font-black text-white">{item.value}</Text>
        <Text className="text-2xl">{item.icon}</Text>
      </View>
      <Text className="text-xs font-medium uppercase tracking-wide text-white/90">
        {item.label}
      </Text>
    </LinearGradient>
  </View>
);

// Main Component
const FarmStaffDashboard: React.FC = () => {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const insets = useSafeAreaInsets();
  // fetch water alerts and show the 2 most recent entries client-side
  const alertsQuery = useGetWaterAlerts({ pageIndex: 1, pageSize: 100 }, true);
  const alerts = (alertsQuery.data?.data || []).slice(0, 2);
  const notificationCount =
    (alertsQuery.data?.data.length || 0) > 99
      ? '99+'
      : alertsQuery.data?.data.length.toString();

  useFocusEffect(
    useCallback(() => {
      alertsQuery.refetch?.();
      return undefined;
    }, [alertsQuery])
  );

  const quickActions: QuickAction[] = [
    {
      title: 'Quản lý Cá Koi',
      subtitle: 'Xem & quản lý cá Koi',
      icon: FishSvg,
      route: '/(home)/koi',
      gradient: ['#0ea5e9', '#0284c7'],
    },
    {
      title: 'Quản lý Hồ',
      subtitle: 'Theo dõi các chỉ số hồ',
      icon: PondSvg,
      route: '/(home)/water',
      gradient: ['#06b6d4', '#0891b2'],
    },
    {
      title: 'Sinh sản',
      subtitle: 'Quản lý quá trình sinh sản',
      icon: History,
      route: '/(home)/breeding',
      gradient: ['#8b5cf6', '#7c3aed'],
    },
    {
      title: 'Lịch làm việc',
      subtitle: 'Danh sách công việc',
      icon: Calendar,
      route: '/(home)/tasks',
      gradient: ['#ec4899', '#db2777'],
    },
    {
      title: 'Sự cố & Cảnh báo',
      subtitle: 'Xem và quản lý sự cố',
      icon: AlertTriangle,
      route: '/(home)/incidents',
      gradient: ['#f59e0b', '#d97706'],
    },
  ];

  // Farm dashboard queries
  const statsQuery = useGetFarmStatistics(true);
  const quickStatsQuery = useGetFarmQuickStats(true);

  const stats = statsQuery.data;
  const quick = quickStatsQuery.data;

  const summaryData: SummaryData[] = [
    {
      value: stats ? String(stats.totalKoi.current) : '—',
      label: 'Tổng số cá Koi',
      gradient: ['#f97316', '#ea580c'] as [string, string],
      icon: '🐟',
    },
    {
      value: stats ? String(stats.pondsInUse.current) : '—',
      label: 'Ao đang hoạt động',
      gradient: ['#0ea5e9', '#0284c7'] as [string, string],
      icon: '💧',
    },
    {
      value: quick ? String(quick.activeBreedingProcesses) : '—',
      label: 'Cặp cá sinh sản',
      gradient: ['#10b981', '#059669'] as [string, string],
      icon: '💚',
    },
    {
      value: stats ? String(quick?.activeBreedingProcesses) : '—',
      label: 'Quá trình sinh sản',
      gradient: ['#8b5cf6', '#7c3aed'] as [string, string],
      icon: '✅',
    },
  ];

  const handleActionPress = (route: string): void => {
    router.push(route as any);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50"
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 70 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Background */}
        <View className="absolute inset-0">
          <AnimatedBackground />
        </View>

        <View className="relative z-10 space-y-6 p-4">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-3">
              <Image
                source={require('@/assets/images/Logo_ZenKoi.png')}
                className="h-14 w-14"
              />
              <View>
                <Text className="text-3xl font-bold text-gray-900">
                  ZenKoi Farm
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowHistoryModal(true)}
              className="rounded-full p-2"
            >
              <Bell size={24} color="#0A3D62" />
              {alerts.length > 0 && (
                <View className="absolute -right-1 -top-1 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5">
                  <Text className="text-xs font-bold text-white">
                    {notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Alerts */}
          {alertsQuery.isLoading ? (
            <View className="items-center rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <ActivityIndicator />
              <Text className="mt-2 text-sm text-gray-600">
                Đang tải cảnh báo...
              </Text>
            </View>
          ) : alerts.length > 0 ? (
            <View className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <View className="mb-3 flex-row items-center">
                <AlertTriangle size={20} color="red" />
                <Text className="ml-2 text-lg font-semibold text-red-600">
                  Cảnh báo hoạt động
                </Text>
              </View>
              {alerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </View>
          ) : null}

          {/* Quick Actions */}
          <View className="-mx-2 mb-2 flex-row flex-wrap">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                action={action}
                onPress={() => handleActionPress(action.route)}
              />
            ))}
          </View>

          {/* Today's Summary */}
          <View
            className="overflow-hidden rounded-2xl bg-white p-5 shadow-md"
            style={{ elevation: 3 }}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-black text-gray-900">
                  Tổng quan hôm nay
                </Text>
                <Text className="mt-1 text-sm text-gray-500">
                  Tóm tắt các hoạt động trong ngày
                </Text>
              </View>
              <Text className="text-3xl">📊</Text>
            </View>

            {/* Summary items */}
            <View className="-mx-2 flex-row flex-wrap">
              {summaryData.map((item, index) => (
                <SummaryItem key={index} item={item} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Water alerts bottom sheet */}
      <WaterAlertBottomSheet
        visible={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </SafeAreaView>
  );
};

export default FarmStaffDashboard;
