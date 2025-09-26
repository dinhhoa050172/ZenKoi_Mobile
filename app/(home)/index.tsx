import AnimatedBackground from "@/components/AnimatedBackground";
import BottomSheetModal from "@/components/BottomSheetModal";
import FishSvg from "@/components/icons/FishSvg";
import PondSvg from "@/components/icons/PondSvg";
import { router } from "expo-router";
import {
  AlertTriangle,
  Bell,
  Calendar,
  History
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Type definitions
interface Alert {
  id: number;
  type: string;
  message: string;
  severity: "warning" | "error";
}

interface QuickAction {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  route: string;
}

interface SummaryData {
  value: string;
  label: string;
  color: string;
}

// Alert Item Component
interface AlertItemProps {
  alert: Alert;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert }) => (
  <View className="bg-white p-3 rounded-lg mb-2 flex-row items-center justify-between">
    <Text className="text-sm text-gray-800 flex-1">{alert.message}</Text>
    <View
      className={`px-2 py-1 rounded ${
        alert.severity === "error" ? "bg-red-500" : "bg-orange-500"
      }`}
    >
      <Text className="text-white text-xs font-medium uppercase">
        {alert.severity === "error" ? "Nguy hiểm" : "Cảnh báo"}
      </Text>
    </View>
  </View>
);

// Quick Action Card Component
interface QuickActionCardProps {
  action: QuickAction;
  onPress: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ action, onPress }) => {
  const Icon = action.icon;
  return (
    <View className="w-1/2 p-2">
      <TouchableOpacity
        onPress={onPress}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 items-center"
        activeOpacity={0.7}
      >
          <View className="mb-3">
          <Icon size={40} color="#0A3D62" />
        </View>
        <Text className="font-semibold text-center text-gray-900">
          {action.title}
        </Text>
        <Text className="text-sm text-center text-gray-600 mt-1">
          {action.subtitle}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Summary Item Component
interface SummaryItemProps {
  item: SummaryData;
}

const SummaryItem: React.FC<SummaryItemProps> = ({ item }) => (
  <View className="w-1/2 p-2">
    <View className="bg-gray-100 rounded-lg p-4 items-center">
      <Text className={`text-2xl font-bold ${item.color}`}>{item.value}</Text>
      <Text className="text-sm text-gray-600 mt-1">{item.label}</Text>
    </View>
  </View>
);

// Main Component
const FarmStaffDashboard: React.FC = () => {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const insets = useSafeAreaInsets();

  const [alerts] = useState<Alert[]>([
    {
      id: 1,
      type: "water",
      message: "Ao A3 - pH quá cao (8.2)",
      severity: "warning",
    },
    {
      id: 2,
      type: "feeding",
      message: "Bể B2 chưa được cho ăn",
      severity: "error",
    },
  ]);

  const alertHistory: Alert[] = [
    {
      id: 1,
      type: "water",
      message: "Ao A3 - pH quá cao (8.2)",
      severity: "warning",
    },
    {
      id: 2,
      type: "feeding",
      message: "Bể B2 chưa được cho ăn",
      severity: "error",
    },
    {
      id: 3,
      type: "temperature",
      message: "Nhiệt độ ao C1 vượt ngưỡng (32°C)",
      severity: "warning",
    },
    {
      id: 4,
      type: "oxygen",
      message: "Oxy hòa tan thấp tại ao D4",
      severity: "error",
    },
  ];

  const notificationCount =
    alertHistory.length > 99 ? "99+" : alertHistory.length.toString();

  const quickActions: QuickAction[] = [
    {
      title: "Quản lý Cá Koi",
      subtitle: "Xem & quản lý cá Koi",
      icon: FishSvg,
      route: "/(home)/koi",
    },
    {
      title: "Quản lý Hồ",
      subtitle: "Theo dõi các chỉ số hồ",
      icon: PondSvg,
      route: "/(home)/water",
    },
    {
      title: "Sinh sản",
      subtitle: "Quản lý quá trình sinh sản",
      icon: History,
      route: "/(home)/breeding",
    },
    {
      title: "Lịch làm việc",
      subtitle: "Danh sách công việc hôm nay",
      icon: Calendar,
      route: "/(home)/tasks",
    },
  ];

  const summaryData: SummaryData[] = [
    { value: "127", label: "Tổng số cá Koi", color: "text-orange-600" },
    { value: "8", label: "Ao đang hoạt động", color: "text-orange-600" },
    { value: "3", label: "Cặp cá sinh sản", color: "text-green-600" },
    { value: "12", label: "Công việc hoàn thành", color: "text-green-600" },
  ];

  const handleActionPress = (route: string): void => {
    router.push(route as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "left", "right"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 60 }} showsVerticalScrollIndicator={false}>
        {/* Animated Background */}
        <View className="absolute inset-0">
          <AnimatedBackground />
        </View>

        <View className="relative z-10 p-4 space-y-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-3">
              <Image
                source={require("@/assets/images/Logo_ZenKoi.png")}
                className="w-12 h-12"
              />
              <View>
                <Text className="text-2xl font-bold text-gray-900">
                  ZenKoi Farm
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowHistoryModal(true)}
              className="p-2 rounded-full"
            >
              <Bell size={24} color="#0A3D62" />
              {alerts.length > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full px-1.5 min-w-[18px] items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Alerts */}
          {alerts.length > 0 && (
            <View className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <AlertTriangle size={20} color="red" />
                <Text className="text-lg font-semibold ml-2 text-red-600">
                  Cảnh báo hoạt động
                </Text>
              </View>
              {alerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </View>
          )}

          {/* Quick Actions */}
          <View className="flex-row flex-wrap -mx-2">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                action={action}
                onPress={() => handleActionPress(action.route)}
              />
            ))}
          </View>

          {/* Today's Summary */}
          <View className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
            <Text className="text-xl font-bold mb-2">Tổng quan hôm nay</Text>
            <Text className="text-gray-600 mb-4">
              Tóm tắt các hoạt động trong ngày
            </Text>

            <View className="flex-row flex-wrap -mx-2">
              {summaryData.map((item, index) => (
                <SummaryItem key={index} item={item} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Alert History Modal */}
      <BottomSheetModal
        visible={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Lịch sử cảnh báo"
      >
        {alertHistory.map((alert) => (
          <View
            key={alert.id}
            className="bg-white p-3 rounded-lg mb-2 flex-row justify-between border border-gray-200"
          >
            <Text className="text-sm text-gray-800 flex-1">
              {alert.message}
            </Text>
            <Text
              className={`text-xs font-medium px-2 py-1 rounded ${
                alert.severity === "error"
                  ? "bg-red-500 text-white"
                  : "bg-orange-500 text-white"
              }`}
            >
              {alert.severity === "error" ? "Nguy hiểm" : "Cảnh báo"}
            </Text>
          </View>
        ))}
      </BottomSheetModal>
    </SafeAreaView>
  );
};

export default FarmStaffDashboard;
