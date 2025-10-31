import { Pond, PondStatus } from '@/lib/api/services/fetchPond';
import { formatCapacity } from '@/lib/utils/capacityLiters';
import { formatDate } from '@/lib/utils/formatDate';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface PondItemProps {
  pond: Pond;
  onEditPond?: (pondId: number) => void;
}

export default function PondItem({ pond, onEditPond }: PondItemProps) {
  const router = useRouter();

  const handleNavigation = () => {
    try {
      router.push(`/water/${pond.id}?redirect=/water`);
    } catch (error) {
      console.error('PondItem: Navigation error:', error);
    }
  };

  const getStatusColor = (status: PondStatus) => {
    switch (status) {
      case PondStatus.ACTIVE:
        return 'bg-green-500';
      case PondStatus.MAINTENANCE:
        return 'bg-yellow-500';
      case PondStatus.EMPTY:
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBgColor = (status: PondStatus) => {
    switch (status) {
      case PondStatus.ACTIVE:
        return 'bg-green-50';
      case PondStatus.MAINTENANCE:
        return 'bg-yellow-50';
      case PondStatus.EMPTY:
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getStatusTextColor = (status: PondStatus) => {
    switch (status) {
      case PondStatus.ACTIVE:
        return 'text-green-700';
      case PondStatus.MAINTENANCE:
        return 'text-yellow-700';
      case PondStatus.EMPTY:
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  const getStatusText = (status: PondStatus) => {
    switch (status) {
      case PondStatus.ACTIVE:
        return 'Hoạt động';
      case PondStatus.MAINTENANCE:
        return 'Bảo trì';
      case PondStatus.EMPTY:
        return 'Trống';
      default:
        return 'Không xác định';
    }
  };

  return (
    <View className="relative mb-3 overflow-hidden rounded-2xl border border-gray-100 bg-white ">
      {/* Status Color Indicator */}
      <View
        className={`absolute bottom-0 left-0 top-0 w-1 ${getStatusColor(pond.pondStatus)}`}
      />

      <TouchableOpacity onPress={handleNavigation} className="p-4 pl-6">
        {/* Header Row */}
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center">
            <View
              className={`mr-2 h-2 w-2 rounded-full ${getStatusColor(pond.pondStatus)}`}
            />
            <Text className="text-base font-semibold text-gray-900">
              {pond.pondName}
            </Text>
          </View>

          <View className="flex-row items-center">
            <View
              className={`rounded-2xl px-2 py-1 ${getStatusBgColor(pond.pondStatus)}`}
            >
              <Text
                className={`text-xs font-medium ${getStatusTextColor(pond.pondStatus)}`}
              >
                {getStatusText(pond.pondStatus)}
              </Text>
            </View>

            <TouchableOpacity
              className="ml-2 p-1"
              onPress={(e) => {
                e.stopPropagation();
                onEditPond?.(pond.id);
              }}
            >
              <Settings size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Info Row */}
        <View className="mb-3 flex-row items-center justify-between">
          <View className="mr-2 flex-1">
            <Text
              className="text-sm text-gray-600"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Khu vực: {pond.areaName}
            </Text>
            <Text className="font-medium text-gray-900">
              {formatCapacity(pond.capacityLiters)}
            </Text>
          </View>

          <View className="flex-1">
            <Text
              className="items-end text-sm text-gray-600"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Loại: {pond.pondTypeName}
            </Text>
            <Text className="font-medium text-gray-900">
              {pond.lengthMeters}m × {pond.widthMeters}m × {pond.depthMeters}m
            </Text>
          </View>
        </View>

        {/* Location and Created Date Row */}
        <View className="flex-row items-center justify-between">
          <View className="mr-2 flex-1">
            <Text
              className="text-sm text-gray-600"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Vị trí: {pond.location}
            </Text>
          </View>

          <View className="flex-shrink-0">
            <Text className="text-xs text-gray-500">
              Ngày tạo: {formatDate(pond.createdAt, 'dd/MM/yyyy')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
