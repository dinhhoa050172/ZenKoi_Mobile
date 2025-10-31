import ContextMenuField from '@/components/ContextMenuField';
import Loading from '@/components/Loading';
import CreatePondModal from '@/components/water/CreatePondModal';
import EditPondModal from '@/components/water/EditPondModal';
import PondItem from '@/components/water/PondItem';
import PondStats from '@/components/water/PondStats';
import { useGetAreas } from '@/hooks/useArea';
import { useGetPondsInfinite } from '@/hooks/usePond';
import { useGetPondTypes } from '@/hooks/usePondType';
import { PondSearchParams, PondStatus } from '@/lib/api/services/fetchPond';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Filter, Plus, Search, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

export default function PondManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [editingPondId, setEditingPondId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');

  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState<PondSearchParams>({});

  // Modal filter states (without search)
  const [modalStatus, setModalStatus] = useState<PondStatus | undefined>(
    undefined
  );
  const [modalAreaId, setModalAreaId] = useState<number | undefined>(undefined);
  const [modalPondTypeId, setModalPondTypeId] = useState<number | undefined>(
    undefined
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch areas and pond types for filters
  const { data: areasPage } = useGetAreas(true, {
    pageIndex: 1,
    pageSize: 100,
  });
  const { data: pondTypesPage } = useGetPondTypes(true, {
    pageIndex: 1,
    pageSize: 100,
  });

  const areaOptions = areasPage?.data ?? [];
  const pondTypeOptions = pondTypesPage?.data ?? [];
  const statusOptions = useMemo(() => Object.values(PondStatus), []);

  const resetModalFilters = () => {
    setModalStatus(undefined);
    setModalAreaId(undefined);
    setModalPondTypeId(undefined);
  };

  const statusToLabel = (status: PondStatus) => {
    switch (status) {
      case PondStatus.ACTIVE:
        return 'Hoạt động';
      case PondStatus.MAINTENANCE:
        return 'Bảo trì';
      case PondStatus.EMPTY:
        return 'Trống';
      default:
        return status;
    }
  };

  // Fetch ponds data with infinite scroll
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useGetPondsInfinite(
    {
      pageSize: 20,
      search: debouncedSearchText || undefined,
      ...appliedFilters,
    },
    true
  );

  // Flatten all pages into single array
  const ponds = data?.pages.flatMap((page) => page.data) || [];
  const totalPonds = data?.pages[0]?.totalItems || 0;

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

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
    <>
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-gray-50 px-4 pt-4">
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-900">
              Danh sách hồ cá
            </Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.push('/pond')}
                className="mr-2 rounded-lg bg-primary px-3 py-2"
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

          {/* Search */}
          <View className="mb-2 flex-row items-center">
            <View className="mr-2 flex-1 flex-row items-center rounded-2xl bg-white px-4 shadow-sm">
              <Search size={20} color="#9ca3af" />
              <TextInput
                placeholder="Tìm kiếm hồ cá..."
                value={searchText}
                onChangeText={setSearchText}
                className="ml-3 flex-1 text-gray-900"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <TouchableOpacity
              onPress={() => setShowFilterSheet(true)}
              className="rounded-2xl bg-white p-3 shadow-sm"
            >
              <Filter size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={ponds}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 20,
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={() => (
            <PondStats ponds={ponds} isLoading={isLoading} />
          )}
          ListEmptyComponent={() => {
            const hasActiveFilters =
              Object.keys(appliedFilters || {}).length > 0 ||
              debouncedSearchText;
            return (
              <>
                {isLoading ? (
                  <View className="h-[50vh] w-full items-center justify-center">
                    <Loading />
                  </View>
                ) : (
                  <View className="items-center py-8">
                    <Text className="mb-4 text-center text-gray-500">
                      {hasActiveFilters
                        ? 'Không tìm thấy hồ cá phù hợp với bộ lọc'
                        : 'Chưa có hồ cá nào'}
                    </Text>
                    {hasActiveFilters ? (
                      <TouchableOpacity
                        onPress={() => {
                          setAppliedFilters({});
                          setSearchText('');
                          setDebouncedSearchText('');
                          resetModalFilters();
                        }}
                        className="rounded-lg bg-gray-600 px-4 py-2"
                      >
                        <Text className="font-medium text-white">
                          Xóa bộ lọc
                        </Text>
                      </TouchableOpacity>
                    ) : (
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
              </>
            );
          }}
          renderItem={({ item: pond }) => (
            <PondItem pond={pond} onEditPond={handleEditPond} />
          )}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (!isFetchingNextPage && hasNextPage) {
              fetchNextPage();
            }
          }}
          refreshing={!!isRefetching}
          onRefresh={() => {
            refetch();
          }}
          ListFooterComponent={() =>
            isFetchingNextPage ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#0ea5e9" />
              </View>
            ) : !hasNextPage && ponds.length > 0 ? (
              <View className="pb-16">
                <Text className="text-center text-sm text-gray-500">
                  Đã hiển thị tất cả {totalPonds} hồ cá
                </Text>
              </View>
            ) : null
          }
        />
      </SafeAreaView>

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

      {/* Filter Sheet Modal */}
      <Modal
        visible={showFilterSheet}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterSheet(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 p-4">
            <Text className="text-lg font-semibold text-gray-900">Bộ lọc</Text>
            <TouchableOpacity
              className="p-1"
              onPress={() => setShowFilterSheet(false)}
            >
              <X size={24} color="red" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Status Filter */}
            <View className="mb-4">
              <ContextMenuField
                label="Trạng thái"
                value={modalStatus || ''}
                placeholder="Chọn trạng thái"
                options={statusOptions.map((s) => ({
                  label: statusToLabel(s),
                  value: s,
                }))}
                onSelect={(val) => setModalStatus(val as PondStatus)}
              />
              {modalStatus && (
                <TouchableOpacity
                  onPress={() => setModalStatus(undefined)}
                  className="mt-1"
                >
                  <Text className="text-sm text-blue-600">Xóa lựa chọn</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Area Filter */}
            <View className="mb-4">
              <ContextMenuField
                label="Khu vực"
                value={modalAreaId ? String(modalAreaId) : ''}
                placeholder="Chọn khu vực"
                options={areaOptions.map((area) => ({
                  label: area.areaName,
                  value: String(area.id),
                }))}
                onSelect={(val) => setModalAreaId(Number(val))}
              />
              {modalAreaId && (
                <TouchableOpacity
                  onPress={() => setModalAreaId(undefined)}
                  className="mt-1"
                >
                  <Text className="text-sm text-blue-600">Xóa lựa chọn</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Pond Type Filter */}
            <View className="mb-4">
              <ContextMenuField
                label="Loại hồ"
                value={modalPondTypeId ? String(modalPondTypeId) : ''}
                placeholder="Chọn loại hồ"
                options={pondTypeOptions.map((type) => ({
                  label: type.typeName,
                  value: String(type.id),
                }))}
                onSelect={(val) => setModalPondTypeId(Number(val))}
              />
              {modalPondTypeId && (
                <TouchableOpacity
                  onPress={() => setModalPondTypeId(undefined)}
                  className="mt-1"
                >
                  <Text className="text-sm text-blue-600">Xóa lựa chọn</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="border-t border-gray-200 p-4">
            <View className="flex-row">
              <TouchableOpacity
                className="mr-2 flex-1 rounded-2xl bg-gray-200 py-3"
                onPress={() => {
                  resetModalFilters();
                }}
              >
                <Text className="text-center font-semibold text-gray-700">
                  Đặt lại
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="ml-2 flex-1 rounded-2xl bg-primary py-3"
                onPress={() => {
                  const newFilters: PondSearchParams = {
                    status: modalStatus,
                    areaId: modalAreaId,
                    pondTypeId: modalPondTypeId,
                  };
                  setAppliedFilters(newFilters);
                  setShowFilterSheet(false);
                }}
              >
                <Text className="text-center font-semibold text-white">
                  Áp dụng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}
