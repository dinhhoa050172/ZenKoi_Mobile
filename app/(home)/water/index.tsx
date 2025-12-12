import ContextMenuField from '@/components/ContextMenuField';
import PondSvg from '@/components/icons/PondSvg';
import Loading from '@/components/Loading';
import CreatePondModal from '@/components/water/CreatePondModal';
import EditPondModal from '@/components/water/EditPondModal';
import PondItem from '@/components/water/PondItem';
import PondStats from '@/components/water/PondStats';
import { useGetAreas } from '@/hooks/useArea';
import { useGetPondsInfinite } from '@/hooks/usePond';
import { useGetPondTypes } from '@/hooks/usePondType';
import { PondSearchParams, PondStatus } from '@/lib/api/services/fetchPond';
import { TypeOfPond } from '@/lib/api/services/fetchPondType';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useFocusEffect } from '@react-navigation/native';
import {
  Droplet,
  Filter,
  Layers,
  MapPin,
  Plus,
  RefreshCcw,
  Search,
  X,
} from 'lucide-react-native';
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
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [editingPondId, setEditingPondId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');

  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState<PondSearchParams>({});

  // Modal filter states
  const [modalStatus, setModalStatus] = useState<PondStatus | undefined>(
    undefined
  );
  const [modalAreaId, setModalAreaId] = useState<number | undefined>(undefined);
  const [modalPondTypeId, setModalPondTypeId] = useState<number | undefined>(
    undefined
  );
  const [modalPondTypeEnum, setModalPondTypeEnum] = useState<
    TypeOfPond | undefined
  >(undefined);

  // Capacity (liters) range
  const [modalCapacityMin, setModalCapacityMin] = useState<number>(0);
  const [modalCapacityMax, setModalCapacityMax] = useState<number>(1000000);

  // Depth (meters) range
  const [modalDepthMin, setModalDepthMin] = useState<number>(0);
  const [modalDepthMax, setModalDepthMax] = useState<number>(5);

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
    setModalPondTypeEnum(undefined);
    setModalCapacityMin(0);
    setModalCapacityMax(1000000);
    setModalDepthMin(0);
    setModalDepthMax(5);
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

  const typeOfPondToLabel = (t: TypeOfPond) => {
    switch (t) {
      case TypeOfPond.PARING:
        return 'Ao phối giống';
      case TypeOfPond.EGG_BATCH:
        return 'Ao ấp trứng';
      case TypeOfPond.FRY_FISH:
        return 'Ao nuôi cá bột';
      case TypeOfPond.CLASSIFICATION:
        return 'Ao tuyển chọn';
      case TypeOfPond.MARKET_POND:
        return 'Ao cá bán';
      case TypeOfPond.BROOD_STOCK:
        return 'Ao cá giống';
      case TypeOfPond.QUARANTINE:
        return 'Ao cách ly';
      default:
        return String(t);
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

  const activeFiltersCount = Object.values(appliedFilters).filter(
    (v) => v !== undefined
  ).length;

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
            {error.message}
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
        <View className="rounded-t-2xl bg-primary pb-6">
          <View className="px-4 pt-2">
            <View className="mb-4 mt-2 flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-medium uppercase tracking-wide text-white/80">
                  Quản lý
                </Text>
                <Text className="text-2xl font-bold text-white">Hồ cá</Text>
              </View>
              <View className="flex-row items-center">
                {/* <TouchableOpacity
                  onPress={() => router.push('/pond')}
                  className="mr-2 h-12 w-12 items-center justify-center rounded-full bg-white/20"
                  accessibilityLabel="Loại hồ"
                >
                  <Layers size={20} color="white" />
                </TouchableOpacity> */}
                <TouchableOpacity
                  onPress={() => setShowAddModal(true)}
                  className="h-12 w-12 items-center justify-center rounded-full bg-white/20"
                >
                  <Plus size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center rounded-2xl bg-white px-4 shadow-sm">
              <Search size={20} color="#9ca3af" />
              <TextInput
                placeholder="Tìm kiếm hồ cá..."
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

        {/* Filter Bar */}
        <View className="flex-row items-center justify-between bg-white px-4 py-3 shadow-sm">
          <Text className="text-sm font-medium text-gray-700">
            {totalPonds} hồ cá
          </Text>
          <TouchableOpacity
            className="flex-row items-center rounded-full bg-gray-100 px-4 py-2"
            onPress={() => setShowFilterSheet(true)}
          >
            <Filter size={16} color="#6b7280" />
            <Text className="ml-2 text-sm font-medium text-gray-700">
              Bộ lọc
            </Text>
            {activeFiltersCount > 0 && (
              <View className="ml-2 h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                <Text className="text-xs font-bold text-white">
                  {activeFiltersCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FlatList
          data={ponds}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 30,
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={() => (
            <PondStats ponds={ponds} isLoading={isLoading} />
          )}
          ListEmptyComponent={() => {
            const hasActiveFilters =
              activeFiltersCount > 0 || debouncedSearchText;
            return (
              <>
                {isLoading ? (
                  <View className="h-[50vh] w-full items-center justify-center">
                    <Loading />
                  </View>
                ) : (
                  <View className="items-center rounded-2xl bg-white p-8 shadow-sm">
                    <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                      <PondSvg size={40} color="#3b82f6" />
                    </View>
                    {hasActiveFilters ? (
                      <>
                        <Text className="mb-2 text-lg font-semibold text-gray-900">
                          Không tìm thấy kết quả
                        </Text>
                        <Text className="mb-6 text-center text-base text-gray-600">
                          Không có hồ cá nào phù hợp với bộ lọc hiện tại
                        </Text>
                        <View className="flex-row">
                          <TouchableOpacity
                            onPress={() => {
                              setAppliedFilters({});
                              setSearchText('');
                              setDebouncedSearchText('');
                              resetModalFilters();
                            }}
                            className="mr-2 rounded-2xl bg-gray-100 px-6 py-3"
                          >
                            <Text className="font-semibold text-gray-900">
                              Xóa bộ lọc
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="rounded-2xl bg-blue-500 px-6 py-3"
                            onPress={() => setShowFilterSheet(true)}
                          >
                            <Text className="font-semibold text-white">
                              Điều chỉnh
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <>
                        <Text className="mb-2 text-lg font-semibold text-gray-900">
                          Chưa có hồ cá
                        </Text>
                        <Text className="mb-6 text-center text-sm text-gray-600">
                          Bắt đầu bằng cách tạo hồ cá đầu tiên của bạn
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowAddModal(true)}
                          className="rounded-2xl bg-blue-500 px-6 py-3"
                        >
                          <Text className="font-semibold text-white">
                            Tạo hồ mới
                          </Text>
                        </TouchableOpacity>
                      </>
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
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text className="mt-2 text-sm text-gray-500">
                  Đang tải thêm...
                </Text>
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
        <SafeAreaView className="flex-1 bg-gray-50">
          {/* Header */}
          <View className="rounded-t-2xl bg-primary pb-4">
            <View className="flex-row items-center justify-between px-4 pt-2">
              <View className="mt-2 flex-1 items-center">
                <Text className="text-sm font-medium uppercase tracking-wide text-white/80">
                  Tùy chỉnh
                </Text>
                <Text className="text-xl font-bold text-white">Bộ lọc</Text>
              </View>

              <TouchableOpacity
                className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
                onPress={() => setShowFilterSheet(false)}
              >
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>
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
            {/* Filters Section */}
            <View className="mb-4">
              <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
                Lọc theo tiêu chí
              </Text>

              <View className="rounded-2xl border border-gray-200 bg-white p-4">
                {/* Status Filter */}
                <View className="mb-4 flex-row items-start">
                  <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-green-100">
                    <Droplet size={18} color="#22c55e" />
                  </View>
                  <View className="flex-1">
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
                        className="mt-2"
                      >
                        <Text className="text-sm font-medium text-blue-500">
                          Xóa lựa chọn
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Area Filter */}
                <View className="mb-4 flex-row items-start">
                  <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                    <MapPin size={18} color="#f97316" />
                  </View>
                  <View className="flex-1">
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
                        className="mt-2"
                      >
                        <Text className="text-sm font-medium text-blue-500">
                          Xóa lựa chọn
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Pond Type Filter */}
                <View className="flex-row items-start">
                  <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                    <Layers size={18} color="#a855f7" />
                  </View>
                  <View className="flex-1">
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
                        className="mt-2"
                      >
                        <Text className="text-sm font-medium text-blue-500">
                          Xóa lựa chọn
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Pond Type Enum Filter */}
                <View className="mt-4 flex-row items-start">
                  <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-indigo-100">
                    <Layers size={18} color="#6366f1" />
                  </View>
                  <View className="flex-1">
                    <ContextMenuField
                      label="Mục đích"
                      value={modalPondTypeEnum || ''}
                      placeholder="Chọn mục đích"
                      options={Object.values(TypeOfPond).map((t) => ({
                        label: typeOfPondToLabel(t as TypeOfPond),
                        value: t,
                      }))}
                      onSelect={(val) =>
                        setModalPondTypeEnum(val as TypeOfPond)
                      }
                    />
                    {modalPondTypeEnum && (
                      <TouchableOpacity
                        onPress={() => setModalPondTypeEnum(undefined)}
                        className="mt-2"
                      >
                        <Text className="text-sm font-medium text-blue-500">
                          Xóa lựa chọn
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Capacity (liters) Range Filter */}
                <View className="mt-4 flex-row items-start">
                  <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                    <Droplet size={18} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-2 text-sm font-medium text-gray-700">
                      Dung tích (L)
                    </Text>
                    <Text className="mb-2 text-sm text-gray-500">
                      Từ {modalCapacityMin} đến {modalCapacityMax} L
                    </Text>
                    <MultiSlider
                      values={[modalCapacityMin, modalCapacityMax]}
                      min={0}
                      max={10000000}
                      step={10}
                      onValuesChangeFinish={(vals: number[]) => {
                        setModalCapacityMin(Math.round(vals[0]));
                        setModalCapacityMax(Math.round(vals[1]));
                      }}
                      selectedStyle={{ backgroundColor: '#3b82f6' }}
                      unselectedStyle={{ backgroundColor: '#e5e7eb' }}
                      trackStyle={{ height: 6, borderRadius: 3 }}
                      markerStyle={{
                        marginTop: 4,
                        backgroundColor: '#3b82f6',
                        height: 20,
                        width: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: '#fff',
                      }}
                      pressedMarkerStyle={{
                        height: 28,
                        width: 28,
                        backgroundColor: '#3b82f6',
                      }}
                      touchDimensions={{
                        height: 48,
                        width: 48,
                        borderRadius: 24,
                        slipDisplacement: 200,
                      }}
                      allowOverlap={false}
                      minMarkerOverlapDistance={16}
                    />
                  </View>
                </View>

                {/* Depth (meters) Range Filter */}
                <View className="mt-4 flex-row items-start">
                  <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-cyan-100">
                    <MapPin size={18} color="#06b6d4" />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-2 text-sm font-medium text-gray-700">
                      Độ sâu (m)
                    </Text>
                    <Text className="mb-2 text-sm text-gray-500">
                      Từ {modalDepthMin} đến {modalDepthMax} m
                    </Text>
                    <MultiSlider
                      values={[modalDepthMin, modalDepthMax]}
                      min={0}
                      max={20}
                      step={0.1}
                      onValuesChangeFinish={(vals: number[]) => {
                        // keep one decimal for meters
                        setModalDepthMin(Math.round(vals[0] * 10) / 10);
                        setModalDepthMax(Math.round(vals[1] * 10) / 10);
                      }}
                      selectedStyle={{ backgroundColor: '#06b6d4' }}
                      unselectedStyle={{ backgroundColor: '#e5e7eb' }}
                      trackStyle={{ height: 6, borderRadius: 3 }}
                      markerStyle={{
                        marginTop: 4,
                        backgroundColor: '#06b6d4',
                        height: 20,
                        width: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: '#fff',
                      }}
                      pressedMarkerStyle={{
                        height: 28,
                        width: 28,
                        backgroundColor: '#06b6d4',
                      }}
                      touchDimensions={{
                        height: 48,
                        width: 48,
                        borderRadius: 24,
                        slipDisplacement: 200,
                      }}
                      allowOverlap={false}
                      minMarkerOverlapDistance={16}
                    />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Fixed Bottom Actions */}
          <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-4">
            <View className="flex-row">
              <TouchableOpacity
                className="mr-2 flex-1 flex-row items-center justify-center rounded-2xl bg-gray-100 py-4"
                onPress={() => {
                  resetModalFilters();
                  setAppliedFilters({});
                  refetch();
                }}
              >
                <RefreshCcw size={18} color="#6b7280" />
                <Text className="ml-2 text-base font-semibold text-gray-700">
                  Đặt lại
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="ml-2 flex-1 flex-row items-center justify-center rounded-2xl bg-primary py-4"
                onPress={() => {
                  const newFilters: PondSearchParams = {
                    status: modalStatus,
                    areaId: modalAreaId,
                    pondTypeId: modalPondTypeId,
                    pondTypeEnum: modalPondTypeEnum,
                    minCapacityLiters: modalCapacityMin,
                    maxCapacityLiters: modalCapacityMax,
                    minDepthMeters: modalDepthMin,
                    maxDepthMeters: modalDepthMax,
                  };
                  setAppliedFilters(newFilters);
                  setShowFilterSheet(false);
                  refetch();
                }}
              >
                <Filter size={18} color="white" />
                <Text className="ml-2 text-base font-semibold text-white">
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
