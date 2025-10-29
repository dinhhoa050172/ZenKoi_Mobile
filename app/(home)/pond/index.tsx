import Loading from '@/components/Loading';
import { useDeletePondType, useGetPondTypes } from '@/hooks/usePondType';
import { PondType } from '@/lib/api/services/fetchPondType';
import { Edit, Plus, Search, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CreatePondTypeModal from '../../../components/pond/CreatePondTypeModal';
import EditPondTypeModal from '../../../components/pond/EditPondTypeModal';

export default function PondTypeManagementScreen() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPondTypeId, setEditingPondTypeId] = useState<number | null>(
    null
  );
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

  // Fetch pond types data
  const {
    data: pondTypesData,
    isLoading,
    error,
    refetch,
  } = useGetPondTypes(true, {
    pageIndex: 1,
    pageSize: 100,
    search: debouncedSearchText || undefined,
  });

  const deletePondTypeMutation = useDeletePondType();
  const pondTypes = pondTypesData?.data || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing pond types:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditPondType = (pondTypeId: number) => {
    setEditingPondTypeId(pondTypeId);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPondTypeId(null);
  };

  const handleDeletePondType = (pondType: PondType) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa loại hồ "${pondType.typeName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => deletePondTypeMutation.mutate(pondType.id),
        },
      ]
    );
  };

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center p-4">
          <Text className="mb-4 text-center text-lg text-red-600">
            Không thể tải danh sách loại hồ
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="rounded-lg bg-primary px-6 py-3"
          >
            <Text className="font-medium text-white">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-900">
            Quản lý loại hồ
          </Text>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            className="flex-row items-center rounded-lg bg-primary px-4 py-2"
          >
            <Plus size={20} color="white" />
            <Text className="ml-2 font-medium text-white">Tạo mới</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="mt-3 flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <Search size={20} color="#6b7280" />
          <TextInput
            placeholder="Tìm kiếm loại hồ..."
            value={searchText}
            onChangeText={setSearchText}
            className="ml-2 flex-1 text-base"
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="p-4">
          {/* Statistics */}
          <View className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <Text className="mb-2 text-lg font-semibold text-gray-900">
              Thống kê
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-primary">
                  {pondTypesData?.totalItems || 0}
                </Text>
                <Text className="text-sm text-gray-600">Tổng số loại hồ</Text>
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-green-600">
                  {pondTypes.length}
                </Text>
                <Text className="text-sm text-gray-600">Hiển thị</Text>
              </View>
            </View>
          </View>

          {/* Loading State */}
          {isLoading && <Loading />}

          {/* Empty State */}
          {!isLoading && pondTypes.length === 0 && (
            <View className="items-center justify-center py-12">
              <Text className="mb-2 text-lg font-medium text-gray-600">
                {searchText
                  ? 'Không tìm thấy loại hồ phù hợp'
                  : 'Chưa có loại hồ nào'}
              </Text>
              <Text className="mb-4 text-center text-gray-500">
                {searchText
                  ? 'Thử tìm kiếm với từ khóa khác'
                  : 'Hãy tạo loại hồ đầu tiên của bạn'}
              </Text>
              {!searchText && (
                <TouchableOpacity
                  onPress={() => setShowCreateModal(true)}
                  className="rounded-lg bg-primary px-6 py-3"
                >
                  <Text className="font-medium text-white">Tạo loại hồ</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Pond Type List */}
          <View>
            {pondTypes.map((pondType) => (
              <PondTypeCard
                key={pondType.id}
                pondType={pondType}
                onEdit={handleEditPondType}
                onDelete={handleDeletePondType}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Create Pond Type Modal */}
      <CreatePondTypeModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Edit Pond Type Modal */}
      <EditPondTypeModal
        visible={showEditModal}
        pondTypeId={editingPondTypeId}
        onClose={handleCloseEditModal}
      />
    </SafeAreaView>
  );
}

interface PondTypeCardProps {
  pondType: PondType;
  onEdit: (id: number) => void;
  onDelete: (pondType: PondType) => void;
}

function PondTypeCard({ pondType, onEdit, onDelete }: PondTypeCardProps) {
  return (
    <View className="mb-3 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <View className="p-4">
        {/* Header Row */}
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {pondType.typeName}
            </Text>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity
              className="mr-2 rounded-lg bg-blue-50 p-2"
              onPress={() => onEdit(pondType.id)}
            >
              <Edit size={16} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity
              className="rounded-lg bg-red-50 p-2"
              onPress={() => onDelete(pondType)}
            >
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        {pondType.description && (
          <View className="mb-3">
            <Text className="text-sm leading-5 text-gray-700">
              {pondType.description}
            </Text>
          </View>
        )}

        {/* Recommended Capacity */}
        <View className="rounded-lg bg-green-50 p-3">
          <Text className="text-xs font-medium uppercase tracking-wide text-green-700">
            Dung tích khuyến nghị
          </Text>
          <Text className="mt-1 text-lg font-bold text-green-800">
            {pondType.recommendedCapacity.toLocaleString('vi-VN')} L
          </Text>
        </View>
      </View>
    </View>
  );
}
