import { useGetFishOfPond } from '@/hooks/usePond';
import { router } from 'expo-router';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface FishManagementProps {
  pondId: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function FishManagement({
  pondId,
  isExpanded,
  onToggle,
}: FishManagementProps) {
  const [showAllFish, setShowAllFish] = useState(false);
  // const [, setShowAddFishForm] = useState(false);
  // const [, setShowRemoveFishForm] = useState(false);

  // Fetch fish list for this pond
  const { data: fishData, isLoading } = useGetFishOfPond(pondId, !!pondId);

  const mapHealthToBadge = (health?: string) => {
    switch (health) {
      case 'Healthy':
        return { wrapper: 'bg-green-100 text-green-800', text: 'Khỏe mạnh' };
      case 'Warning':
        return { wrapper: 'bg-yellow-100 text-yellow-800', text: 'Cảnh báo' };
      case 'Weak':
        return { wrapper: 'bg-orange-100 text-orange-800', text: 'Yếu' };
      case 'Sick':
        return { wrapper: 'bg-red-100 text-red-800', text: 'Bị bệnh' };
      case 'Dead':
        return { wrapper: 'bg-red-100 text-red-800', text: 'Chết' };
      default:
        return { wrapper: 'bg-gray-100 text-gray-800', text: 'Không rõ' };
    }
  };

  const calcAge = (birthDate?: string) => {
    if (!birthDate) return '';
    try {
      const b = new Date(birthDate);
      const diff = Date.now() - b.getTime();
      const years = diff / (1000 * 60 * 60 * 24 * 365);
      if (years < 1) return `${Math.round(years * 12)} tháng`;
      return `${+years.toFixed(1)} năm`;
    } catch {
      return '';
    }
  };

  const displayedFish = (fishData || []).slice(0, showAllFish ? undefined : 3);

  return (
    <View className="mb-4 rounded-2xl bg-white shadow-sm">
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between p-4"
      >
        <View className="flex-row items-center">
          <Text className="mr-2 text-lg font-semibold text-gray-900">
            Quản lý cá
          </Text>
          <View className="rounded-full bg-blue-100 px-2 py-1">
            <Text className="text-sm font-medium text-blue-800">
              {fishData?.length ?? 0} con
            </Text>
          </View>
        </View>
        {isExpanded ? (
          <ChevronUp size={20} color="#6b7280" />
        ) : (
          <ChevronDown size={20} color="#6b7280" />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View className="px-4 pb-4">
          {/* Action Buttons */}
          {/* <View className="mb-4 flex-row">
            <TouchableOpacity
              className="mr-4 flex-1 flex-row items-center justify-center rounded-2xl bg-green-500 py-3"
              onPress={() => setShowAddFishForm(true)}
            >
              <Plus size={16} color="white" />
              <Text className="ml-1 font-medium text-white">Thêm cá</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center rounded-2xl bg-red-500 py-3"
              onPress={() => setShowRemoveFishForm(true)}
            >
              <Minus size={16} color="white" />
              <Text className="ml-1 font-medium text-white">Loại bỏ cá</Text>
            </TouchableOpacity>
          </View> */}

          {/* Fish List */}
          <View className="space-y-2">
            {isLoading ? (
              <View className="items-center py-6">
                <ActivityIndicator />
                <Text className="mt-2 text-sm text-gray-500">
                  Đang tải danh sách cá...
                </Text>
              </View>
            ) : (fishData?.length || 0) === 0 ? (
              <View className="items-center py-6">
                <Text className="text-sm text-gray-600">
                  Chưa có cá trong hồ
                </Text>
              </View>
            ) : (
              displayedFish.map((fish) => {
                const title =
                  fish.rfid || fish.variety?.varietyName || `ID ${fish.id}`;
                const species = fish.variety?.varietyName || '-';
                const age = calcAge(fish.birthDate);
                const health = mapHealthToBadge(
                  fish.healthStatus as unknown as string
                );

                const firstImage =
                  fish.images && fish.images.length > 0
                    ? fish.images[0]
                    : undefined;

                const imageSource = firstImage
                  ? { uri: firstImage }
                  : require('@/assets/images/Logo_ZenKoi.png');

                return (
                  <View
                    key={String(fish.id)}
                    className="mb-2 flex-row items-center justify-between rounded-2xl bg-gray-50 p-3"
                  >
                    <View className="mr-3">
                      <Image
                        source={imageSource}
                        className="h-12 w-12 rounded-full bg-gray-200"
                        accessibilityLabel={`Ảnh cá ${title}`}
                      />
                    </View>

                    <View className="flex-1">
                      <Text className="font-medium text-gray-900">{title}</Text>
                      <Text className="text-sm text-gray-600">
                        {species} • {age}
                      </Text>
                    </View>

                    <View
                      className={`rounded-full px-2 py-1 ${health.wrapper} mr-2`}
                    >
                      <Text className="text-xs font-medium">{health.text}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() =>
                        router.push(`/koi/${fish.id}?redirect=water/${pondId}`)
                      }
                      className="items-center justify-center rounded-full bg-white p-2"
                      accessibilityLabel="Xem chi tiết cá"
                    >
                      <Eye size={16} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>

          {/* Show More/Less Button */}
          {(fishData?.length || 0) > 3 && (
            <TouchableOpacity
              onPress={() => setShowAllFish(!showAllFish)}
              className="mt-3 py-2"
            >
              <Text className="text-center font-medium text-blue-500">
                {showAllFish
                  ? 'Ẩn bớt'
                  : `Xem thêm ${(fishData?.length || 0) - 3} con cá`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
