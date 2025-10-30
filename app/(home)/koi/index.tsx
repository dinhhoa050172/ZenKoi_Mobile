import ContextMenuField from '@/components/ContextMenuField';
import PondSvg from '@/components/icons/PondSvg';
import Loading from '@/components/Loading';
import { useGetKoiFish } from '@/hooks/useKoiFish';
import { useGetPonds } from '@/hooks/usePond';
import { useGetVarieties } from '@/hooks/useVariety';
import type {
  KoiFish,
  KoiFishSearchParams,
} from '@/lib/api/services/fetchKoiFish';
import {
  FishSize,
  Gender,
  HealthStatus,
  SaleStatus,
} from '@/lib/api/services/fetchKoiFish';
import { formatKoiAge } from '@/lib/utils/formatKoiAge';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useRouter } from 'expo-router';
import {
  Calendar,
  Edit,
  Eye,
  Filter,
  Plus,
  Ruler,
  Search,
  X,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
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

export default function KoiManagementScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchRFID, setSearchRFID] = useState('');
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState<KoiFishSearchParams>({});

  const [modalSearch, setModalSearch] = useState<string>('');
  const [modalGender, setModalGender] = useState<Gender | undefined>(undefined);
  const [modalHealth, setModalHealth] = useState<HealthStatus | undefined>(
    undefined
  );
  const [modalVarietyId, setModalVarietyId] = useState<number | undefined>(
    undefined
  );
  const [modalFishSize, setModalFishSize] = useState<FishSize | undefined>(
    undefined
  );
  const [modalSaleStatus, setModalSaleStatus] = useState<
    SaleStatus | undefined
  >(undefined);
  const [modalPondId, setModalPondId] = useState<number | undefined>(undefined);
  const [modalOrigin, setModalOrigin] = useState<string>('');
  const PRICE_MIN = 0;
  const PRICE_MAX = 100000000;
  const PRICE_STEP = 1000;
  const [modalMinPrice, setModalMinPrice] = useState<number>(PRICE_MIN);
  const [modalMaxPrice, setModalMaxPrice] = useState<number>(PRICE_MAX);

  const resetModalFilters = () => {
    setModalSearch('');
    setModalGender(undefined);
    setModalHealth(undefined);
    setModalVarietyId(undefined);
    setModalFishSize(undefined);
    setModalSaleStatus(undefined);
    setModalPondId(undefined);
    setModalOrigin('');
    setModalMinPrice(PRICE_MIN);
    setModalMaxPrice(PRICE_MAX);
  };

  const formatCurrency = (n: number) => {
    try {
      return n.toLocaleString('vi-VN');
    } catch {
      return String(n);
    }
  };

  const {
    data: koiPagination,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useGetKoiFish(appliedFilters);
  const koiList: KoiFish[] = koiPagination?.data ?? [];

  const getSizeLabel = (size?: KoiFish['size']) => {
    switch (size) {
      case 'Under10cm':
        return '< 10 cm';
      case 'From10To20cm':
        return '10 - 20 cm';
      case 'From21To25cm':
        return '21 - 25 cm';
      case 'From26To30cm':
        return '26 - 30 cm';
      case 'From31To40cm':
        return '31 - 40 cm';
      case 'From41To45cm':
        return '41 - 45 cm';
      case 'From46To50cm':
        return '46 - 50 cm';
      case 'Over50cm':
        return '> 50 cm';
      default:
        return String(size ?? '—');
    }
  };

  const genderToLabel = (g: Gender) => {
    switch (g) {
      case Gender.MALE:
        return 'Đực';
      case Gender.FEMALE:
        return 'Cái';
      case Gender.OTHER:
        return 'Chưa xác định';
      default:
        return g;
    }
  };

  const healthToLabel = (h: HealthStatus) => {
    switch (h) {
      case HealthStatus.HEALTHY:
        return 'Khỏe mạnh';
      case HealthStatus.WARNING:
        return 'Cảnh báo';
      case HealthStatus.WEAK:
        return 'Yếu';
      case HealthStatus.SICK:
        return 'Bệnh';
      case HealthStatus.DEAD:
        return 'Chết';
      default:
        return h;
    }
  };

  const saleStatusToLabel = (s: SaleStatus) => {
    switch (s) {
      case SaleStatus.NOT_FOR_SALE:
        return 'Không bán';
      case SaleStatus.AVAILABLE:
        return 'Có sẵn';
      case SaleStatus.RESERVED:
        return 'Đã đặt trước';
      case SaleStatus.SOLD:
        return 'Đã bán';
      default:
        return s;
    }
  };

  const { data: pondsPage, isLoading: pondsLoading } = useGetPonds(
    {
      pageIndex: 1,
      pageSize: 100,
    },
    true
  );

  const { data: varietiesPage, isLoading: varietiesLoading } = useGetVarieties(
    { pageIndex: 1, pageSize: 100 },
    true
  );

  const pondOptions = pondsPage?.data ?? [];
  const varietyOptions = varietiesPage?.data ?? [];

  // Derived lists for enum options
  const genderOptions = useMemo(() => Object.values(Gender), []);
  const healthOptions = useMemo(() => Object.values(HealthStatus), []);
  const sizeOptions = useMemo(() => Object.values(FishSize), []);
  const saleStatusOptions = useMemo(() => Object.values(SaleStatus), []);

  return (
    <>
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="p-4">
          {/* Search */}
          <View className="mb-4">
            <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4">
              <TextInput
                className="flex-1 text-gray-900"
                placeholder="Tìm kiếm ..."
                value={searchRFID}
                onChangeText={(t) => setSearchRFID(t)}
                onSubmitEditing={() => {
                  setAppliedFilters((prev: any) => ({
                    ...(prev || {}),
                    search: searchRFID,
                  }));
                  refetch();
                }}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                className="left-4 rounded-r-2xl bg-primary p-3"
                onPress={() => {
                  setAppliedFilters((prev: any) => ({
                    ...(prev || {}),
                    search: searchRFID,
                  }));
                  refetch();
                }}
              >
                <Search size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">
              Hồ sơ cá Koi
            </Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                className="mr-2 p-2"
                onPress={() => setShowFilterSheet(true)}
              >
                <Filter size={20} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-lg px-3 py-2"
                style={{ backgroundColor: '#0A3D62' }}
                onPress={() =>
                  router.push(`/koi/add?redirect=${encodeURIComponent('/koi')}`)
                }
              >
                <Plus size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <FlatList
          data={koiList}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 30,
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={() => {
            const hasActiveFilters =
              Object.keys(appliedFilters || {}).length > 0;
            return (
              <>
                {isLoading ? (
                  <View className="h-[50vh] w-full items-center justify-center">
                    <Loading />
                  </View>
                ) : isError ? (
                  <View className="items-center py-8">
                    <Text>
                      Lỗi khi tải dữ liệu:{' '}
                      {(error as any)?.message ?? 'Không xác định'}
                    </Text>
                  </View>
                ) : (
                  <View className="items-center py-8">
                    {hasActiveFilters ? (
                      <>
                        <Text className="mb-4 text-gray-600">
                          Không có cá Koi nào phù hợp.
                        </Text>
                        <View className="flex-row">
                          <TouchableOpacity
                            className="mr-2 rounded-lg bg-gray-100 px-4 py-2"
                            onPress={() => {
                              setAppliedFilters({});
                              refetch();
                            }}
                          >
                            <Text className="text-gray-900">Xóa bộ lọc</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="rounded-lg px-4 py-2"
                            style={{ backgroundColor: '#0A3D62' }}
                            onPress={() => setShowFilterSheet(true)}
                          >
                            <Text className="text-white">Chỉnh bộ lọc</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <>
                        <Text className="mb-4 text-gray-600">
                          Chưa có cá Koi nào trong hệ thống.
                        </Text>
                        <TouchableOpacity
                          className="rounded-lg px-4 py-2"
                          style={{ backgroundColor: '#0A3D62' }}
                          onPress={() =>
                            router.push(
                              `/koi/add?redirect=${encodeURIComponent('/koi')}`
                            )
                          }
                        >
                          <Text className="text-white">Thêm cá mới</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}
              </>
            );
          }}
          renderItem={({ item: koi }) => (
            <View className="mb-4 rounded-2xl bg-white p-2 shadow-sm">
              <View className="flex-row">
                {koi.images && koi.images.length > 0 ? (
                  <Image
                    source={{ uri: koi.images[0] }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 12,
                      marginRight: 14,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View className="mr-4 h-20 w-20 rounded-lg bg-gray-200" />
                )}

                {/* Fish Info */}
                <View className="flex-1">
                  <Text className="mb-1 text-lg font-bold text-gray-900">
                    {koi.rfid}
                  </Text>
                  <Text className="mb-2 text-sm text-gray-600">
                    {koi.variety?.varietyName} • {genderToLabel(koi.gender)}
                  </Text>

                  <View className="mb-2 flex-row items-center">
                    <PondSvg />
                    <Text className="ml-1 text-sm text-gray-600">
                      {koi.pond?.pondName ?? '—'}
                    </Text>
                  </View>

                  <View className="flex-row">
                    <View className="mr-4 flex-row items-center">
                      <Ruler size={14} color="#6b7280" />
                      <Text className="text-sm text-gray-600">
                        {' '}
                        {getSizeLabel(koi.size)}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Calendar size={14} color="#6b7280" />
                      <Text className="text-sm text-gray-600">
                        {' '}
                        {formatKoiAge(koi.birthDate)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="mt-4 flex-row border-t border-gray-100 pt-1">
                <TouchableOpacity
                  className="mr-2 flex-1 flex-row items-center justify-center py-2"
                  onPress={() => router.push(`/koi/${koi.id}`)}
                >
                  <Eye size={16} color="#6b7280" />
                  <Text className="ml-2 text-sm text-gray-600">Xem</Text>
                </TouchableOpacity>
                <Text className="self-stretch border-l border-gray-200" />
                <TouchableOpacity
                  className="ml-2 flex-1 flex-row items-center justify-center py-2"
                  onPress={() =>
                    router.push(
                      `/koi/edit?id=${koi.id}&redirect=${encodeURIComponent('/koi')}`
                    )
                  }
                >
                  <Edit size={16} color="#6b7280" />
                  <Text className="ml-2 text-sm text-gray-600">Sửa</Text>
                </TouchableOpacity>
              </View>
            </View>
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
                <ActivityIndicator />
              </View>
            ) : null
          }
        />
      </SafeAreaView>

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
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <View>
              {/* Bể cá */}
              <ContextMenuField
                label="Bể cá"
                value={modalPondId ? String(modalPondId) : undefined}
                options={
                  pondsLoading
                    ? [{ label: 'Đang tải...', value: '' }]
                    : pondOptions.map((p) => ({
                        label: p.pondName ?? String(p.id),
                        value: String(p.id),
                      }))
                }
                onSelect={(v) => setModalPondId(v ? Number(v) : undefined)}
                placeholder="Chọn bể cá"
              />

              {/* Giống */}
              <ContextMenuField
                label="Giống"
                value={modalVarietyId ? String(modalVarietyId) : undefined}
                options={
                  varietiesLoading
                    ? [{ label: 'Đang tải...', value: '' }]
                    : varietyOptions.map((v) => ({
                        label: v.varietyName ?? String(v.id),
                        value: String(v.id),
                      }))
                }
                onSelect={(v) => setModalVarietyId(v ? Number(v) : undefined)}
                placeholder="Chọn giống"
              />

              {/* Gender */}
              <View className="mb-2">
                <Text className="mb-1 text-base font-medium text-gray-900">
                  Giới tính
                </Text>
                <View className="flex-row flex-wrap">
                  {genderOptions.map((g) => {
                    const isSelected = modalGender === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        className={`mb-2 mr-2 rounded-lg border border-gray-200 px-3 py-2 ${isSelected ? 'border-blue-500' : ''}`}
                        style={{
                          backgroundColor: isSelected ? '#0A3D62' : '#f3f4f6',
                        }}
                        onPress={() =>
                          setModalGender(isSelected ? undefined : (g as Gender))
                        }
                      >
                        <Text
                          className={
                            isSelected ? 'text-white' : 'text-gray-700'
                          }
                        >
                          {genderToLabel(g)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Fish Size */}
              <View className="mb-2">
                <Text className="mb-1 text-base font-medium text-gray-900">
                  Kích thước
                </Text>
                <View className="flex-row flex-wrap">
                  {sizeOptions.map((s) => {
                    const isSelected = modalFishSize === s;
                    return (
                      <TouchableOpacity
                        key={s}
                        className={`mb-2 mr-2 rounded-lg border border-gray-200 px-3 py-2 ${isSelected ? 'border-blue-500' : ''}`}
                        style={{
                          backgroundColor: isSelected ? '#0A3D62' : '#f3f4f6',
                        }}
                        onPress={() =>
                          setModalFishSize(
                            isSelected ? undefined : (s as FishSize)
                          )
                        }
                      >
                        <Text
                          className={
                            isSelected ? 'text-white' : 'text-gray-700'
                          }
                        >
                          {getSizeLabel(s)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Health */}
              <View className="mb-2">
                <Text className="mb-1 text-base font-medium text-gray-900">
                  Tình trạng sức khỏe
                </Text>
                <View className="flex-row flex-wrap">
                  {healthOptions.map((h) => {
                    const isSelected = modalHealth === h;
                    return (
                      <TouchableOpacity
                        key={h}
                        className={`mb-2 mr-2 rounded-lg border border-gray-200 px-3 py-2 ${isSelected ? 'border-blue-500' : ''}`}
                        style={{
                          backgroundColor: isSelected ? '#0A3D62' : '#f3f4f6',
                        }}
                        onPress={() =>
                          setModalHealth(
                            isSelected ? undefined : (h as HealthStatus)
                          )
                        }
                      >
                        <Text
                          className={
                            isSelected ? 'text-white' : 'text-gray-700'
                          }
                        >
                          {healthToLabel(h)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Sale Status */}
              <View className="mb-2">
                <Text className="mb-1 text-base font-medium text-gray-900">
                  Trạng thái bán
                </Text>
                <View className="flex-row flex-wrap">
                  {saleStatusOptions.map((s) => {
                    const isSelected = modalSaleStatus === s;
                    return (
                      <TouchableOpacity
                        key={s}
                        className={`mb-2 mr-2 rounded-lg border border-gray-200 px-3 py-2 ${isSelected ? 'border-blue-500' : ''}`}
                        style={{
                          backgroundColor: isSelected ? '#0A3D62' : '#f3f4f6',
                        }}
                        onPress={() =>
                          setModalSaleStatus(
                            isSelected ? undefined : (s as SaleStatus)
                          )
                        }
                      >
                        <Text
                          className={
                            isSelected ? 'text-white' : 'text-gray-700'
                          }
                        >
                          {saleStatusToLabel(s)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Origin */}
              <View className="mb-2">
                <Text className="mb-1 text-base font-medium text-gray-900">
                  Nguồn gốc
                </Text>
                <TextInput
                  className="rounded-lg border border-gray-200 px-3 py-2"
                  placeholder="Xuất xứ"
                  value={modalOrigin}
                  onChangeText={setModalOrigin}
                />
              </View>

              {/* Price range */}
              <View className="mb-4">
                <Text className="mb-2 text-base font-medium text-gray-900">
                  Giá bán (VNĐ)
                </Text>
                <View>
                  <Text className="text-sm text-gray-600">{`Khoảng: ${formatCurrency(modalMinPrice)} — ${formatCurrency(modalMaxPrice)}`}</Text>
                </View>
                <View style={{ paddingHorizontal: 12 }}>
                  <MultiSlider
                    values={[modalMinPrice, modalMaxPrice]}
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={PRICE_STEP}
                    onValuesChange={(values: number[]) => {
                      const [minV, maxV] = values;
                      setModalMinPrice(minV);
                      setModalMaxPrice(maxV);
                    }}
                    selectedStyle={{ backgroundColor: '#0A3D62' }}
                    unselectedStyle={{ backgroundColor: '#e5e7eb' }}
                    trackStyle={{ height: 6 }}
                    markerStyle={{
                      backgroundColor: '#0A3D62',
                      height: 15,
                      width: 15,
                      top: 2,
                    }}
                  />
                </View>
              </View>

              {/* Filter Actions */}
              <View className="flex-row border-t border-gray-200 pb-6">
                <TouchableOpacity
                  className="mr-2 mt-2 flex-1 rounded-lg bg-gray-100 py-3"
                  onPress={() => {
                    resetModalFilters();
                    setAppliedFilters({});
                    refetch();
                  }}
                >
                  <Text className="text-center font-medium text-gray-900">
                    Đặt lại
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="ml-2 mt-2 flex-1 rounded-lg py-3"
                  style={{ backgroundColor: '#0A3D62' }}
                  onPress={() => {
                    const filters: any = {};
                    if (modalSearch) filters.search = modalSearch;
                    if (modalGender) filters.gender = modalGender;
                    if (modalHealth) filters.health = modalHealth;
                    if (modalVarietyId) filters.varietyId = modalVarietyId;
                    if (modalFishSize) filters.fishSize = modalFishSize;
                    if (modalSaleStatus) filters.saleStatus = modalSaleStatus;
                    if (modalPondId) filters.pondId = modalPondId;
                    if (modalOrigin) filters.origin = modalOrigin;
                    if (modalMinPrice) filters.minPrice = Number(modalMinPrice);
                    if (modalMaxPrice) filters.maxPrice = Number(modalMaxPrice);
                    setAppliedFilters(filters);
                    setShowFilterSheet(false);
                    refetch();
                  }}
                >
                  <Text className="text-center font-medium text-white">
                    Áp dụng
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}
