import ContextMenuField from '@/components/ContextMenuField';
import Loading from '@/components/Loading';
import {
  useGetBreedingProcesses,
  useMarkBreedingProcessAsSpawned,
} from '@/hooks/useBreedingProcess';
import {
  useCreateEggBatch,
  useGetEggBatchByBreedingProcessId,
} from '@/hooks/useEggBatch';
import {
  useCreateFryFish,
  useGetFryFishByBreedingProcessId,
} from '@/hooks/useFryFish';
import { useCreateFrySurvivalRecord } from '@/hooks/useFrySurvivalRecord';
import {
  useCreateIncubationDailyRecord,
  useDeleteIncubationDailyRecord,
} from '@/hooks/useIncubationDailyRecord';
import { useGetPonds } from '@/hooks/usePond';
import type { BreedingProcess } from '@/lib/api/services/fetchBreedingProcess';
import {
  BreedingProcessSearchParams,
  BreedingResult,
  BreedingStatus,
} from '@/lib/api/services/fetchBreedingProcess';
import { IncubationDailyRecord } from '@/lib/api/services/fetchIncubationDailyRecord';
import { PondStatus } from '@/lib/api/services/fetchPond';
import { useRouter } from 'expo-router';
import {
  Egg,
  Eye,
  Filter,
  Fish,
  Mars,
  Search,
  Venus,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export default function BreedingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [showCountModal, setShowCountModal] = useState(false);
  const [countMethod, setCountMethod] = useState('Đếm theo mẫu');
  const [currentBreedingId, setCurrentBreedingId] = useState<number | null>(
    null
  );
  const [currentPondId, setCurrentPondId] = useState<number | null>(null);
  const [currentPondLabel, setCurrentPondLabel] = useState<string>('Chọn hồ');

  const resetCountModal = () => {
    setTotalWeight('');
    setSampleWeight('');
    setSampleCount('');
    setAvgWeight('');
    setCurrentPondId(null);
    setCurrentPondLabel('Chọn hồ');
    setCountMethod('Đếm theo mẫu');
    // clear inline errors
    setTotalWeightError('');
    setSampleWeightError('');
    setSampleCountError('');
    setAvgWeightError('');
    setPondError('');
  };

  // inline validation errors for count modal
  const [totalWeightError, setTotalWeightError] = useState('');
  const [sampleWeightError, setSampleWeightError] = useState('');
  const [sampleCountError, setSampleCountError] = useState('');
  const [avgWeightError, setAvgWeightError] = useState('');
  const [pondError, setPondError] = useState('');

  const [totalWeight, setTotalWeight] = useState('');
  const [sampleWeight, setSampleWeight] = useState('');
  const [sampleCount, setSampleCount] = useState('');
  const [avgWeight, setAvgWeight] = useState('');

  const normalizeDecimalInput = (input: string) => {
    if (!input) return '';
    let s = input.replace(/[^0-9.,]/g, '');
    const firstDot = s.indexOf('.');
    const firstComma = s.indexOf(',');
    if (firstDot !== -1 && firstComma !== -1) {
      if (firstDot < firstComma) {
        s = s.replace(/,/g, '');
      } else {
        s = s.replace(/\./g, '');
      }
    }
    const partsDot = s.split('.');
    if (partsDot.length > 2) s = partsDot.slice(0, 2).join('.');
    const partsComma = s.split(',');
    if (partsComma.length > 2) s = partsComma.slice(0, 2).join(',');
    return s;
  };
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Daily incubation record fields
  const [dailyDayNumber, setDailyDayNumber] = useState('');
  const [dailyHealthyEggs, setDailyHealthyEggs] = useState('');
  const [dailyRottenEggs, setDailyRottenEggs] = useState('');
  const [dailyHatchedEggs, setDailyHatchedEggs] = useState('');
  const [dailySuccess, setDailySuccess] = useState(false);
  const [dailyErrors, setDailyErrors] = useState<{
    dayNumber?: string;
    healthyEggs?: string;
    rottenEggs?: string;
    hatchedEggs?: string;
    eggBatch?: string;
    pond?: string;
  }>({});

  // transfer modal pond selection when moving to fry stage
  const [transferPondId, setTransferPondId] = useState<number | null>(null);
  const [transferPondLabel, setTransferPondLabel] = useState<string>('Chọn hồ');

  const eggBatchQuery = useGetEggBatchByBreedingProcessId(
    currentBreedingId ?? 0,
    !!currentBreedingId
  );
  const createIncubationMutation = useCreateIncubationDailyRecord();
  const deleteIncubationMutation = useDeleteIncubationDailyRecord();
  const clearTransferInputs = () => {
    setDailyDayNumber('');
    setDailyHealthyEggs('');
    setDailyRottenEggs('');
    setDailyHatchedEggs('');
    setDailySuccess(false);
    setDailyErrors({});
    setTransferPondId(null);
    setTransferPondLabel('Chọn hồ');
  };

  const openTransferModal = (breedingId: number | null) => {
    clearTransferInputs();
    setCurrentBreedingId(breedingId);
    setShowTransferModal(true);
  };

  const closeTransferModal = () => {
    clearTransferInputs();
    setCurrentBreedingId(null);
    setShowTransferModal(false);
  };
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectionCount, setSelectionCount] = useState('');

  // Filter modal and filter state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatusLabel, setFilterStatusLabel] = useState('Tất cả');
  const [filterResultLabel, setFilterResultLabel] = useState('Tất cả');
  const [filterPondId, setFilterPondId] = useState('');
  const [filterPondLabel, setFilterPondLabel] = useState('Chọn hồ');
  const [filterStartDateFrom, setFilterStartDateFrom] = useState('');
  const [filterStartDateTo, setFilterStartDateTo] = useState('');

  const [appliedFilters, setAppliedFilters] = useState<
    BreedingProcessSearchParams | undefined
  >(undefined);

  const breedingQueryFilters: BreedingProcessSearchParams = appliedFilters
    ? { ...appliedFilters }
    : {};
  breedingQueryFilters.pageIndex = 1;
  breedingQueryFilters.pageSize = 30;

  const {
    data: breedingPages,
    isLoading: breedingLoading,
    refetch: refetchBreeding,
    isRefetching: breedingRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetBreedingProcesses(breedingQueryFilters, true);

  const { data: pondPage, isLoading: pondLoading } = useGetPonds(true, {
    pageIndex: 1,
    pageSize: 200,
  });
  const { data: emptyPondPage } = useGetPonds(true, {
    pageIndex: 1,
    pageSize: 200,
    status: PondStatus.EMPTY,
  });

  const createEggBatch = useCreateEggBatch();
  const markAsSpawned = useMarkBreedingProcessAsSpawned();
  const [markingSpawnedId, setMarkingSpawnedId] = useState<number | null>(null);

  // Fry survival modal state + hooks
  const [showFryUpdateModal, setShowFryUpdateModal] = useState(false);
  const [fryDayNumber, setFryDayNumber] = useState('');
  const [fryCountAlive, setFryCountAlive] = useState('');
  const [fryNote, setFryNote] = useState('');
  const [frySuccess, setFrySuccess] = useState(false);
  const [fryErrors, setFryErrors] = useState<{
    dayNumber?: string;
    countAlive?: string;
    fryFish?: string;
  }>({});

  const fryFishQuery = useGetFryFishByBreedingProcessId(
    currentBreedingId ?? 0,
    !!currentBreedingId
  );
  const createFrySurvival = useCreateFrySurvivalRecord();
  const createFryFish = useCreateFryFish();

  const resetFryModal = () => {
    setFryDayNumber('');
    setFryCountAlive('');
    setFryNote('');
    setFrySuccess(false);
    setFryErrors({});
  };

  const closeFryModal = () => {
    resetFryModal();
    setCurrentBreedingId(null);
    setShowFryUpdateModal(false);
  };

  const openFryModal = (breedingId: number | null) => {
    resetFryModal();
    setCurrentBreedingId(breedingId);
    setShowFryUpdateModal(true);
  };

  const mapStatus = (status?: BreedingStatus | string) => {
    switch (status) {
      case BreedingStatus.PAIRING:
        return 'Đang ghép cặp';
      case BreedingStatus.SPAWNED:
        return 'Đã đẻ';
      case BreedingStatus.EGG_BATCH:
        return 'Ấp trứng';
      case BreedingStatus.FRY_FISH:
        return 'Nuôi cá bột';
      case BreedingStatus.CLASSIFICATION:
        return 'Tuyển chọn';
      case BreedingStatus.FAILED:
        return 'Hủy ghép cặp';
      case BreedingStatus.COMPLETE:
        return 'Hoàn thành';
      default:
        const s = String(status ?? '');
        if (/pairing/i.test(s)) return 'Đang ghép cặp';
        if (/spawned/i.test(s)) return 'Đã đẻ';
        if (/egg/i.test(s)) return 'Ấp trứng';
        if (/fry/i.test(s)) return 'Nuôi cá bột';
        if (/classification/i.test(s)) return 'Tuyển chọn';
        if (/failed/i.test(s)) return 'Hủy ghép cặp';
        if (/complete/i.test(s)) return 'Hoàn thành';
        return s;
    }
  };

  const breedingListToRender: BreedingProcess[] =
    (breedingPages?.pages?.flatMap(
      (p) => (p?.data as BreedingProcess[]) || []
    ) ?? []) as BreedingProcess[];

  const getStatusColor = (status?: BreedingStatus | string) => {
    switch (status) {
      case BreedingStatus.PAIRING:
        return '#3b82f6'; // blue
      case BreedingStatus.SPAWNED:
        return '#f59e0b'; // amber
      case BreedingStatus.EGG_BATCH:
        return '#fb923c'; // orange
      case BreedingStatus.FRY_FISH:
        return '#10b981'; // green
      case BreedingStatus.CLASSIFICATION:
        return '#6366f1'; // indigo
      case BreedingStatus.FAILED:
        return '#ef4444'; // red
      case BreedingStatus.COMPLETE:
        return '#06b6d4'; // teal-ish for complete
      default: {
        const s = String(status ?? '');
        if (/pairing/i.test(s)) return '#3b82f6';
        if (/spawned|đã đẻ/i.test(s)) return '#f59e0b';
        if (/egg|Ấp trứng/i.test(s)) return '#fb923c';
        if (/fry|bột/i.test(s)) return '#10b981';
        if (/classification|tuyển/i.test(s)) return '#6366f1';
        if (/failed|hủy/i.test(s)) return '#ef4444';
        if (/complete|hoàn/i.test(s)) return '#06b6d4';
        return '#6b7280'; // gray
      }
    }
  };

  const mapResult = (r?: BreedingResult | string) => {
    const s = String(r ?? 'Unknown');
    switch (s) {
      case BreedingResult.SUCCESS:
        return 'Thành công';
      case BreedingResult.FAILED:
        return 'Thất bại';
      case BreedingResult.PARTIAL_SUCCESS:
        return 'Một phần thành công';
      default:
        return 'Chưa rõ';
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const daysSince = (iso?: string) => {
    if (!iso) return 0;
    const start = new Date(iso);
    if (isNaN(start.getTime())) return 0;
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusText = (status: string) => {
    return status;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Search */}
        <View className="mb-4">
          <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4">
            <TextInput
              className="flex-1 text-gray-900"
              placeholder="Tìm kiếm ..."
              value={filterSearch}
              onChangeText={(t) => setFilterSearch(t)}
              onSubmitEditing={() => {
                setAppliedFilters((prev: any) => ({
                  ...(prev || {}),
                  search: filterSearch,
                }));
                refetchBreeding();
              }}
              placeholderTextColor="#9ca3af"
            />

            {filterSearch ? (
              <TouchableOpacity
                className="p-2"
                onPress={() => {
                  setFilterSearch('');
                  setAppliedFilters((prev: any) => {
                    if (!prev) return prev;
                    const copy = { ...prev };
                    delete copy.search;
                    return Object.keys(copy).length ? copy : undefined;
                  });
                  refetchBreeding();
                }}
                accessibilityLabel="Xóa tìm kiếm"
              >
                <X size={16} color="#6b7280" />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              className="left-4 rounded-r-2xl bg-primary p-3"
              onPress={() => {
                setAppliedFilters((prev: any) => ({
                  ...(prev || {}),
                  search: filterSearch,
                }));
                refetchBreeding();
              }}
            >
              <Search size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-900">
            Quản lý sinh sản
          </Text>
          <TouchableOpacity
            className="rounded-lg border border-gray-300 px-3 py-2"
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={16} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-4">
          <View className="w-11/12 rounded-2xl bg-white p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-lg font-semibold">Bộ lọc</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {pondLoading ? (
              <View className="mb-3 rounded border border-gray-200 p-2">
                <Text className="text-sm text-gray-600">Đang tải hồ...</Text>
              </View>
            ) : (
              <ContextMenuField
                label="Hồ"
                value={filterPondLabel}
                options={(pondPage?.data ?? []).map((p) => ({
                  label: `${p.id}: ${p.pondName ?? p.id}`,
                  value: `${p.id}: ${p.pondName ?? p.id}`,
                }))}
                onSelect={(v) => {
                  const id = String(v).split(':')[0]?.trim();
                  setFilterPondId(id ?? '');
                  setFilterPondLabel(String(v));
                }}
                placeholder="Chọn hồ"
              />
            )}

            <ContextMenuField
              label="Trạng thái"
              value={filterStatusLabel}
              options={[
                { label: 'Tất cả', value: 'Tất cả' },
                { label: 'Đang ghép cặp', value: 'Đang ghép cặp' },
                { label: 'Ấp trứng', value: 'Ấp trứng' },
                { label: 'Nuôi cá bột', value: 'Nuôi cá bột' },
                { label: 'Tuyển chọn', value: 'Tuyển chọn' },
                { label: 'Hoàn thành', value: 'Hoàn thành' },
                { label: 'Hủy ghép cặp', value: 'Hủy ghép cặp' },
              ]}
              onSelect={(v) => setFilterStatusLabel(v)}
              placeholder="Chọn trạng thái"
            />

            <ContextMenuField
              label="Kết quả"
              value={filterResultLabel}
              options={[
                { label: 'Tất cả', value: 'Tất cả' },
                { label: 'Thành công', value: 'Thành công' },
                { label: 'Thất bại', value: 'Thất bại' },
                { label: 'Một phần thành công', value: 'Một phần thành công' },
                { label: 'Chưa rõ', value: 'Chưa rõ' },
              ]}
              onSelect={(v) => setFilterResultLabel(v)}
              placeholder="Chọn kết quả"
            />

            <View className="mt-4 flex-row justify-between">
              <TouchableOpacity
                className="rounded-lg border border-gray-200 px-4 py-2"
                onPress={() => {
                  setFilterSearch('');
                  setFilterPondId('');
                  setFilterPondLabel('Chọn hồ');
                  setFilterStatusLabel('Tất cả');
                  setFilterResultLabel('Tất cả');
                  setFilterStartDateFrom('');
                  setFilterStartDateTo('');
                  setAppliedFilters(undefined);
                  refetchBreeding();
                }}
              >
                <Text>Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-lg bg-primary px-4 py-2"
                onPress={() => {
                  const f: BreedingProcessSearchParams = {};
                  if (filterSearch) f.search = filterSearch;
                  if (filterPondId) f.pondId = Number(filterPondId);
                  if (filterStatusLabel && filterStatusLabel !== 'Tất cả') {
                    const label = filterStatusLabel;
                    if (label === 'Đang ghép cặp')
                      f.status = BreedingStatus.PAIRING;
                    else if (label === 'Ấp trứng')
                      f.status = BreedingStatus.SPAWNED;
                    else if (label === 'Nuôi cá bột')
                      f.status = BreedingStatus.EGG_BATCH;
                    else if (label === 'Tuyển chọn')
                      f.status = BreedingStatus.CLASSIFICATION;
                    else if (label === 'Hoàn thành')
                      f.status = BreedingStatus.COMPLETE;
                    else if (label === 'Hủy ghép cặp')
                      f.status = BreedingStatus.FAILED;
                  }
                  if (filterResultLabel && filterResultLabel !== 'Tất cả') {
                    const label = filterResultLabel;
                    if (label === 'Thành công')
                      f.result = BreedingResult.SUCCESS;
                    else if (label === 'Thất bại')
                      f.result = BreedingResult.FAILED;
                    else if (label === 'Một phần thành công')
                      f.result = BreedingResult.PARTIAL_SUCCESS;
                  }
                  if (filterStartDateFrom)
                    f.startDateFrom = filterStartDateFrom;
                  if (filterStartDateTo) f.startDateTo = filterStartDateTo;

                  setAppliedFilters(Object.keys(f).length ? f : undefined);
                  setShowFilterModal(false);
                }}
              >
                <Text className="text-white">Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={breedingListToRender}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 30,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={() => (
          <>
            {breedingLoading ? (
              <View className="h-[50vh] w-full items-center justify-center">
                <Loading />
              </View>
            ) : (
              <View className="mt-8 items-center">
                <Text className="mb-4 text-gray-600">
                  Chưa có quy trình sinh sản nào.
                </Text>
                {appliedFilters ? (
                  <TouchableOpacity
                    className="rounded-lg bg-primary px-4 py-2"
                    onPress={() => {
                      setAppliedFilters(undefined);
                      setFilterSearch('');
                      setFilterPondId('');
                      setFilterPondLabel('Chọn hồ');
                      setFilterStatusLabel('Tất cả');
                      setFilterResultLabel('Tất cả');
                      setFilterStartDateFrom('');
                      setFilterStartDateTo('');
                      refetchBreeding();
                    }}
                  >
                    <Text className="text-white">Xóa bộ lọc</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          </>
        )}
        renderItem={({ item: b }) => {
          const statusLabel = mapStatus(b.status ?? '');
          const color = getStatusColor(b.status ?? statusLabel);
          const badgeBg = color + '20';

          const maleFish = b.maleKoiVariety ?? '—';
          const femaleFish = b.femaleKoiVariety ?? '—';
          const pond = b.pondName ?? '—';
          const eggCount = b.koiFishes?.length ?? 0;

          return (
            <View
              key={b.id}
              className="mb-4 rounded-2xl bg-white px-4 py-2 shadow-sm"
            >
              {/* Header */}
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-gray-900">
                  {b.code !== '' ? `#${b.code}` : `Quy trình #${b.id}`}
                </Text>
                <View
                  className="rounded-full px-2 py-1"
                  style={{ backgroundColor: badgeBg }}
                >
                  <Text className="text-xs font-medium" style={{ color }}>
                    {getStatusText(statusLabel)}
                  </Text>
                </View>
              </View>

              {/* Common top info */}
              <View className="mb-3">
                <View className="mb-2 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Text className="text-base">{maleFish}</Text>
                    <Mars
                      size={12}
                      color="#6b7280"
                      style={{ marginHorizontal: 2 }}
                    />
                    <Text className="text-sm"> × </Text>
                    <Text className="text-base">{femaleFish}</Text>
                    <Venus
                      size={12}
                      color="#6b7280"
                      style={{ marginLeft: 2 }}
                    />
                  </View>
                </View>

                <View className="flex-col">
                  <View className="flex-row items-center">
                    <View className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
                    <Text className="text-sm text-gray-600">Hồ: {pond}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-sm text-gray-600">
                      Bắt đầu: {formatDate(b.startDate)}
                    </Text>
                    <Text className="ml-1 text-sm text-gray-500">•</Text>
                    <Text className="ml-1 text-sm text-gray-600">
                      {daysSince(b.startDate)} ngày
                    </Text>
                  </View>
                </View>
              </View>

              {/* Variants by status */}
              {statusLabel === 'Đang ghép cặp' && (
                <View>
                  <View className="mt-2 flex-row border-t border-gray-200 pt-2">
                    <TouchableOpacity
                      className={`mr-2 flex-1 flex-row items-center justify-center rounded-lg py-2 ${markingSpawnedId === b.id ? 'bg-green-500 opacity-60' : 'bg-green-600'}`}
                      onPress={async () => {
                        if (!b.id) return;
                        setMarkingSpawnedId(b.id);
                        try {
                          await markAsSpawned.mutateAsync(b.id);
                          refetchBreeding();
                        } catch (err: any) {
                          Alert.alert(
                            'Lỗi',
                            err?.message ?? 'Không thể cập nhật trạng thái'
                          );
                        } finally {
                          setMarkingSpawnedId(null);
                        }
                      }}
                      disabled={markingSpawnedId === b.id}
                    >
                      {markingSpawnedId === b.id ? (
                        <View className="flex-row items-center">
                          <ActivityIndicator size="small" color="#fff" />
                          <Text className="ml-2 font-medium text-white">
                            Đang cập nhật...
                          </Text>
                        </View>
                      ) : (
                        <Text className="font-medium text-white">
                          Cập nhật: Đã đẻ
                        </Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="ml-2 flex-1 flex-row items-center justify-center rounded-lg border border-gray-200 py-2"
                      onPress={() => router.push(`/breeding/${b.id}`)}
                    >
                      <Eye size={16} color="#6b7280" />
                      <Text className="ml-2 text-sm text-gray-600">
                        Chi tiết
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {statusLabel === 'Đã đẻ' && (
                <View>
                  <View className="mt-2 border-t border-gray-200 pt-2">
                    <View className="mb-2 flex-row">
                      <TouchableOpacity
                        className="mr-2 flex-1 flex-row items-center justify-center rounded-lg py-2"
                        style={{ backgroundColor: '#fb923c' }}
                        onPress={() => {
                          setCurrentBreedingId(b.id ?? null);
                          setCurrentPondId((b as any).pondId ?? null);
                          setCurrentPondLabel(b.pondName ?? 'Chọn hồ');
                          resetCountModal();
                          setShowCountModal(true);
                        }}
                      >
                        <Egg size={16} color="white" />
                        <Text className="ml-2 font-medium text-white">
                          Đếm trứng
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center rounded-lg border border-gray-200 py-2"
                        onPress={() => router.push(`/breeding/${b.id}`)}
                      >
                        <Eye size={16} color="#6b7280" />
                        <Text className="ml-2 text-sm text-gray-700">
                          Xem chi tiết
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {statusLabel === 'Ấp trứng' && (
                <View>
                  <View className="rounded-lg bg-gray-50 p-3">
                    <Text className="text-sm text-gray-600">
                      Số trứng:{' '}
                      <Text className="font-semibold text-gray-900">
                        {b.totalEggs ?? 0} quả
                      </Text>{' '}
                      Tỷ lệ thụ tinh:{' '}
                      <Text className="font-semibold text-gray-900">85%</Text>
                    </Text>
                    <Text className="mt-2 text-sm text-gray-600">
                      Số ngày ấp:{' '}
                      <Text className="font-semibold text-gray-900">
                        {daysSince(eggBatchQuery.data?.spawnDate)} ngày
                      </Text>
                    </Text>
                  </View>

                  <View className="mt-3">
                    <View className="flex-row justify-between">
                      <View className="mr-2 flex-1 items-center rounded bg-green-50 p-3">
                        <Text className="text-sm font-medium text-green-700">
                          Khỏe
                        </Text>
                        <Text className="text-xl font-bold text-green-700">
                          0
                        </Text>
                      </View>
                      <View className="mr-2 flex-1 items-center rounded bg-orange-50 p-3">
                        <Text className="text-sm font-medium text-orange-600">
                          Hỏng
                        </Text>
                        <Text className="text-xl font-bold text-orange-600">
                          0
                        </Text>
                      </View>
                      <View className="flex-1 items-center rounded bg-purple-50 p-3">
                        <Text className="text-sm font-medium text-purple-600">
                          Đã nở
                        </Text>
                        <Text className="text-xl font-bold text-purple-600">
                          0
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="mt-4 border-t border-gray-200 pt-2">
                    <View className="flex-row">
                      <TouchableOpacity
                        className="mr-2 flex-1 flex-row items-center justify-center rounded-lg py-2"
                        style={{ backgroundColor: '#10b981' }}
                        onPress={() => {
                          // open transfer (update egg batch) modal and ensure inputs are reset
                          openTransferModal(b.id ?? null);
                        }}
                      >
                        <Egg size={16} color="white" />
                        <Text className="ml-2 font-medium text-white">
                          Cập nhập trứng
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center rounded-lg border border-gray-200 py-2"
                        onPress={() => router.push(`/breeding/${b.id}`)}
                      >
                        <Eye size={16} color="#6b7280" />
                        <Text className="ml-2 text-sm text-gray-700">
                          Xem chi tiết
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {statusLabel === 'Nuôi cá bột' && (
                <View>
                  <View className="rounded-lg bg-gray-50 p-3">
                    <Text className="text-sm text-gray-600">
                      Cá bột:{' '}
                      <Text className="font-semibold text-gray-900">
                        {eggCount} con
                      </Text>
                    </Text>
                    <Text className="mt-2 text-sm text-gray-600">
                      Bắt đầu:{' '}
                      <Text className="font-semibold text-gray-900">
                        {formatDate(b.startDate)}
                      </Text>
                    </Text>
                  </View>

                  <View className="mt-3 rounded-lg border border-gray-100 bg-white p-3">
                    <View className="mb-2 flex-row">
                      <Text className="flex-1 text-center text-sm text-pink-600">
                        7 ngày
                      </Text>
                      <Text className="flex-1 text-center text-sm text-orange-500">
                        14 ngày
                      </Text>
                      <Text className="flex-1 text-center text-sm text-yellow-500">
                        30 ngày
                      </Text>
                      <Text className="flex-1 text-center text-sm text-blue-500">
                        Hiện tại
                      </Text>
                    </View>
                    <View className="flex-row">
                      <Text className="flex-1 text-center text-sm text-gray-900">
                        92%
                      </Text>
                      <Text className="flex-1 text-center text-sm text-gray-900">
                        85%
                      </Text>
                      <Text className="flex-1 text-center text-sm text-gray-900">
                        78%
                      </Text>
                      <Text className="flex-1 text-center text-sm text-gray-900">
                        72%
                      </Text>
                    </View>
                  </View>

                  {/* <View className="mt-4 border-t border-gray-200 pt-2">
                    <View className="mb-2 flex-row space-x-2">
                      <TouchableOpacity className="mr-2 flex-1 flex-row items-center justify-center rounded-lg bg-purple-600 py-2" onPress={() => setShowFryUpdateModal(true)}>
                        <Fish size={16} color="white" />
                        <Text className="ml-2 font-medium text-white">Cập nhật cá bột</Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-lg bg-indigo-600 py-2" onPress={() => {}}>
                        <Camera size={16} color="white" />
                        <Text className="ml-2 font-medium text-white">Đếm bằng camera</Text>
                      </TouchableOpacity>
                    </View>
                    <View>
                      <TouchableOpacity className="w-full flex-row items-center justify-center rounded-lg border border-gray-200 py-2" onPress={() => router.push(`/breeding/${b.id}`)}>
                        <Eye size={16} color="#6b7280" />
                        <Text className="ml-2 text-gray-700">Chi tiết</Text>
                      </TouchableOpacity>
                    </View>
                  </View> */}

                  <View className="mt-4 border-t border-gray-200 pt-2">
                    <View className="mb-2 flex-row space-x-2">
                      <TouchableOpacity
                        className="mr-2 flex-1 flex-row items-center justify-center rounded-lg bg-purple-600 py-2"
                        onPress={() => openFryModal(b.id ?? null)}
                      >
                        <Fish size={16} color="white" />
                        <Text className="ml-2 font-medium text-white">
                          Cập nhật cá bột
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center rounded-lg border border-gray-200 py-2"
                        onPress={() => router.push(`/breeding/${b.id}`)}
                      >
                        <Eye size={16} color="#6b7280" />
                        <Text className="ml-2 text-gray-700">Chi tiết</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {statusLabel === 'Tuyển chọn' && (
                <View>
                  <View className="rounded-lg bg-gray-50 p-3">
                    <Text className="text-sm text-gray-600">
                      Kết quả:{' '}
                      <Text className="font-semibold text-gray-900">
                        {mapResult(b.result)}
                      </Text>
                    </Text>
                    <Text className="mt-2 text-sm text-gray-600">
                      Số cá:{' '}
                      <Text className="font-semibold text-gray-900">
                        {eggCount} con
                      </Text>
                    </Text>
                  </View>

                  <View className="mt-3 rounded-lg border border-gray-100 bg-white p-3">
                    {/* table simulated */}
                    <View className="mb-1 flex-row rounded bg-gray-50 p-2">
                      <Text className="flex-1 text-center text-xs font-medium text-gray-600">
                        Lần
                      </Text>
                      <Text className="flex-1 text-center text-xs font-medium text-gray-600">
                        Show
                      </Text>
                      <Text className="flex-1 text-center text-xs font-medium text-gray-600">
                        High
                      </Text>
                      <Text className="flex-1 text-center text-xs font-medium text-gray-600">
                        Pond
                      </Text>
                      <Text className="flex-1 text-center text-xs font-medium text-gray-600">
                        Cull
                      </Text>
                    </View>
                    {[1, 2, 3, 4].map((i) => (
                      <View
                        key={i}
                        className="flex-row border-b border-gray-100 py-1"
                      >
                        <Text className="flex-1 text-center text-xs text-gray-900">
                          {i}
                        </Text>
                        <Text className="flex-1 text-center text-xs text-gray-900">
                          0
                        </Text>
                        <Text className="flex-1 text-center text-xs text-gray-900">
                          0
                        </Text>
                        <Text className="flex-1 text-center text-xs text-gray-900">
                          1000
                        </Text>
                        <Text className="flex-1 text-center text-xs text-gray-900">
                          1000
                        </Text>
                      </View>
                    ))}

                    <View className="mt-3 flex-row justify-center">
                      <Text className="mr-4 mt-1 text-sm text-black">
                        Danh sách định danh
                      </Text>
                      <TouchableOpacity
                        className="flex-row items-center rounded-lg border border-gray-300 px-3 py-1"
                        onPress={() =>
                          router.push(`/breeding/${b.id}/fish-list`)
                        }
                      >
                        <Eye size={16} color="black" />
                        <Text className="ml-1 text-sm text-black">
                          Xem chi tiết
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="mt-4 flex-row border-t border-gray-200 pt-2">
                    <TouchableOpacity
                      className="mr-2 flex-1 flex-row items-center justify-center rounded-lg bg-yellow-400 py-2"
                      onPress={() => setShowSelectionModal(true)}
                    >
                      <Filter size={16} color="white" />
                      <Text className="ml-2 font-medium text-white">
                        Tuyển chọn lần 1
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center rounded-lg border border-gray-200 py-2"
                      onPress={() => router.push(`/breeding/${b.id}`)}
                    >
                      <Eye size={16} color="#6b7280" />
                      <Text className="ml-2 text-gray-700">Xem chi tiết</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {statusLabel === 'Hủy ghép cặp' && (
                <View>
                  <View className="rounded-lg bg-gray-50 p-3">
                    <Text className="text-sm text-gray-600">
                      Kết quả:{' '}
                      <Text className="font-semibold text-gray-900">
                        {mapResult(b.result)}
                      </Text>
                    </Text>
                    <Text className="mt-2 text-sm text-gray-600">
                      Số cá:{' '}
                      <Text className="font-semibold text-gray-900">
                        {eggCount} con
                      </Text>
                    </Text>
                  </View>

                  <View className="mt-4 border-t border-gray-200 pt-2">
                    <TouchableOpacity
                      className="flex-row items-center justify-center rounded-lg border border-gray-200 py-2"
                      onPress={() => router.push(`/breeding/${b.id}`)}
                    >
                      <Eye size={16} color="#6b7280" />
                      <Text className="ml-2 text-gray-700">Chi tiết</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        }}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (!isFetchingNextPage && hasNextPage) {
            fetchNextPage();
          }
        }}
        refreshing={!!breedingRefetching}
        onRefresh={() => refetchBreeding()}
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="#6b7280" />
            </View>
          ) : null
        }
      />

      {/* Count modal */}
      <Modal
        visible={showCountModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-4">
          <View
            className="w-11/12 rounded-2xl bg-white"
            style={{ maxHeight: '75%' }}
          >
            <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
              <Text className="text-lg font-semibold">Đếm số lượng trứng</Text>
              <TouchableOpacity onPress={() => setShowCountModal(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              <Text className="mb-2 text-sm text-gray-600">
                Chọn phương pháp đếm trứng phù hợp
              </Text>
              <ContextMenuField
                label="Phương pháp đếm"
                value={countMethod}
                options={[
                  { label: 'Đếm theo mẫu', value: 'Đếm theo mẫu' },
                  {
                    label: 'Đếm theo trọng lượng',
                    value: 'Đếm theo trọng lượng',
                  },
                ]}
                onSelect={(v) => setCountMethod(v)}
                placeholder="Chọn phương pháp đếm"
              />

              {countMethod === 'Đếm theo mẫu' ? (
                <View>
                  <Text className="text-xs text-gray-500">
                    Tổng trọng lượng trứng (gram) *
                  </Text>
                  <TextInput
                    className="mb-2 rounded border border-gray-200 p-2"
                    value={totalWeight}
                    onChangeText={(t) => {
                      const v = normalizeDecimalInput(t);
                      setTotalWeight(v);
                      setTotalWeightError('');
                    }}
                    placeholder="VD: 500"
                    keyboardType="numeric"
                  />
                  {totalWeightError ? (
                    <Text className="mb-2 text-sm text-red-500">
                      {totalWeightError}
                    </Text>
                  ) : null}
                  <Text className="text-xs text-gray-500">
                    Trọng lượng mẫu (gram) *
                  </Text>
                  <TextInput
                    className="mb-2 rounded border border-gray-200 p-2"
                    value={sampleWeight}
                    onChangeText={(t) => {
                      const v = normalizeDecimalInput(t);
                      setSampleWeight(v);
                      setSampleWeightError('');
                    }}
                    placeholder="VD: 10"
                    keyboardType="numeric"
                  />
                  {sampleWeightError ? (
                    <Text className="mb-2 text-sm text-red-500">
                      {sampleWeightError}
                    </Text>
                  ) : null}
                  <Text className="text-xs text-gray-500">
                    Số trứng trong mẫu *
                  </Text>
                  <TextInput
                    className="mb-2 rounded border border-gray-200 p-2"
                    value={sampleCount}
                    onChangeText={(t) => {
                      const v = t.replace(/[^0-9]/g, '');
                      setSampleCount(v);
                      setSampleCountError('');
                    }}
                    placeholder="VD: 150"
                    keyboardType="numeric"
                  />
                  {sampleCountError ? (
                    <Text className="mb-2 text-sm text-red-500">
                      {sampleCountError}
                    </Text>
                  ) : null}
                  <ContextMenuField
                    label="Hồ"
                    value={currentPondLabel}
                    options={(emptyPondPage?.data ?? []).map((p) => ({
                      label: `${p.id}: ${p.pondName ?? p.id}`,
                      value: `${p.id}: ${p.pondName ?? p.id}`,
                    }))}
                    onSelect={(v) => {
                      const id = String(v).split(':')[0]?.trim();
                      setCurrentPondId(id ? Number(id) : null);
                      setCurrentPondLabel(String(v));
                      setPondError('');
                    }}
                    placeholder="Chọn hồ"
                  />
                  {pondError ? (
                    <Text className="mb-2 text-sm text-red-500">
                      {pondError}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <View>
                  <Text className="text-xs text-gray-500">
                    Tổng trọng lượng trứng (gram) *
                  </Text>
                  <TextInput
                    className="mb-2 rounded border border-gray-200 p-2"
                    value={totalWeight}
                    onChangeText={(t) => {
                      const v = normalizeDecimalInput(t);
                      setTotalWeight(v);
                      setTotalWeightError('');
                    }}
                    placeholder="VD: 500"
                    keyboardType="numeric"
                  />
                  {totalWeightError ? (
                    <Text className="mb-2 text-sm text-red-500">
                      {totalWeightError}
                    </Text>
                  ) : null}
                  <Text className="text-xs text-gray-500">
                    Trọng lượng trung bình 1 trứng (gram)
                  </Text>
                  <TextInput
                    className="mb-2 rounded border border-gray-200 p-2"
                    value={avgWeight}
                    onChangeText={(t) => {
                      const v = normalizeDecimalInput(t);
                      setAvgWeight(v);
                      setAvgWeightError('');
                    }}
                    placeholder="VD: 0.067"
                    keyboardType="numeric"
                  />
                  {avgWeightError ? (
                    <Text className="mb-2 text-sm text-red-500">
                      {avgWeightError}
                    </Text>
                  ) : null}
                  <ContextMenuField
                    label="Hồ"
                    value={currentPondLabel}
                    options={(emptyPondPage?.data ?? []).map((p) => ({
                      label: `${p.id}: ${p.pondName ?? p.id}`,
                      value: `${p.id}: ${p.pondName ?? p.id}`,
                    }))}
                    onSelect={(v) => {
                      const id = String(v).split(':')[0]?.trim();
                      setCurrentPondId(id ? Number(id) : null);
                      setCurrentPondLabel(String(v));
                      setPondError('');
                    }}
                    placeholder="Chọn hồ"
                  />
                  {pondError ? (
                    <Text className="mb-2 text-sm text-red-500">
                      {pondError}
                    </Text>
                  ) : null}
                </View>
              )}
            </ScrollView>

            <View className="flex-row justify-between border-t border-gray-100 p-4">
              <TouchableOpacity
                className="rounded-lg border border-gray-200 px-4 py-2"
                onPress={() => {
                  resetCountModal();
                  setShowCountModal(false);
                }}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-lg bg-primary px-4 py-2"
                onPress={async () => {
                  // Clear previous errors
                  setTotalWeightError('');
                  setSampleWeightError('');
                  setSampleCountError('');
                  setAvgWeightError('');
                  setPondError('');

                  const total = parseFloat(
                    String(totalWeight).replace(',', '.')
                  );
                  const errors: { [k: string]: string } = {};

                  if (!isFinite(total) || total <= 0) {
                    errors.total = 'Vui lòng nhập tổng trọng lượng hợp lệ';
                  }

                  let quantity = 0;
                  if (countMethod === 'Đếm theo mẫu') {
                    const sampleW = parseFloat(
                      String(sampleWeight).replace(',', '.')
                    );
                    const sampleN = parseFloat(
                      String(sampleCount).replace(',', '.')
                    );
                    if (!isFinite(sampleW) || sampleW <= 0) {
                      errors.sampleWeight =
                        'Vui lòng nhập trọng lượng mẫu hợp lệ';
                    }
                    if (!isFinite(sampleN) || sampleN <= 0) {
                      errors.sampleCount = 'Vui lòng nhập số trứng mẫu hợp lệ';
                    }
                    if (
                      !errors.sampleWeight &&
                      !errors.sampleCount &&
                      !errors.total
                    ) {
                      quantity = Math.round((total / sampleW) * sampleN);
                    }
                  } else {
                    const avg = parseFloat(String(avgWeight).replace(',', '.'));
                    if (!isFinite(avg) || avg <= 0) {
                      errors.avg =
                        'Vui lòng nhập trọng lượng trung bình hợp lệ';
                    }
                    if (!errors.avg && !errors.total) {
                      quantity = Math.round(total / avg);
                    }
                  }

                  if (!currentBreedingId) {
                    Alert.alert('Lỗi', 'Không xác định được quy trình để lưu');
                    return;
                  }
                  if (!currentPondId) {
                    errors.pond = 'Vui lòng chọn hồ';
                  }

                  // Set inline errors for any invalid fields
                  setTotalWeightError(errors.total ?? '');
                  setSampleWeightError(errors.sampleWeight ?? '');
                  setSampleCountError(errors.sampleCount ?? '');
                  setAvgWeightError(errors.avg ?? '');
                  setPondError(errors.pond ?? '');

                  if (Object.keys(errors).length > 0) {
                    return;
                  }

                  try {
                    await createEggBatch.mutateAsync({
                      breedingProcessId: currentBreedingId,
                      pondId: currentPondId!,
                      quantity,
                    });
                    resetCountModal();
                    setShowCountModal(false);
                    refetchBreeding();
                  } catch (err: any) {
                    Alert.alert(
                      'Lỗi',
                      err?.message ?? 'Không thể lưu lô trứng'
                    );
                  }
                }}
              >
                <Text className="text-white">Lưu kết quả</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Update egg batch */}
      <Modal
        visible={showTransferModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          closeTransferModal();
        }}
      >
        <View className="flex-1 items-center justify-center bg-black/40 p-4">
          <View
            className="w-11/12 rounded-2xl bg-white"
            style={{ maxHeight: '70%' }}
          >
            <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
              <Text className="text-lg font-semibold">
                Cập nhật tình trạng trứng
              </Text>
              <TouchableOpacity
                onPress={() => {
                  closeTransferModal();
                }}
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text className="mb-2 text-sm text-gray-600">Lô trứng:</Text>
              {eggBatchQuery.isLoading ? (
                <Text className="text-sm text-gray-500">
                  Đang tải lô trứng...
                </Text>
              ) : eggBatchQuery.error ? (
                <Text className="text-sm text-red-500">
                  Không thể tải lô trứng
                </Text>
              ) : eggBatchQuery.data ? (
                <View className="rounded bg-gray-50 p-3">
                  <Text className="text-sm text-gray-700">{`#${eggBatchQuery.data.id} - Số lượng: ${eggBatchQuery.data.quantity}`}</Text>
                </View>
              ) : (
                <Text className="text-sm text-gray-500">
                  Không tìm thấy lô trứng
                </Text>
              )}

              <Text className="mt-3 text-xs text-gray-500">
                Ngày thứ <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="mb-1 rounded border border-gray-200 p-2"
                value={dailyDayNumber}
                onChangeText={(t) => {
                  setDailyDayNumber(t.replace(/[^0-9]/g, ''));
                  if (dailyErrors.dayNumber)
                    setDailyErrors((prev) => ({
                      ...prev,
                      dayNumber: undefined,
                    }));
                }}
                placeholder="VD: 1"
                keyboardType="numeric"
              />
              {dailyErrors.dayNumber ? (
                <Text className="mb-2 text-sm text-red-500">
                  {dailyErrors.dayNumber}
                </Text>
              ) : null}

              <Text className="text-xs text-gray-500">
                Số trứng khỏe mạnh <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="mb-1 rounded border border-gray-200 p-2"
                value={dailyHealthyEggs}
                onChangeText={(t) => {
                  setDailyHealthyEggs(t.replace(/[^0-9]/g, ''));
                  if (dailyErrors.healthyEggs)
                    setDailyErrors((prev) => ({
                      ...prev,
                      healthyEggs: undefined,
                    }));
                }}
                placeholder="VD: 120"
                keyboardType="numeric"
              />
              {dailyErrors.healthyEggs ? (
                <Text className="mb-2 text-sm text-red-500">
                  {dailyErrors.healthyEggs}
                </Text>
              ) : null}

              <Text className="text-xs text-gray-500">
                Số trứng hỏng <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="mb-1 rounded border border-gray-200 p-2"
                value={dailyRottenEggs}
                onChangeText={(t) => {
                  setDailyRottenEggs(t.replace(/[^0-9]/g, ''));
                  if (dailyErrors.rottenEggs)
                    setDailyErrors((prev) => ({
                      ...prev,
                      rottenEggs: undefined,
                    }));
                }}
                placeholder="VD: 10"
                keyboardType="numeric"
              />
              {dailyErrors.rottenEggs ? (
                <Text className="mb-2 text-sm text-red-500">
                  {dailyErrors.rottenEggs}
                </Text>
              ) : null}

              <Text className="text-xs text-gray-500">
                Số trứng đã nở <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="mb-1 rounded border border-gray-200 p-2"
                value={dailyHatchedEggs}
                onChangeText={(t) => {
                  setDailyHatchedEggs(t.replace(/[^0-9]/g, ''));
                  if (dailyErrors.hatchedEggs)
                    setDailyErrors((prev) => ({
                      ...prev,
                      hatchedEggs: undefined,
                    }));
                }}
                placeholder="VD: 100"
                keyboardType="numeric"
              />
              {dailyErrors.hatchedEggs ? (
                <Text className="text-sm text-red-500">
                  {dailyErrors.hatchedEggs}
                </Text>
              ) : null}

              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-700">
                  Chuyển sang giai đoạn nuôi cá bột
                </Text>
                <Switch
                  value={dailySuccess}
                  onValueChange={(v) => setDailySuccess(v)}
                  trackColor={{ true: '#10b981', false: '#d1d5db' }}
                  thumbColor={dailySuccess ? '#ffffff' : '#ffffff'}
                />
              </View>

              {dailySuccess ? (
                <View>
                  <ContextMenuField
                    label="Hồ nhận cá bột"
                    value={transferPondLabel}
                    options={(emptyPondPage?.data ?? []).map((p) => ({
                      label: `${p.id}: ${p.pondName ?? p.id}`,
                      value: `${p.id}: ${p.pondName ?? p.id}`,
                    }))}
                    onSelect={(v) => {
                      const id = String(v).split(':')[0]?.trim();
                      setTransferPondId(id ? Number(id) : null);
                      setTransferPondLabel(String(v));
                      setDailyErrors((prev) => ({ ...prev, pond: undefined }));
                    }}
                    placeholder="Chọn hồ"
                  />
                  {dailyErrors.pond ? (
                    <Text className="mb-2 text-sm text-red-500">
                      {dailyErrors.pond}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              {dailyErrors.eggBatch ? (
                <Text className="mb-2 text-sm text-red-500">
                  {dailyErrors.eggBatch}
                </Text>
              ) : null}
            </ScrollView>

            <View className="flex-row justify-between border-t border-gray-100 p-4">
              <TouchableOpacity
                className="rounded-lg border border-gray-200 px-4 py-2"
                onPress={() => {
                  closeTransferModal();
                }}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`rounded-lg bg-primary px-4 py-2 ${createIncubationMutation.status === 'pending' ? 'opacity-60' : ''}`}
                disabled={createIncubationMutation.status === 'pending'}
                onPress={async () => {
                  if (createIncubationMutation.status === 'pending') return;

                  setDailyErrors({});

                  if (!currentBreedingId) {
                    Alert.alert(
                      'Lỗi',
                      'Không xác định được quy trình liên quan'
                    );
                    return;
                  }

                  const eggBatch = eggBatchQuery.data;

                  const errors: any = {};
                  const dayNumber =
                    dailyDayNumber.trim() === ''
                      ? NaN
                      : parseInt(dailyDayNumber, 10);
                  const healthy =
                    dailyHealthyEggs.trim() === ''
                      ? NaN
                      : parseInt(dailyHealthyEggs, 10);
                  const rotten =
                    dailyRottenEggs.trim() === ''
                      ? NaN
                      : parseInt(dailyRottenEggs, 10);
                  const hatched =
                    dailyHatchedEggs.trim() === ''
                      ? NaN
                      : parseInt(dailyHatchedEggs, 10);

                  if (!Number.isFinite(dayNumber) || dayNumber <= 0) {
                    errors.dayNumber = 'Vui lòng không để trống';
                  }
                  if (!Number.isFinite(healthy) || healthy < 0) {
                    errors.healthyEggs = 'Vui lòng không để trống';
                  }
                  if (!Number.isFinite(rotten) || rotten < 0) {
                    errors.rottenEggs = 'Vui lòng không để trống';
                  }
                  if (!Number.isFinite(hatched) || hatched < 0) {
                    errors.hatchedEggs = 'Vui lòng không để trống';
                  }

                  if (!eggBatch) {
                    errors.eggBatch = 'Không tìm thấy lô trứng liên quan';
                  }

                  if (dailySuccess && !transferPondId) {
                    errors.pond = 'Vui lòng chọn hồ nhận cá bột';
                  }

                  setDailyErrors(errors);
                  if (Object.keys(errors).length > 0) return;

                  try {
                    const created = await createIncubationMutation.mutateAsync({
                      eggBatchId: eggBatch!.id,
                      dayNumber,
                      healthyEggs: healthy,
                      rottenEggs: rotten,
                      hatchedEggs: hatched,
                      success: dailySuccess,
                    });

                    if (dailySuccess) {
                      if (!transferPondId) {
                        setDailyErrors((prev) => ({
                          ...prev,
                          pond: 'Vui lòng chọn hồ nhận cá bột',
                        }));
                        if (created && (created as IncubationDailyRecord).id) {
                          try {
                            await deleteIncubationMutation.mutateAsync(
                              (created as IncubationDailyRecord).id
                            );
                          } catch {
                            console.error(
                              'Rollback failed but nothing we can do here'
                            );
                          }
                        }
                        return;
                      }

                      try {
                        await createFryFish.mutateAsync({
                          breedingProcessId: currentBreedingId!,
                          pondId: transferPondId!,
                        });
                      } catch (err: any) {
                        if (created && (created as IncubationDailyRecord).id) {
                          try {
                            await deleteIncubationMutation.mutateAsync(
                              (created as IncubationDailyRecord).id
                            );
                          } catch (delErr: any) {
                            Alert.alert(
                              'Lỗi',
                              (err?.message ?? 'Không thể tạo lô cá bột') +
                                '\n' +
                                (delErr?.message ??
                                  'Không thể hoàn nguyên bản ghi ương')
                            );
                            return;
                          }
                        }
                        console.log('err', err);

                        Alert.alert(
                          'Lỗi',
                          err?.message ?? 'Không thể tạo lô cá bột'
                        );
                        return;
                      }
                    }

                    setTransferPondId(null);
                    setTransferPondLabel('Chọn hồ');

                    closeTransferModal();
                  } catch (err: any) {
                    Alert.alert('Lỗi', err?.message ?? 'Không thể lưu bản ghi');
                  }
                }}
              >
                {createIncubationMutation.status === 'pending' ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="#fff" />
                    <Text className="ml-2 font-medium text-white">
                      Đang lưu...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white">Lưu bản ghi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fry Survival Record modal */}
      <Modal
        visible={showFryUpdateModal}
        transparent
        animationType="slide"
        onRequestClose={() => closeFryModal()}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-4">
          <View
            className="w-11/12 rounded-2xl bg-white"
            style={{ maxHeight: '75%' }}
          >
            <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
              <Text className="text-lg font-semibold">Ghi nhận cá bột</Text>
              <TouchableOpacity onPress={() => closeFryModal()}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{
                paddingTop: 8,
                paddingHorizontal: 16,
              }}
            >
              {fryErrors.fryFish ? (
                <Text className="mb-2 text-sm text-red-500">
                  {fryErrors.fryFish}
                </Text>
              ) : null}

              {fryFishQuery.isLoading ? (
                <Text className="text-sm text-gray-500">
                  Đang tìm lô cá bột liên quan...
                </Text>
              ) : fryFishQuery.error ? (
                <Text className="text-sm text-red-500">
                  Không thể tải thông tin cá bột
                </Text>
              ) : null}
              <Text className="mt-2 text-xs text-gray-500">
                Ngày thứ <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="mb-1 rounded border border-gray-200 p-2"
                value={fryDayNumber}
                onChangeText={(t) => {
                  const v = t.replace(/[^0-9]/g, '');
                  setFryDayNumber(v);
                  if (fryErrors.dayNumber)
                    setFryErrors((p) => ({ ...p, dayNumber: undefined }));
                }}
                placeholder="VD: 1"
                keyboardType="numeric"
              />
              {fryErrors.dayNumber ? (
                <Text className="mb-2 text-sm text-red-500">
                  {fryErrors.dayNumber}
                </Text>
              ) : null}

              <Text className="text-xs text-gray-500">
                Số cá sống <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="mb-1 rounded border border-gray-200 p-2"
                value={fryCountAlive}
                onChangeText={(t) => {
                  const v = t.replace(/[^0-9]/g, '');
                  setFryCountAlive(v);
                  if (fryErrors.countAlive)
                    setFryErrors((p) => ({ ...p, countAlive: undefined }));
                }}
                placeholder="VD: 4400"
                keyboardType="numeric"
              />
              {fryErrors.countAlive ? (
                <Text className="mb-2 text-sm text-red-500">
                  {fryErrors.countAlive}
                </Text>
              ) : null}

              <Text className="text-xs text-gray-500">Ghi chú</Text>
              <TextInput
                className="rounded border border-gray-200 p-2"
                value={fryNote}
                onChangeText={(t) => {
                  setFryNote(t);
                }}
                placeholder="Ghi chú (tuỳ chọn)"
                multiline
                numberOfLines={3}
              />

              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-700">
                  Ghi nhận là thành công
                </Text>
                <Switch
                  value={frySuccess}
                  onValueChange={(v) => setFrySuccess(v)}
                  trackColor={{ true: '#10b981', false: '#d1d5db' }}
                  thumbColor={frySuccess ? '#ffffff' : '#ffffff'}
                />
              </View>
            </ScrollView>

            <View className="flex-row justify-between border-t border-gray-100 p-4">
              <TouchableOpacity
                className="rounded-lg border border-gray-200 px-4 py-2"
                onPress={() => closeFryModal()}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`rounded-lg bg-primary px-4 py-2 ${createFrySurvival.status === 'pending' ? 'opacity-60' : ''}`}
                disabled={createFrySurvival.status === 'pending'}
                onPress={async () => {
                  if (createFrySurvival.status === 'pending') return;

                  // clear previous errors
                  setFryErrors({});

                  const errors: any = {};
                  const day =
                    fryDayNumber.trim() === ''
                      ? NaN
                      : parseInt(fryDayNumber, 10);
                  const alive =
                    fryCountAlive.trim() === ''
                      ? NaN
                      : parseInt(fryCountAlive, 10);

                  if (!Number.isFinite(day) || day <= 0)
                    errors.dayNumber = 'Vui lòng nhập ngày hợp lệ';
                  if (!Number.isFinite(alive) || alive < 0)
                    errors.countAlive = 'Vui lòng nhập số lượng hợp lệ';

                  const fryFish = fryFishQuery.data;
                  if (!fryFish || !fryFish.id)
                    errors.fryFish = 'Không tìm thấy lô cá bột liên quan';

                  setFryErrors(errors);
                  if (Object.keys(errors).length > 0) return;

                  try {
                    await createFrySurvival.mutateAsync({
                      fryFishId: fryFish!.id,
                      dayNumber: day,
                      countAlive: alive,
                      note: fryNote,
                      success: frySuccess,
                    });
                    // reset and close
                    closeFryModal();
                    // optional: refetch breeding list to reflect changes
                    refetchBreeding();
                  } catch (err: any) {
                    Alert.alert(
                      'Lỗi',
                      err?.message ?? 'Không thể lưu bản ghi cá bột'
                    );
                  }
                }}
              >
                {createFrySurvival.status === 'pending' ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="#fff" />
                    <Text className="ml-2 font-medium text-white">
                      Đang lưu...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white">Lưu bản ghi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Selection modal (Tuyển chọn) */}
      <Modal
        visible={showSelectionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSelectionModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-4">
          <View
            className="w-11/12 rounded-2xl bg-white"
            style={{ maxHeight: '55%' }}
          >
            <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
              <Text className="text-lg font-semibold">Tuyển chọn cá</Text>
              <TouchableOpacity onPress={() => setShowSelectionModal(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <View className="mb-3 rounded bg-blue-50 p-3">
                <Text className="text-sm font-semibold text-blue-700">
                  Thông tin hiện tại
                </Text>
                <Text className="mt-2 text-sm text-gray-700">
                  Số cá có sẵn: <Text className="font-semibold">2200 con</Text>
                </Text>
                <Text className="text-sm text-gray-700">
                  Tuổi cá: <Text className="font-semibold">75 ngày</Text>
                </Text>
              </View>

              <View className="rounded bg-green-50 p-3">
                <Text className="mb-2 text-sm text-gray-700">
                  Số lượng tuyển chọn
                </Text>
                <TextInput
                  className="rounded border border-green-200 p-2"
                  value={selectionCount}
                  onChangeText={setSelectionCount}
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <View className="flex-row justify-between border-t border-gray-100 p-4">
              <TouchableOpacity
                className="rounded-lg border border-gray-200 px-4 py-2"
                onPress={() => setShowSelectionModal(false)}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-lg bg-primary px-4 py-2"
                onPress={() => {
                  // TODO: save selection results
                  setShowSelectionModal(false);
                }}
              >
                <Text className="text-white">Lưu kết quả tuyển chọn</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
