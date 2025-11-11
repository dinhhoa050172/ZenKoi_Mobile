import Loading from '@/components/Loading';
import { useGetIncidentTypes } from '@/hooks/useIncidentType';
import {
  IncidentSeverity,
  IncidentType,
} from '@/lib/api/services/fetchIncidentType';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  Clock,
  Heart,
  Search,
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IncidentTypesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | IncidentSeverity
  >('all');

  const {
    data: incidentTypes,
    refetch,
    isRefetching,
    isLoading,
  } = useGetIncidentTypes(true, {
    search: searchQuery,
    pageSize: 50,
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleBack = () => {
    router.back();
  };

  const getSeverityInfo = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'Critical':
        return {
          color: '#dc2626',
          bgColor: '#fef2f2',
          borderColor: '#fecaca',
          icon: AlertTriangle,
          label: 'Nghiêm trọng',
        };
      case 'High':
        return {
          color: '#ea580c',
          bgColor: '#fff7ed',
          borderColor: '#fed7aa',
          icon: Zap,
          label: 'Cao',
        };
      case 'Medium':
        return {
          color: '#d97706',
          bgColor: '#fffbeb',
          borderColor: '#fde68a',
          icon: AlertCircle,
          label: 'Trung bình',
        };
      default:
        return {
          color: '#059669',
          bgColor: '#f0fdf4',
          borderColor: '#bbf7d0',
          icon: Shield,
          label: 'Thấp',
        };
    }
  };

  const getTypeIcon = (item: IncidentType) => {
    if (item.affectsBreeding) return Heart;
    if (item.requiresQuarantine) return Shield;
    return Clock;
  };

  const filteredTypes =
    incidentTypes?.data?.filter((item) => {
      if (selectedFilter === 'all') return true;
      return item.defaultSeverity === selectedFilter;
    }) || [];

  const renderIncidentType = ({
    item,
    index,
  }: {
    item: IncidentType;
    index: number;
  }) => {
    const severityInfo = getSeverityInfo(item.defaultSeverity);
    const TypeIcon = getTypeIcon(item);
    const SeverityIcon = severityInfo.icon;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        className="mx-4 mb-4"
        style={{
          transform: [{ translateY: index * -2 }],
        }}
      >
        <View
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{
            borderColor: severityInfo.borderColor,
            shadowColor: severityInfo.color,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          {/* Header với Icon và Severity */}
          <View className="mb-3 flex-row items-start justify-between">
            <View className="flex-1 flex-row items-start">
              <View
                className="mr-3 rounded-xl p-2.5"
                style={{ backgroundColor: severityInfo.bgColor }}
              >
                <TypeIcon size={20} color={severityInfo.color} />
              </View>

              <View className="flex-1">
                <Text className="mb-1 text-lg font-bold text-gray-900">
                  {item.name}
                </Text>
                <Text className="text-sm text-gray-600" numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            </View>

            <View className="items-end">
              <View
                className="mb-2 flex-row items-center rounded-full px-3 py-1.5"
                style={{ backgroundColor: severityInfo.bgColor }}
              >
                <SeverityIcon size={14} color={severityInfo.color} />
                <Text
                  className="ml-1.5 text-xs font-semibold"
                  style={{ color: severityInfo.color }}
                >
                  {severityInfo.label}
                </Text>
              </View>

              <Text className="text-xs text-gray-400">#{item.id}</Text>
            </View>
          </View>

          {/* Tags cho Quarantine và Breeding */}
          <View className="flex-row flex-wrap gap-2">
            {item.requiresQuarantine && (
              <View className="flex-row items-center rounded-lg bg-red-50 px-2.5 py-1">
                <Shield size={12} color="#dc2626" />
                <Text className="ml-1 text-xs font-medium text-red-700">
                  Cần cách ly
                </Text>
              </View>
            )}

            {item.affectsBreeding && (
              <View className="flex-row items-center rounded-lg bg-pink-50 px-2.5 py-1">
                <Heart size={12} color="#ec4899" />
                <Text className="ml-1 text-xs font-medium text-pink-700">
                  Ảnh hưởng sinh sản
                </Text>
              </View>
            )}

            {!item.requiresQuarantine && !item.affectsBreeding && (
              <View className="flex-row items-center rounded-lg bg-green-50 px-2.5 py-1">
                <TrendingUp size={12} color="#059669" />
                <Text className="ml-1 text-xs font-medium text-green-700">
                  Kiểm soát thường
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View className="flex-1 items-center justify-center px-6 py-12">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <AlertTriangle size={40} color="#9ca3af" />
        </View>
        <Text className="mb-2 text-xl font-bold text-gray-900">
          {searchQuery || selectedFilter !== 'all'
            ? 'Không tìm thấy kết quả'
            : 'Chưa có loại sự cố'}
        </Text>
        <Text className="mb-8 text-center text-gray-500">
          {searchQuery || selectedFilter !== 'all'
            ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
            : 'Hệ thống chưa có loại sự cố nào được định nghĩa'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
      {/* Modern Header with Gradient */}
      <View className="bg-white">
        <LinearGradient
          colors={['#3b82f6', '#1d4ed8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pb-6 pt-4"
        >
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handleBack}
              className="flex-row items-center"
              activeOpacity={0.8}
            >
              <ChevronLeft size={24} color="white" />
              <Text className="ml-2 text-xl font-bold text-white">
                Loại sự cố
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center">
              <View className="rounded-full bg-white/20 px-3 py-1">
                <Text className="text-sm font-semibold text-white">
                  {filteredTypes.length} loại
                </Text>
              </View>
            </View>
          </View>

          {/* Search Bar */}
          <View className="mt-4 flex-row items-center rounded-xl bg-white/90 px-4 py-3">
            <Search size={20} color="#6b7280" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Tìm kiếm loại sự cố..."
              className="ml-3 flex-1 text-gray-900"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </LinearGradient>

        {/* Filter Tabs */}
        <View className="border-b border-gray-100 bg-white px-6 py-3">
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setSelectedFilter('all')}
              className={`rounded-full px-4 py-2 ${
                selectedFilter === 'all' ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedFilter === 'all' ? 'text-blue-700' : 'text-gray-600'
                }`}
              >
                Tất cả
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedFilter(IncidentSeverity.CRITICAL)}
              className={`rounded-full px-4 py-2 ${
                selectedFilter === IncidentSeverity.CRITICAL
                  ? 'bg-red-100'
                  : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedFilter === IncidentSeverity.CRITICAL
                    ? 'text-red-700'
                    : 'text-gray-600'
                }`}
              >
                Nghiêm trọng
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedFilter(IncidentSeverity.HIGH)}
              className={`rounded-full px-4 py-2 ${
                selectedFilter === IncidentSeverity.HIGH
                  ? 'bg-orange-100'
                  : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedFilter === IncidentSeverity.HIGH
                    ? 'text-orange-700'
                    : 'text-gray-600'
                }`}
              >
                Cao
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedFilter(IncidentSeverity.MEDIUM)}
              className={`rounded-full px-4 py-2 ${
                selectedFilter === IncidentSeverity.MEDIUM
                  ? 'bg-amber-100'
                  : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedFilter === IncidentSeverity.MEDIUM
                    ? 'text-amber-700'
                    : 'text-gray-600'
                }`}
              >
                Trung bình
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedFilter(IncidentSeverity.LOW)}
              className={`rounded-full px-4 py-2 ${
                selectedFilter === IncidentSeverity.LOW
                  ? 'bg-green-100'
                  : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedFilter === IncidentSeverity.LOW
                    ? 'text-green-700'
                    : 'text-gray-600'
                }`}
              >
                Thấp
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Loading />
          <Text className="mt-4 text-gray-500">Đang tải loại sự cố...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTypes}
          renderItem={renderIncidentType}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            flexGrow: 1,
            paddingVertical: 20,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              colors={['#3b82f6']}
              tintColor="#3b82f6"
            />
          }
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaView>
  );
}
