import { ChevronDown, ChevronUp, Clock } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface HistoryItem {
  id: string;
  action: string;
  time: string;
  details: string;
}

interface ActivityHistoryProps {
  pondId: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function ActivityHistory({
  pondId,
  isExpanded,
  onToggle,
}: ActivityHistoryProps) {
  // Mock data - replace with real API call later
  const historyData: HistoryItem[] = [
    {
      id: '1',
      action: 'Đo chất lượng nước',
      time: '2 giờ trước',
      details: 'pH: 7.2, Nhiệt độ: 24°C',
    },
    {
      id: '2',
      action: 'Cho ăn cá',
      time: '6 giờ trước',
      details: 'Thức ăn pellet 500g',
    },
    {
      id: '3',
      action: 'Thêm cá mới',
      time: '1 ngày trước',
      details: 'Thêm 3 cá Koi Kohaku',
    },
    {
      id: '4',
      action: 'Vệ sinh hồ',
      time: '3 ngày trước',
      details: 'Thay 20% nước, vệ sinh bộ lọc',
    },
  ];

  return (
    <View className="mb-4 rounded-2xl bg-white shadow-sm">
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between p-4"
      >
        <Text className="text-lg font-semibold text-gray-900">
          Lịch sử hoạt động
        </Text>
        {isExpanded ? (
          <ChevronUp size={20} color="#6b7280" />
        ) : (
          <ChevronDown size={20} color="#6b7280" />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View className="px-4 pb-4">
          <View className="space-y-3">
            {historyData.map((item) => (
              <View key={item.id} className="flex-row items-start space-x-3">
                <View className="mt-1 h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Clock size={14} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">
                    {item.action}
                  </Text>
                  <Text className="text-sm text-gray-600">{item.details}</Text>
                  <Text className="mt-1 text-xs text-gray-500">
                    {item.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity className="mt-4 py-2">
            <Text className="text-center font-medium text-blue-500">
              Xem tất cả lịch sử
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
