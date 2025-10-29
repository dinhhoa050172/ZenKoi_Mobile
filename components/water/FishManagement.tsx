import { ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface FishData {
  id: string;
  name: string;
  species: string;
  age: string;
  health: 'good' | 'fair' | 'poor';
}

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
  const [showAddFishForm, setShowAddFishForm] = useState(false);
  const [showRemoveFishForm, setShowRemoveFishForm] = useState(false);

  // Mock data - replace with real API call later
  const fishData: FishData[] = [
    {
      id: '1',
      name: 'Koi Kohaku #001',
      species: 'Kohaku',
      age: '2 năm',
      health: 'good',
    },
    {
      id: '2',
      name: 'Koi Sanke #002',
      species: 'Sanke',
      age: '3 năm',
      health: 'good',
    },
    {
      id: '3',
      name: 'Koi Showa #003',
      species: 'Showa',
      age: '1.5 năm',
      health: 'fair',
    },
    {
      id: '4',
      name: 'Koi Taisho #004',
      species: 'Taisho Sanke',
      age: '2.5 năm',
      health: 'good',
    },
    {
      id: '5',
      name: 'Koi Chagoi #005',
      species: 'Chagoi',
      age: '4 năm',
      health: 'good',
    },
    {
      id: '6',
      name: 'Koi Bekko #006',
      species: 'Shiro Bekko',
      age: '1 năm',
      health: 'fair',
    },
    {
      id: '7',
      name: 'Koi Utsurimono #007',
      species: 'Ki Utsuri',
      age: '3.5 năm',
      health: 'poor',
    },
  ];

  const getFishHealthColor = (health: string) => {
    switch (health) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFishHealthText = (health: string) => {
    switch (health) {
      case 'good':
        return 'Tốt';
      case 'fair':
        return 'Khá';
      case 'poor':
        return 'Yếu';
      default:
        return 'Không rõ';
    }
  };

  const displayedFish = showAllFish ? fishData : fishData.slice(0, 3);

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
            <Text className="text-xs font-medium text-blue-800">
              {fishData.length} con
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
          <View className="mb-4 flex-row space-x-2">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center rounded-xl bg-green-500 py-3"
              onPress={() => setShowAddFishForm(true)}
            >
              <Plus size={16} color="white" />
              <Text className="ml-1 font-medium text-white">Thêm cá</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center rounded-xl bg-red-500 py-3"
              onPress={() => setShowRemoveFishForm(true)}
            >
              <Minus size={16} color="white" />
              <Text className="ml-1 font-medium text-white">Loại bỏ cá</Text>
            </TouchableOpacity>
          </View>

          {/* Fish List */}
          <View className="space-y-2">
            {displayedFish.map((fish) => (
              <View
                key={fish.id}
                className="flex-row items-center justify-between rounded-xl bg-gray-50 p-3"
              >
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">{fish.name}</Text>
                  <Text className="text-sm text-gray-600">
                    {fish.species} • {fish.age}
                  </Text>
                </View>
                <View
                  className={`rounded-full px-2 py-1 ${getFishHealthColor(fish.health)}`}
                >
                  <Text className="text-xs font-medium">
                    {getFishHealthText(fish.health)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Show More/Less Button */}
          {fishData.length > 3 && (
            <TouchableOpacity
              onPress={() => setShowAllFish(!showAllFish)}
              className="mt-3 py-2"
            >
              <Text className="text-center font-medium text-blue-500">
                {showAllFish
                  ? 'Ẩn bớt'
                  : `Xem thêm ${fishData.length - 3} con cá`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
