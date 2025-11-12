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
import {
  Activity,
  ArrowLeft,
  Calendar,
  Droplet,
  Layers,
  MapPin,
  Maximize2,
} from 'lucide-react-native';
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
  const { id, redirect, redirectId } = useLocalSearchParams();
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

  const parsedRedirectId = Number((redirectId as string) ?? 0);

  const handleBack = () => {
    // If caller asked to go to a specific pond detail
    if (redirect === 'pondDetail' && parsedRedirectId) {
      router.push(`/water/${parsedRedirectId}`);
      return;
    }

    // If redirect is a pathname like '/water' or '/koi/...', use replace to navigate
    if (redirect && (redirect as string).startsWith('/')) {
      router.replace({ pathname: redirect as string } as any);
      return;
    }

    // Default fallback: go to pond list
    router.replace({ pathname: '/water' } as any);
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
        return 'bg-blue-500';
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
          <View className="items-center rounded-2xl bg-white p-6">
            <Text className="mb-4 text-center text-base text-red-600">
              {error ? `Lỗi: ${error.message}` : 'Không tìm thấy hồ cá'}
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="mb-3 w-full rounded-2xl bg-primary px-6 py-3"
            >
              <Text className="text-center font-semibold text-white">
                Thử lại
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleBack()}
              className="w-full rounded-2xl border border-gray-300 bg-white px-6 py-3"
            >
              <Text className="text-center font-semibold text-gray-700">
                Quay lại
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="rounded-t-2xl bg-primary pb-6">
        <View className="flex-row items-center px-4 pt-4">
          <TouchableOpacity
            onPress={() => handleBack()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/20"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-sm font-medium uppercase tracking-wide text-white/80">
              Chi tiết hồ
            </Text>
            <Text
              className="text-xl font-bold text-white"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {pond.pondName}
            </Text>
          </View>
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
        <View className="mt-2 px-4">
          {/* Location */}
          <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <MapPin size={18} color="#f97316" />
                </View>
                <View>
                  <Text className="text-sm text-gray-600">Vị trí</Text>
                  <Text className="text-base font-semibold text-gray-900">
                    {pond.location}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Status Card */}
          <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-base font-semibold text-gray-900">
                Trạng thái
              </Text>
              <View
                className={`flex-row items-center rounded-full px-3 py-1.5 ${getStatusBgColor(pond.pondStatus)}`}
              >
                <View
                  className={`mr-2 h-2 w-2 rounded-full ${getStatusColor(pond.pondStatus)}`}
                />
                <Text
                  className={`text-sm font-semibold ${getStatusTextColor(pond.pondStatus)}`}
                >
                  {getStatusText(pond.pondStatus)}
                </Text>
              </View>
            </View>

            {/* Quick Stats Grid */}
            <View className="-mx-1 flex-row flex-wrap">
              {/* Capacity */}
              <View className="mb-2 w-1/2 px-1">
                <View className="rounded-2xl bg-blue-50 p-3">
                  <View className="mb-1 flex-row items-center">
                    <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <Droplet size={16} color="#3b82f6" />
                    </View>
                    <Text className="text-xs font-medium text-blue-600">
                      Dung tích
                    </Text>
                  </View>
                  <Text
                    className="text-base font-bold text-blue-900"
                    numberOfLines={1}
                  >
                    {formatCapacity(pond.capacityLiters)}
                  </Text>
                </View>
              </View>

              {/* Dimensions */}
              <View className="mb-2 w-1/2 px-1">
                <View className="rounded-2xl bg-purple-50 p-3">
                  <View className="mb-1 flex-row items-center">
                    <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                      <Maximize2 size={16} color="#a855f7" />
                    </View>
                    <Text className="text-xs font-medium text-purple-600">
                      Kích thước
                    </Text>
                  </View>
                  <Text
                    className="text-base font-bold text-purple-900"
                    numberOfLines={1}
                  >
                    {pond.lengthMeters}×{pond.widthMeters}×{pond.depthMeters}m
                  </Text>
                </View>
              </View>

              {/* Area (replaces previous Location slot) */}
              <View className="mb-2 w-1/2 px-1">
                <View className="rounded-2xl bg-orange-50 p-3">
                  <View className="mb-1 flex-row items-center">
                    <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                      <Activity size={16} color="#f97316" />
                    </View>
                    <Text className="text-xs font-medium text-orange-600">
                      Khu vực
                    </Text>
                  </View>
                  <Text
                    className="text-base font-bold text-orange-900"
                    numberOfLines={1}
                  >
                    {pond.areaName}
                  </Text>
                </View>
              </View>

              {/* Pond Type */}
              <View className="mb-2 w-1/2 px-1">
                <View className="rounded-2xl bg-green-50 p-3">
                  <View className="mb-1 flex-row items-center">
                    <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <Layers size={16} color="#22c55e" />
                    </View>
                    <Text className="text-xs font-medium text-green-600">
                      Loại hồ
                    </Text>
                  </View>
                  <Text
                    className="text-base font-bold text-green-900"
                    numberOfLines={1}
                  >
                    {pond.pondTypeName}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Created Date Card (replaces previous Area card) */}
          <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                  <Calendar size={18} color="#6366f1" />
                </View>
                <View>
                  <Text className="text-sm text-gray-600">Ngày tạo</Text>
                  <Text className="text-base font-semibold text-gray-900">
                    {formatDate(pond.createdAt, 'dd/MM/yyyy')}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <WaterParameters
            pondId={pondId}
            isExpanded={expandedSection === 'water'}
            onToggle={() => toggleSection('water')}
            record={pond.record}
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
