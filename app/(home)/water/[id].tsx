import Loading from '@/components/Loading';
import ActivityHistory from '@/components/water/ActivityHistory';
import FishManagement from '@/components/water/FishManagement';
import IncidentReporting from '@/components/water/IncidentReporting';
import WaterParameters from '@/components/water/WaterParameters';
import { useGetPondById } from '@/hooks/usePond';
import { PondStatus } from '@/lib/api/services/fetchPond';
import { formatCapacity } from '@/lib/utils/capacityLiters';
import { formatDate } from '@/lib/utils/formatDate';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export default function PondDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const pondId = Number(id);

  // Fetch pond data
  const {
    data: pond,
    isLoading,
    error,
    refetch,
  } = useGetPondById(pondId, !!pondId);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing pond:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getStatusColor = (status: PondStatus) => {
    switch (status) {
      case PondStatus.ACTIVE:
        return 'bg-green-500';
      case PondStatus.MAINTENANCE:
        return 'bg-yellow-500';
      case PondStatus.EMPTY:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
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

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Loading />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !pond) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center p-4">
          <Text className="mb-4 text-center text-red-600">
            {error ? `Lỗi: ${error.message}` : 'Không tìm thấy hồ cá'}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="mb-2 rounded-lg bg-primary px-4 py-2"
          >
            <Text className="font-medium text-white">Thử lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            className="rounded-lg bg-gray-500 px-4 py-2"
          >
            <Text className="font-medium text-white">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white ">
        <View className="flex-row items-center p-4">
          <TouchableOpacity
            onPress={() => router.push('/water')}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          >
            <ArrowLeft size={20} color="#6b7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">
            Chi tiết hồ cá
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="p-4">
          {/* Pond Basic Info */}
          <View className="mb-4 rounded-2xl bg-white p-4 ">
            <View className="mb-3 flex-row items-center">
              <View
                className={`mr-2 h-3 w-3 rounded-full ${getStatusColor(pond.pondStatus)}`}
              />
              <Text className="text-xl font-bold text-gray-900">
                {pond.pondName}
              </Text>
            </View>

            <View className="mb-4 flex-row justify-between">
              <View>
                <Text className="flex-row items-center text-sm text-gray-600">
                  <MapPin size={14} color="#6b7280" />
                  <Text className="ml-1">Vị trí</Text>
                </Text>
                <Text className="font-medium text-gray-900">
                  {pond.location}
                </Text>
              </View>
              <View>
                <Text className="text-sm text-gray-600">Dung tích</Text>
                <Text className="font-medium text-gray-900">
                  {formatCapacity(pond.capacityLiters)}
                </Text>
              </View>
            </View>

            <View className="mb-4 flex-row justify-between">
              <View>
                <Text className="text-sm text-gray-600">Kích thước</Text>
                <Text className="font-medium text-gray-900">
                  {pond.lengthMeters}m × {pond.widthMeters}m ×{' '}
                  {pond.depthMeters}m
                </Text>
              </View>
              <View>
                <Text className="text-sm text-gray-600">Trạng thái</Text>
                <Text
                  className={`font-medium ${getStatusColor(pond.pondStatus).replace('bg-', 'text-')}`}
                >
                  {getStatusText(pond.pondStatus)}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View>
                <Text className="text-sm text-gray-600">Khu vực</Text>
                <Text className="font-medium text-gray-900">
                  {pond.areaName}
                </Text>
              </View>
              <View>
                <Text className="text-sm text-gray-600">Loại hồ</Text>
                <Text className="font-medium text-gray-900">
                  {pond.pondTypeName}
                </Text>
              </View>
            </View>

            <View className="mt-4 border-t border-gray-200 pt-4">
              <Text className="text-sm text-gray-600">Ngày tạo</Text>
              <Text className="font-medium text-gray-900">
                {formatDate(pond.createdAt)}
              </Text>
            </View>
          </View>

          {/* Expandable Sections using Components */}
          <WaterParameters
            pondId={pondId}
            isExpanded={expandedSection === 'water'}
            onToggle={() => toggleSection('water')}
          />

          <FishManagement
            pondId={pondId}
            isExpanded={expandedSection === 'fish'}
            onToggle={() => toggleSection('fish')}
          />

          <ActivityHistory
            pondId={pondId}
            isExpanded={expandedSection === 'history'}
            onToggle={() => toggleSection('history')}
          />

          <IncidentReporting
            pondId={pondId}
            isExpanded={expandedSection === 'incident'}
            onToggle={() => toggleSection('incident')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
