import Loading from '@/components/Loading';
import CreatePondModal from '@/components/water/CreatePondModal';
import EditPondModal from '@/components/water/EditPondModal';
import PondItem from '@/components/water/PondItem';
import PondStats from '@/components/water/PondStats';
import { useGetPonds } from '@/hooks/usePond';
import { useRouter } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export default function PondManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPondId, setEditingPondId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch ponds data
  const {
    data: pondsData,
    isLoading,
    error,
    refetch,
  } = useGetPonds(true, {
    pageIndex: 1,
    pageSize: 100,
    search: debouncedSearchText || undefined,
  });

  const ponds = pondsData?.data || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing ponds:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditPond = (pondId: number) => {
    setEditingPondId(pondId);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPondId(null);
  };

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center p-4">
          <Text className="mb-4 text-center text-red-600">
            Lỗi khi tải danh sách hồ cá: {error.message}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="rounded-lg bg-primary px-4 py-2"
          >
            <Text className="font-medium text-white">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="p-4">
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-900">
              Danh sách hồ cá
            </Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.push('/pond')}
                className="mr-2 rounded-lg bg-blue-600 px-3 py-2"
              >
                <Text className="text-sm font-medium text-white">Loại hồ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                className="rounded-lg bg-primary px-4 py-2"
              >
                <Plus size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          <PondStats ponds={ponds} isLoading={isLoading} />

          {/* Search */}
          <View className="mb-4">
            <View className="flex-row items-center rounded-2xl bg-white px-4 py-3 shadow-sm">
              <Search size={20} color="#9ca3af" />
              <TextInput
                placeholder="Tìm kiếm hồ cá..."
                value={searchText}
                onChangeText={setSearchText}
                className="ml-3 flex-1 text-gray-900"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Loading State */}
          {isLoading && ponds.length === 0 && (
            <View className="flex-1 items-center justify-center py-8">
              <Loading />
            </View>
          )}

          {/* Empty State */}
          {!isLoading && ponds.length === 0 && (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="mb-4 text-center text-gray-500">
                {searchText
                  ? 'Không tìm thấy hồ cá phù hợp'
                  : 'Chưa có hồ cá nào'}
              </Text>
              {!searchText && (
                <TouchableOpacity
                  onPress={() => setShowAddModal(true)}
                  className="rounded-lg bg-primary px-4 py-2"
                >
                  <Text className="font-medium text-white">
                    Tạo hồ đầu tiên
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Pond List */}
          <View>
            {ponds.map((pond) => (
              <PondItem key={pond.id} pond={pond} onEditPond={handleEditPond} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Create Pond Modal */}
      <CreatePondModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Edit Pond Modal */}
      <EditPondModal
        visible={showEditModal}
        pondId={editingPondId}
        onClose={handleCloseEditModal}
      />
    </SafeAreaView>
  );
}
