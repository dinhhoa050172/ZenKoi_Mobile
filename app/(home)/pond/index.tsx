import ContextMenuField from '@/components/ContextMenuField';
import FishSvg from '@/components/icons/FishSvg';
import Loading from '@/components/Loading';
import { useDeletePondType, useInfinitePondTypes } from '@/hooks/usePondType';
import { PondType, TypeOfPond } from '@/lib/api/services/fetchPondType';
import { useIsFocused } from '@react-navigation/native';
import {
  Edit,
  Filter,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
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
  const isFocused = useIsFocused();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPondTypeId, setEditingPondTypeId] = useState<number | null>(
    null
  );
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [modalType, setModalType] = useState<TypeOfPond | undefined>(undefined);
  const [minRecommendedStr, setMinRecommendedStr] = useState('');
  const [maxRecommendedStr, setMaxRecommendedStr] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<{
    type?: TypeOfPond;
    minRecommendedQuantity?: number;
    maxRecommendedQuantity?: number;
  }>({});

  const typeToLabel = (t?: TypeOfPond) => {
    switch (t) {
      case TypeOfPond.PARING:
        return 'Ao ghép giống';
      case TypeOfPond.EGG_BATCH:
        return 'Ao ấp trứng';
      case TypeOfPond.FRY_FISH:
        return 'Ao cá bột';
      case TypeOfPond.CLASSIFICATION:
        return 'Ao phân loại';
      case TypeOfPond.MARKET_POND:
        return 'Ao cá bán';
      case TypeOfPond.BROOD_STOCK:
        return 'Ao cá giống';
      case TypeOfPond.QUARANTINE:
        return 'Ao cách ly';
      default:
        return t ?? '';
    }
  };
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [pondTypeToDelete, setPondTypeToDelete] = useState<PondType | null>(
    null
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useInfinitePondTypes(true, {
    search: debouncedSearchText || undefined,
    type: appliedFilters.type,
    minRecommendedQuantity: appliedFilters.minRecommendedQuantity,
    maxRecommendedQuantity: appliedFilters.maxRecommendedQuantity,
  });

  const deletePondTypeMutation = useDeletePondType();

  const pondTypes = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const totalItems = data?.pages[0]?.totalItems || 0;

  useEffect(() => {
    if (isFocused) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

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
        <View className="flex-1 items-center justify-center p-6">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <X size={40} color="#dc2626" />
          </View>
          <Text className="mb-2 text-lg font-semibold text-gray-900">
            Lỗi tải dữ liệu
          </Text>
          <Text className="mb-6 text-center text-sm text-gray-600">
            Không thể tải danh sách loại hồ
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="rounded-2xl bg-primary px-6 py-3"
          >
            <Text className="font-semibold text-white">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-primary pb-6">
          <View className="px-4 pt-2">
            <View className="mb-4 mt-2 flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-medium uppercase tracking-wide text-white/80">
                  Quản lý
                </Text>
                <Text className="text-2xl font-bold text-white">Loại hồ</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCreateModal(true)}
                className="h-12 w-12 items-center justify-center rounded-full bg-white/20"
              >
                <Plus size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center rounded-2xl bg-white px-4 shadow-sm">
              <Search size={20} color="#9ca3af" />
              <TextInput
                placeholder="Tìm kiếm loại hồ..."
                value={searchText}
                onChangeText={setSearchText}
                className="flex-1 py-3 pl-3 text-base text-gray-900"
                placeholderTextColor="#9ca3af"
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchText('');
                    setDebouncedSearchText('');
                  }}
                  className="p-1"
                >
                  <X size={18} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Count + Filter Bar */}
        <View className="flex-row items-center justify-between bg-white px-4 py-3 shadow-sm">
          <Text className="text-sm font-medium text-gray-700">
            {totalItems} loại hồ
          </Text>
          <TouchableOpacity
            className="flex-row items-center rounded-full bg-gray-100 px-4 py-2"
            onPress={() => setShowFilterSheet(true)}
          >
            <Filter size={16} color="#6b7280" />
            <Text className="ml-2 text-sm font-medium text-gray-700">
              Bộ lọc
            </Text>
            {(appliedFilters.type ||
              appliedFilters.minRecommendedQuantity ||
              appliedFilters.maxRecommendedQuantity) && (
              <View className="ml-2 h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                <Text className="text-xs font-bold text-white">
                  {(appliedFilters.type ? 1 : 0) +
                    (appliedFilters.minRecommendedQuantity ? 1 : 0) +
                    (appliedFilters.maxRecommendedQuantity ? 1 : 0)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FlatList
          data={pondTypes}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 30,
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={() => (
            <View className="pt-4">
              {/* Statistics Cards */}
              <View className="mb-4 flex-row gap-3">
                <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
                  <Text className="mb-1 text-sm font-medium text-gray-600">
                    Tổng số
                  </Text>
                  <Text className="text-2xl font-bold text-primary">
                    {totalItems}
                  </Text>
                </View>
                <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
                  <Text className="mb-1 text-sm font-medium text-gray-600">
                    Hiển thị
                  </Text>
                  <Text className="text-2xl font-bold text-green-600">
                    {pondTypes.length}
                  </Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={() => {
            const hasSearch = debouncedSearchText.length > 0;
            return (
              <>
                {isLoading ? (
                  <View className="h-[50vh] w-full items-center justify-center">
                    <Loading />
                  </View>
                ) : (
                  <View className="items-center rounded-2xl bg-white p-8 shadow-sm">
                    <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-purple-100">
                      <FishSvg size={40} color="#8B5CF6" />
                    </View>
                    {hasSearch ? (
                      <>
                        <Text className="mb-2 text-lg font-semibold text-gray-900">
                          Không tìm thấy kết quả
                        </Text>
                        <Text className="mb-6 text-center text-sm text-gray-600">
                          Không có loại hồ nào phù hợp với từ khóa tìm kiếm
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            setSearchText('');
                            setDebouncedSearchText('');
                          }}
                          className="rounded-2xl bg-gray-100 px-6 py-3"
                        >
                          <Text className="font-semibold text-gray-900">
                            Xóa tìm kiếm
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <Text className="mb-2 text-lg font-semibold text-gray-900">
                          Chưa có loại hồ
                        </Text>
                        <Text className="mb-6 text-center text-sm text-gray-600">
                          Bắt đầu bằng cách tạo loại hồ đầu tiên của bạn
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowCreateModal(true)}
                          className="rounded-2xl bg-primary px-6 py-3"
                        >
                          <Text className="font-semibold text-white">
                            Tạo loại hồ
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}
              </>
            );
          }}
          renderItem={({ item: pondType }) => (
            <PondTypeCard
              pondType={pondType}
              onEdit={handleEditPondType}
              onDelete={handleDeletePondType}
            />
          )}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (!isFetchingNextPage && hasNextPage) {
              fetchNextPage();
            }
          }}
          refreshing={!!isRefetching}
          onRefresh={() => refetch()}
          ListFooterComponent={() =>
            isFetchingNextPage ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#0A3D62" />
                <Text className="mt-2 text-sm text-gray-500">
                  Đang tải thêm...
                </Text>
              </View>
            ) : !hasNextPage && pondTypes.length > 0 ? (
              <View className="pb-16">
                <Text className="text-center text-sm text-gray-500">
                  Đã hiển thị tất cả {totalItems} loại hồ
                </Text>
              </View>
            ) : null
          }
        />
      </SafeAreaView>

      {/* Create Pond Type Modal */}
      {/* Filter Sheet Modal */}
      <Modal
        visible={showFilterSheet}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterSheet(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="rounded-t-2xl bg-primary pb-4">
            <View className="items-center px-4 pt-2">
              <Text className="text-sm font-medium uppercase tracking-wide text-white/80">
                Tùy chỉnh
              </Text>
              <Text className="text-2xl font-bold text-white">Bộ lọc</Text>
            </View>
            <TouchableOpacity
              className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-white/20"
              onPress={() => setShowFilterSheet(false)}
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 20,
              paddingBottom: 100,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-4">
              <Text className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Lọc theo tiêu chí
              </Text>
              <View className="rounded-2xl border border-gray-200 bg-white p-4">
                <View className="mb-4">
                  <ContextMenuField
                    label="Loại hồ"
                    value={modalType ?? ''}
                    placeholder="Chọn loại hồ"
                    options={Object.values(TypeOfPond).map((t) => ({
                      label: typeToLabel(t),
                      value: t,
                    }))}
                    onSelect={(v) => setModalType(v as TypeOfPond)}
                  />
                </View>

                <View className="mb-4">
                  <Text className="mb-2 text-sm font-medium text-gray-700">
                    Số lượng khuyến nghị (từ)
                  </Text>
                  <TextInput
                    placeholder="Nhỏ nhất"
                    keyboardType="numeric"
                    value={minRecommendedStr}
                    onChangeText={setMinRecommendedStr}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-3"
                  />
                </View>

                <View>
                  <Text className="mb-2 text-sm font-medium text-gray-700">
                    Số lượng khuyến nghị (đến)
                  </Text>
                  <TextInput
                    placeholder="Lớn nhất"
                    keyboardType="numeric"
                    value={maxRecommendedStr}
                    onChangeText={setMaxRecommendedStr}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-3"
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-4">
            <View className="flex-row">
              <TouchableOpacity
                className="mr-2 flex-1 flex-row items-center justify-center rounded-2xl bg-gray-100 py-4"
                onPress={() => {
                  setModalType(undefined);
                  setMinRecommendedStr('');
                  setMaxRecommendedStr('');
                  setAppliedFilters({});
                  setShowFilterSheet(false);
                  refetch();
                }}
              >
                <RefreshCcw size={20} color="#6b7280" />
                <Text className="ml-2 text-lg font-semibold text-gray-700">
                  Đặt lại
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="ml-2 flex-1 flex-row items-center justify-center rounded-2xl bg-primary py-4"
                onPress={() => {
                  const min = minRecommendedStr
                    ? parseInt(minRecommendedStr, 10)
                    : undefined;
                  const max = maxRecommendedStr
                    ? parseInt(maxRecommendedStr, 10)
                    : undefined;
                  setAppliedFilters({
                    type: modalType,
                    minRecommendedQuantity: min,
                    maxRecommendedQuantity: max,
                  });
                  setShowFilterSheet(false);
                  refetch();
                }}
              >
                <Filter size={20} color="white" />
                <Text className="ml-2 text-lg font-semibold text-white">
                  Áp dụng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <CreatePondTypeModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Edit Pond Type Modal */}
      <EditPondTypeModal
        visible={showEditModal}
        pondTypeId={editingPondTypeId}
        onClose={handleCloseEditModal}
        parentFocused={isFocused}
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
    </>
  );
}

interface PondTypeCardProps {
  pondType: PondType;
  onEdit: (id: number) => void;
  onDelete: (pondType: PondType) => void;
}

function PondTypeCard({ pondType, onEdit, onDelete }: PondTypeCardProps) {
  return (
    <View className="mb-3 overflow-hidden rounded-2xl bg-white shadow-sm">
      <View className="p-4">
        {/* Header Row */}
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="flex-1 text-lg font-bold text-gray-900">
            {pondType.typeName}
          </Text>

          <View className="flex-row gap-2">
            <TouchableOpacity
              className="h-9 w-9 items-center justify-center rounded-2xl bg-blue-50"
              onPress={() => onEdit(pondType.id)}
            >
              <Edit size={18} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity
              className="h-9 w-9 items-center justify-center rounded-2xl bg-red-50"
              onPress={() => onDelete(pondType)}
            >
              <Trash2 size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        {pondType.description && (
          <View className="mb-3">
            <Text className="mb-1 text-base font-medium text-gray-600">
              Mô tả
            </Text>
            <Text className="text-sm leading-5 text-gray-600">
              {pondType.description}
            </Text>
          </View>
        )}

        {/* Recommended Quantity */}
        <View className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50">
          <Text className="mb-1 text-base font-medium text-gray-600">
            Số lượng khuyến nghị tối đa
          </Text>
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold text-green-600">
              {pondType.recommendedQuantity.toLocaleString('vi-VN')}
            </Text>
            <Text className="ml-1 mt-1 text-sm font-medium text-green-600">
              con
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
