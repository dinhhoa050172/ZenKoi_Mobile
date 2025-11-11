import CreateIncidentModal from '@/components/incidents/CreateIncidentModal';
import IncidentCard from '@/components/incidents/IncidentCard';
import IncidentDetailModal from '@/components/incidents/IncidentDetailModal';
import Loading from '@/components/Loading';
import { useGetIncidents } from '@/hooks/useIncident';
import { Incident, IncidentSeverity } from '@/lib/api/services/fetchIncident';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  BarChart3,
  ChevronRight,
  Filter,
  Plus,
  Search,
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IncidentsScreen() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');

  const { data, refetch, isRefetching, isLoading } = useGetIncidents(true, {
    Search: searchQuery,
    pageSize: 20,
  });

  const incidents = useMemo(() => data?.data || [], [data?.data]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalIncidents = incidents.length;
    const urgentCount = incidents.filter(
      (i) => i.severity === IncidentSeverity.Urgent
    ).length;
    const highCount = incidents.filter(
      (i) => i.severity === IncidentSeverity.High
    ).length;
    const activeCount = incidents.filter(
      (i) => i.status === 'Reported' || i.status === 'Investigating'
    ).length;

    return {
      total: totalIncidents,
      urgent: urgentCount,
      high: highCount,
      active: activeCount,
    };
  }, [incidents]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleIncidentPress = (incident: Incident) => {
    router.push({
      pathname: '/(home)/incidents/[id]',
      params: { id: incident.id.toString() },
    });
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedIncidentId(null);
  };

  const renderIncident = ({ item }: { item: Incident }) => (
    <IncidentCard incident={item} onPress={() => handleIncidentPress(item)} />
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View className="flex-1 items-center justify-center px-6 py-12">
        <LinearGradient
          colors={['#f0f9ff', '#e0f2fe']}
          className="mb-6 h-24 w-24 items-center justify-center rounded-full"
        >
          <Shield size={48} color="#0ea5e9" />
        </LinearGradient>
        <Text className="mb-2 text-2xl font-bold text-gray-900">
          {searchQuery ? 'Không tìm thấy sự cố' : 'Hệ thống ổn định'}
        </Text>
        <Text className="mb-8 text-center text-base text-gray-500">
          {searchQuery
            ? `Không có sự cố nào phù hợp với "${searchQuery}"`
            : 'Tuyệt vời! Hiện tại không có sự cố nào cần xử lý'}
        </Text>
        {!searchQuery && (
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#3b82f6', '#1d4ed8']}
              className="flex-row items-center rounded-2xl px-8 py-4"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Plus size={22} color="white" />
              <Text className="ml-2 text-lg font-bold text-white">
                Báo cáo sự cố đầu tiên
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderStatsCard = (
    title: string,
    value: number,
    icon: React.ReactElement,
    colors: readonly [string, string]
  ) => (
    <View className="mx-1 flex-1">
      <LinearGradient
        colors={colors}
        className="rounded-2xl p-4"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-medium text-white/80">{title}</Text>
            <Text className="text-2xl font-bold text-white">{value}</Text>
          </View>
          <View className="rounded-full bg-white/20 p-2">{icon}</View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1d4ed8" />
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
        {/* Modern Header with Gradient */}
        <LinearGradient
          colors={['#3b82f6', '#1d4ed8', '#1e40af']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pb-8 pt-4"
        >
          <View className="mb-6 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white">
                Quản lý sự cố
              </Text>
              <Text className="mt-1 text-base text-blue-100">
                {incidents.length} sự cố • {stats.active} đang xử lý
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/(home)/incidents/types')}
              className="rounded-2xl bg-white/20 px-4 py-3"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                <Filter size={20} color="white" />
                <Text className="ml-2 font-semibold text-white">
                  Loại sự cố
                </Text>
                <ChevronRight size={16} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Statistics Cards */}
          <View className="mb-6 flex-row">
            {renderStatsCard(
              'Tổng số',
              stats.total,
              <BarChart3 size={20} color="white" />,
              ['#6366f1', '#4f46e5'] as const
            )}
            {renderStatsCard(
              'Khẩn cấp',
              stats.urgent,
              <Zap size={20} color="white" />,
              ['#ef4444', '#dc2626'] as const
            )}
            {renderStatsCard(
              'Mức cao',
              stats.high,
              <TrendingUp size={20} color="white" />,
              ['#f59e0b', '#d97706'] as const
            )}
          </View>

          {/* Search Bar */}
          <View className="relative">
            <View className="flex-row items-center rounded-2xl bg-white/90 px-4 py-4">
              <Search size={20} color="#6b7280" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Tìm kiếm sự cố..."
                className="ml-3 flex-1 text-base text-gray-900"
                placeholderTextColor="#9ca3af"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  className="ml-2 rounded-full bg-gray-200 p-1"
                >
                  <Text className="text-xs text-gray-600">✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Incidents List */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <View className="rounded-2xl bg-white p-8 shadow-lg">
              <Loading />
              <Text className="mt-4 text-center text-base font-medium text-gray-600">
                Đang tải dữ liệu sự cố...
              </Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={incidents}
            renderItem={renderIncident}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 16,
              paddingTop: 20,
              paddingBottom: 100,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                colors={['#3b82f6']}
                tintColor="#3b82f6"
                progressBackgroundColor="#ffffff"
              />
            }
            ListEmptyComponent={renderEmpty}
            ItemSeparatorComponent={() => <View className="h-4" />}
          />
        )}

        {/* Enhanced Floating Action Button */}
        <View className="absolute bottom-6 right-6">
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.8}
            style={{
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            <LinearGradient
              colors={['#3b82f6', '#1d4ed8']}
              className="h-16 w-16 items-center justify-center rounded-full"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Plus size={28} color="white" strokeWidth={2.5} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Create Incident Modal */}
        <CreateIncidentModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />

        {/* Incident Detail Modal */}
        <IncidentDetailModal
          visible={showDetailModal}
          onClose={handleCloseDetailModal}
          incidentId={selectedIncidentId}
        />
      </SafeAreaView>
    </>
  );
}
