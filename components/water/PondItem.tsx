import { Pond, PondStatus } from '@/lib/api/services/fetchPond';
import { formatCapacity } from '@/lib/utils/capacityLiters';
import { formatDate } from '@/lib/utils/formatDate';
import { useRouter } from 'expo-router';
import {
  Calendar,
  ChevronRight,
  Droplets,
  MapPin,
  Maximize2,
  Settings,
} from 'lucide-react-native';
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

  const getStatusBorderColor = (status: PondStatus) => {
    switch (status) {
      case PondStatus.ACTIVE:
        return 'border-green-200';
      case PondStatus.MAINTENANCE:
        return 'border-yellow-200';
      case PondStatus.EMPTY:
        return 'border-blue-200';
      default:
        return 'border-gray-200';
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
    <TouchableOpacity
      onPress={handleNavigation}
      activeOpacity={0.7}
      className="mb-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
    >
      {/* Header with Status */}
      <View
        className={`flex-row items-center justify-between border-b px-4 py-3 ${getStatusBorderColor(pond.pondStatus)} ${getStatusBgColor(pond.pondStatus)}`}
      >
        <View className="flex-1 flex-row items-center">
          <View
            className={`mr-2 h-2 w-2 rounded-full ${getStatusColor(pond.pondStatus)}`}
          />
          <Text
            className="flex-1 text-lg font-bold text-gray-900"
            numberOfLines={1}
          >
            {pond.pondName}
          </Text>
        </View>

        <View className="flex-row items-center">
          <View
            className={`rounded-full border px-3 py-1 ${getStatusBorderColor(pond.pondStatus)} ${getStatusBgColor(pond.pondStatus)}`}
          >
            <Text
              className={`text-sm font-semibold ${getStatusTextColor(pond.pondStatus)}`}
            >
              {getStatusText(pond.pondStatus)}
            </Text>
          </View>

          <TouchableOpacity
            className="ml-2 p-1.5"
            onPress={(e) => {
              e.stopPropagation();
              onEditPond?.(pond.id);
            }}
          >
            <Settings size={18} color="#6b7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        {/* Capacity & Type Row */}
        <View className="mb-4 flex-row">
          {/* Capacity */}
          <View className="mr-3 flex-1">
            <View className="mb-1.5 flex-row items-center">
              <Droplets size={20} color="#3b82f6" strokeWidth={2} />
              <Text className="ml-1.5 text-base font-medium text-gray-500">
                Dung tích
              </Text>
            </View>
            <Text className="text-base font-bold text-gray-900">
              {formatCapacity(pond.capacityLiters)}
            </Text>
          </View>

          {/* Pond Type */}
          <View className="flex-1">
            <View className="mb-1.5 flex-row items-center">
              <View className="mr-1.5 h-6 w-6 items-center justify-center rounded-full bg-purple-100">
                <View className="h-3 w-3 rounded-full bg-purple-500" />
              </View>
              <Text className="text-base font-medium text-gray-500">
                Loại ao
              </Text>
            </View>
            <Text
              className="text-base font-bold text-gray-900"
              numberOfLines={1}
            >
              {pond.pondTypeName}
            </Text>
          </View>
        </View>

        {/* Dimensions */}
        <View className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 p-3">
          <View className="mb-1.5 flex-row items-center">
            <Maximize2 size={18} color="#6b7280" strokeWidth={2} />
            <Text className="ml-1.5 text-base font-medium text-gray-600">
              Kích thước
            </Text>
          </View>
          <Text className="text-base font-semibold text-gray-900">
            {pond.lengthMeters}m × {pond.widthMeters}m × {pond.depthMeters}m
          </Text>
        </View>

        {/* Area & Location */}
        <View className="mb-3 space-y-2">
          <View className="flex-row items-center">
            <View className="mr-2 rounded-full bg-emerald-50 p-1.5">
              <View className="h-3 w-3 rounded-full bg-emerald-500" />
            </View>
            <Text className="text-base text-gray-500">Khu vực: </Text>
            <Text
              className="flex-1 text-base font-semibold text-gray-900"
              numberOfLines={1}
            >
              {pond.areaName}
            </Text>
          </View>

          <View className="mt-1 flex-row items-center">
            <MapPin size={16} color="#64748b" strokeWidth={2} />
            <Text className="ml-1 text-base text-gray-500">Vị trí: </Text>
            <Text
              className="flex-1 text-base font-medium text-gray-700"
              numberOfLines={1}
            >
              {pond.location}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-between border-t border-gray-100 pt-3">
          <View className="flex-row items-center">
            <Calendar size={18} color="#9ca3af" strokeWidth={2} />
            <Text className="ml-1.5 text-base text-gray-500">
              {formatDate(pond.createdAt, 'dd/MM/yyyy')}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Text className="mr-1 text-base font-medium text-blue-600">
              Xem chi tiết
            </Text>
            <ChevronRight size={18} color="#2563eb" strokeWidth={2.5} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
