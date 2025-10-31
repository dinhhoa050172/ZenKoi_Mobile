import { useDeletePondType, useGetPondTypes } from '@/hooks/usePondType';
import { PondType } from '@/lib/api/services/fetchPondType';
import { Edit, Plus, Search, Trash2, X } from 'lucide-react-native';
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
import { CustomAlert } from '../../../components/CustomAlert';
import CreatePondTypeModal from '../../../components/pond/CreatePondTypeModal';
import EditPondTypeModal from '../../../components/pond/EditPondTypeModal';

export default function PondTypeManagementScreen() {
  const insets = useSafeAreaInsets();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPondTypeId, setEditingPondTypeId] = useState<number | null>(
    null
  );
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [pondTypeToDelete, setPondTypeToDelete] = useState<PondType | null>(
    null
  );

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
    setPondTypeToDelete(pondType);
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    if (pondTypeToDelete) {
      deletePondTypeMutation.mutate(pondTypeToDelete.id);
    }
    setShowDeleteAlert(false);
    setPondTypeToDelete(null);
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
      <View className="border-b border-gray-200 bg-white">
        <View className="flex-row items-center justify-between p-4">
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
        <View className="px-4 pb-4">
          <View className="flex-row items-center rounded-2xl border border-gray-200 bg-gray-50 px-3">
            <Search size={20} color="#6b7280" />
            <TextInput
              placeholder="Tìm kiếm loại hồ..."
              value={searchText}
              onChangeText={setSearchText}
              className="ml-2 flex-1 py-2 text-base"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
                className="ml-2 rounded-full bg-gray-200 p-1"
              >
                <X size={16} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{
          paddingBottom: insets.bottom + 40,
        }}
      >
        <View className="p-4">
          {/* Statistics */}
          <View className="mb-4 flex-row gap-3">
            {isLoading ? (
              <>
                {/* Skeleton for stats */}
                <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
                  <View className="mb-1 h-4 w-16 rounded bg-gray-200" />
                  <View className="h-8 w-12 rounded bg-gray-300" />
                </View>
                <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
                  <View className="mb-1 h-4 w-16 rounded bg-gray-200" />
                  <View className="h-8 w-12 rounded bg-gray-300" />
                </View>
              </>
            ) : (
              <>
                <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
                  <Text className="mb-1 text-sm text-gray-600">Tổng số</Text>
                  <Text className="text-2xl font-bold text-primary">
                    {pondTypesData?.totalItems || 0}
                  </Text>
                </View>
                <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
                  <Text className="mb-1 text-sm text-gray-600">Hiển thị</Text>
                  <Text className="text-2xl font-bold text-green-600">
                    {pondTypes.length}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Loading State */}
          {isLoading ? (
            <View className="gap-3">
              {/* Skeleton Cards */}
              {[1, 2, 3].map((item) => (
                <View
                  key={item}
                  className="overflow-hidden rounded-2xl bg-white p-4 shadow-sm"
                >
                  <View className="mb-3 flex-row items-center justify-between">
                    <View className="h-6 w-32 rounded bg-gray-200" />
                    <View className="flex-row gap-2">
                      <View className="h-9 w-9 rounded-lg bg-gray-100" />
                      <View className="h-9 w-9 rounded-lg bg-gray-100" />
                    </View>
                  </View>
                  <View className="mb-3 h-10 rounded bg-gray-100" />
                  <View className="rounded-lg bg-gray-50 p-3">
                    <View className="mb-1 h-3 w-32 rounded bg-gray-200" />
                    <View className="h-7 w-24 rounded bg-gray-300" />
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {/* Empty State */}
          {!isLoading && pondTypes.length === 0 && (
            <View className="items-center justify-center rounded-2xl bg-white py-12">
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
              {searchText ? (
                <TouchableOpacity
                  onPress={() => setSearchText('')}
                  className="rounded-lg bg-gray-500 px-6 py-3"
                >
                  <Text className="font-medium text-white">Xóa bộ lọc</Text>
                </TouchableOpacity>
              ) : (
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
          <View className="gap-3">
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

      {/* Delete Confirmation Alert */}
      <CustomAlert
        visible={showDeleteAlert}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa loại hồ "${pondTypeToDelete?.typeName}"?`}
        onCancel={() => {
          setShowDeleteAlert(false);
          setPondTypeToDelete(null);
        }}
        onConfirm={confirmDelete}
        cancelText="Hủy"
        confirmText="Xóa"
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
    <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <View className="p-4">
        {/* Header Row */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="flex-1 text-lg font-bold text-gray-900">
            {pondType.typeName}
          </Text>

          <View className="flex-row gap-2">
            <TouchableOpacity
              className="rounded-lg bg-blue-50 p-2"
              onPress={() => onEdit(pondType.id)}
            >
              <Edit size={18} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity
              className="rounded-lg bg-red-50 p-2"
              onPress={() => onDelete(pondType)}
            >
              <Trash2 size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        {pondType.description && (
          <View className="mb-3">
            <Text className="text-sm leading-5 text-gray-600">
              {pondType.description}
            </Text>
          </View>
        )}

        {/* Recommended Capacity */}
        <View className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
          <Text className="mb-1 text-xs font-medium text-gray-600">
            Dung tích khuyến nghị
          </Text>
          <Text className="text-xl font-bold text-green-600">
            {pondType.recommendedCapacity.toLocaleString('vi-VN')} L
          </Text>
        </View>
      </View>
    </View>
  );
}
