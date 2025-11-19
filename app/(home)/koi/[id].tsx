import FishSvg from '@/components/icons/FishSvg';
import PondSvg from '@/components/icons/PondSvg';
import {
  useGetKoiFishById,
  useGetKoiFishHealthByKoiId,
} from '@/hooks/useKoiFish';
import {
  Gender,
  HealthStatus,
  SaleStatus
} from '@/lib/api/services/fetchKoiFish';
import { formatDate } from '@/lib/utils/formatDate';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertCircle,
  ArrowLeft,
  Biohazard,
  Blend,
  Calendar,
  Coins,
  Dna,
  DollarSign,
  Edit,
  FileText,
  Fish,
  HeartPulse,
  Layers,
  MapPin,
  Percent,
  Ruler,
  VenusAndMars,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export default function KoiDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, redirect } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'info' | 'health'>('info');

  useFocusEffect(
    useCallback(() => {
      setActiveTab('info');
    }, [])
  );

  const koiId = Number(id);
  const { data: koi, isLoading } = useGetKoiFishById(koiId, !!koiId);
  const healthQuery = useGetKoiFishHealthByKoiId(
    koiId,
    activeTab === 'health' && !!koiId
  );
  const healthItems = healthQuery.data ?? [];

  const getHealthColor = (health?: HealthStatus | string) => {
    switch (health) {
      case HealthStatus.HEALTHY:
        return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
      case HealthStatus.WARNING:
        return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
      case HealthStatus.WEAK:
        return { bg: '#fed7aa', text: '#9a3412', border: '#fdba74' };
      case HealthStatus.SICK:
        return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      case HealthStatus.DEAD:
        return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
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

  const typeToLabel = (type?: string) => {
    switch (type) {
      case 'High':
        return 'High';
      case 'Show':
        return 'Show';
      default:
        return type ?? '-';
    }
  };

  const patternToLabel = (p?: string | null) => {
    return String(p ?? '-');
  };

  const saleStatusToLabel = (s?: SaleStatus | string) => {
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
        return String(s ?? '-');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const healthColors = getHealthColor(koi?.healthStatus);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="mb-2 rounded-t-2xl bg-primary pb-4">
        <View className="flex-row items-center justify-between px-4 pt-4">
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
            onPress={() => {
              if (redirect) {
                router.push(redirect as any);
              } else {
                router.push('/koi');
              }
            }}
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-sm font-medium uppercase tracking-wide text-white/80">
              Chi tiết
            </Text>
            <Text className="text-2xl font-bold text-white">Cá Koi</Text>
          </View>
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
            onPress={() => {
              if (koiId)
                router.push(
                  `/koi/edit?id=${koiId}&redirect=${encodeURIComponent((redirect as string) ?? `/koi/${koiId}`)}`
                );
            }}
          >
            <Edit size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Card */}
        <View className="mx-4 mt-4 overflow-hidden rounded-3xl bg-white shadow-lg">
          <View className="items-center p-4">
            {/* Main Image */}
            <View className="mb-4 h-80 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-gray-100 to-gray-200">
              {isLoading ? (
                <View className="h-full w-full items-center justify-center">
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text className="mt-2 text-sm text-gray-500">
                    Đang tải...
                  </Text>
                </View>
              ) : koi?.images && koi.images.length > 0 ? (
                <Image
                  source={{ uri: koi.images[0] }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center">
                  <Fish size={64} color="#9ca3af" />
                  <Text className="mt-2 text-sm text-gray-500">
                    Chưa có ảnh
                  </Text>
                </View>
              )}
            </View>

            {/* Basic Info */}
            <View className="w-full items-center">
              <Text className="mb-2 text-3xl font-bold text-gray-900">
                {koi?.rfid ?? 'N/A'}
              </Text>
              <View className="flex-row items-center">
                {koi?.variety?.varietyName && (
                  <View className="rounded-full bg-purple-100 px-3 py-1.5">
                    <Text className="text-base font-semibold text-purple-700">
                      {koi.variety.varietyName}
                    </Text>
                  </View>
                )}

                <View
                  className="ml-2 rounded-full border-2 px-3 py-1.5"
                  style={{
                    backgroundColor: healthColors.bg,
                    borderColor: healthColors.border,
                  }}
                >
                  <Text
                    className="text-base font-semibold"
                    style={{ color: healthColors.text }}
                  >
                    {healthToLabel(koi?.healthStatus as HealthStatus) ??
                      'Không rõ'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="mx-4 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="flex-row border-b border-gray-100">
            <TouchableOpacity
              className={`flex-1 py-4 ${activeTab === 'info' ? 'border-b-2 border-blue-500' : ''}`}
              onPress={() => setActiveTab('info')}
            >
              <Text
                className={`text-center text-base font-semibold ${
                  activeTab === 'info' ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
                Thông tin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-4 ${activeTab === 'health' ? 'border-b-2 border-blue-500' : ''}`}
              onPress={() => setActiveTab('health')}
            >
              <Text
                className={`text-center text-base font-semibold ${
                  activeTab === 'health' ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
                Sức khỏe
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View className="p-5">
            {activeTab === 'info' && (
              <View>
                <Text className="mb-4 text-lg font-bold text-gray-900">
                  Thông tin chi tiết
                </Text>

                <View className="space-y-1">
                  <InfoRow
                    icon={<FishSvg size={20} color="#a855f7" />}
                    iconBg="bg-purple-100"
                    label="Giống cá"
                    value={koi?.variety?.varietyName ?? '-'}
                  />
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<Layers size={18} color="#3b82f6" />}
                    iconBg="bg-blue-100"
                    label="Loại"
                    value={typeToLabel(koi?.type)}
                  />
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<VenusAndMars size={18} color="#ec4899" />}
                    iconBg="bg-pink-100"
                    label="Giới tính"
                    value={genderToLabel(koi?.gender as Gender) ?? '-'}
                  />
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<Calendar size={18} color="#10b981" />}
                    iconBg="bg-emerald-100"
                    label="Ngày sinh"
                    value={formatDate(koi?.birthDate, 'dd/MM/yyyy') ?? '-'}
                  />
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<Ruler size={18} color="#06b6d4" />}
                    iconBg="bg-cyan-100"
                    label="Kích cỡ"
                    value={koi?.size ?? '-'}
                  />
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<Blend size={18} color="#6b7280" />}
                    iconBg="bg-gray-100"
                    label="Kiểu hoa văn"
                    value={patternToLabel(koi?.pattern)}
                  />
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<Coins size={18} color="#16a34a" />}
                    iconBg="bg-green-100"
                    label="Trạng thái bán"
                    value={saleStatusToLabel(koi?.saleStatus)}
                  />
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<Biohazard size={18} color="#475569" />}
                    iconBg="bg-gray-100"
                    label="Đột biến"
                    value={koi?.isMutated ? 'Có' : 'Không'}
                  />
                  {koi?.isMutated && (
                    <>
                      <View style={{ height: 12 }} />
                      <InfoRow
                        icon={<Dna size={18} color="#64748b" />}
                        iconBg="bg-gray-100"
                        label="Loại đột biến"
                        value={koi?.mutationDescription ?? '-'}
                      />
                      <View style={{ height: 12 }} />
                      <InfoRow
                        icon={<Percent size={18} color="#94a3b8" />}
                        iconBg="bg-gray-100"
                        label="Tỷ lệ đột biến"
                        value={
                          koi?.mutationRate != null
                            ? `${koi.mutationRate}%`
                            : '-'
                        }
                      />
                    </>
                  )}
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<PondSvg size={18} color="#3b82f6" />}
                    iconBg="bg-blue-100"
                    label="Bể nuôi"
                    value={koi?.pond?.pondName ?? '-'}
                  />
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<MapPin size={18} color="#f59e0b" />}
                    iconBg="bg-amber-100"
                    label="Xuất xứ"
                    value={koi?.origin ?? '-'}
                  />
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<DollarSign size={18} color="#22c55e" />}
                    iconBg="bg-green-100"
                    label="Giá tiền"
                    value={
                      koi?.sellingPrice ? formatCurrency(koi.sellingPrice) : '-'
                    }
                  />

                  {koi?.description && (
                    <>
                      <View style={{ height: 16 }} />
                      <View className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <Text className="mb-2 text-lg font-semibold">
                          Giới thiệu
                        </Text>
                        <Text className="text-base leading-6">
                          {koi.description}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            )}

            {activeTab === 'health' && (
              <View>
                <View className="mb-4 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="mr-2 rounded-2xl bg-red-100 p-2">
                      <HeartPulse size={20} color="#ef4444" strokeWidth={2} />
                    </View>
                    <Text className="text-lg font-bold text-gray-900">
                      Lịch sử sức khỏe
                    </Text>
                  </View>
                  {healthItems.length > 0 && (
                    <View className="rounded-full bg-blue-100 px-3 py-1">
                      <Text className="text-sm font-bold text-blue-700">
                        {healthItems.length} bản ghi
                      </Text>
                    </View>
                  )}
                </View>

                {healthQuery.isLoading ? (
                  <View className="items-center rounded-2xl border border-gray-200 bg-white py-12">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text className="mt-3 text-base font-medium text-gray-600">
                      Đang tải lịch sử sức khỏe...
                    </Text>
                  </View>
                ) : healthItems.length === 0 ? (
                  <View className="items-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 py-8">
                    <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-gray-200">
                      <FishSvg size={36} color="#9ca3af" />
                    </View>
                    <Text className="mb-1 text-lg font-bold text-gray-700">
                      Chưa có lịch sử sức khỏe
                    </Text>
                    <Text className="text-base text-gray-500">
                      Cá Koi chưa có ghi nhận về sức khỏe
                    </Text>
                  </View>
                ) : (
                  <View className="space-y-3">
                    {healthItems.map((h, index) => {
                      const statusColors = getHealthColor(h.affectedStatus);
                      const isRecovered = !!h.recoveredAt;

                      return (
                        <View
                          key={h.id}
                          className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                        >
                          {/* Header with Status */}
                          <View
                            className="flex-row items-center justify-between border-b px-4 py-3"
                            style={{
                              backgroundColor: statusColors.bg,
                              borderBottomColor: statusColors.border,
                            }}
                          >
                            <View className="flex-1 flex-row items-center">
                              <View
                                className="mr-2 h-2 w-2 rounded-full"
                                style={{ backgroundColor: statusColors.text }}
                              />
                              <Text
                                className="text-base font-bold"
                                style={{ color: statusColors.text }}
                              >
                                {healthToLabel(
                                  h.affectedStatus as HealthStatus
                                )}
                              </Text>
                            </View>

                            <View
                              className={`rounded-full px-3 py-1 ${
                                isRecovered ? 'bg-green-100' : 'bg-orange-100'
                              }`}
                            >
                              <Text
                                className={`text-sm font-bold ${
                                  isRecovered
                                    ? 'text-green-700'
                                    : 'text-orange-700'
                                }`}
                              >
                                {isRecovered ? 'Đã hồi phục' : 'Đang theo dõi'}
                              </Text>
                            </View>
                          </View>

                          {/* Content */}
                          <View className="p-4">
                            {/* Timeline */}
                            <View className="mb-4">
                              <View className="flex-row items-center">
                                <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-red-100">
                                  <Calendar
                                    size={18}
                                    color="#ef4444"
                                    strokeWidth={2}
                                  />
                                </View>
                                <View className="flex-1">
                                  <Text className="text-sm font-medium text-gray-500">
                                    Thời gian phát hiện
                                  </Text>
                                  <Text className="text-base font-bold text-gray-900">
                                    {formatDate(
                                      h.affectedFrom,
                                      'dd/MM/yyyy HH:mm'
                                    )}
                                  </Text>
                                </View>
                              </View>

                              {isRecovered && (
                                <View className="flex-row items-center">
                                  <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-green-100">
                                    <Calendar
                                      size={18}
                                      color="#22c55e"
                                      strokeWidth={2}
                                    />
                                  </View>
                                  <View className="flex-1">
                                    <Text className="text-sm font-medium text-gray-500">
                                      Thời gian hồi phục
                                    </Text>
                                    <Text className="text-base font-bold text-gray-900">
                                      {formatDate(
                                        h.recoveredAt ?? undefined,
                                        'dd/MM/yyyy HH:mm'
                                      )}
                                    </Text>
                                  </View>
                                </View>
                              )}
                            </View>

                            {/* Symptoms */}
                            {h.specificSymptoms && (
                              <View className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                                <View className="mb-2 flex-row items-center">
                                  <AlertCircle
                                    size={16}
                                    color="#f59e0b"
                                    strokeWidth={2}
                                  />
                                  <Text className="ml-2 text-sm font-bold text-amber-900">
                                    Triệu chứng cụ thể
                                  </Text>
                                </View>
                                <Text className="text-base leading-6 text-amber-800">
                                  {h.specificSymptoms}
                                </Text>
                              </View>
                            )}

                            {/* Treatment Notes */}
                            {h.treatmentNotes && (
                              <View className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-3">
                                <View className="mb-2 flex-row items-center">
                                  <FileText
                                    size={16}
                                    color="#3b82f6"
                                    strokeWidth={2}
                                  />
                                  <Text className="ml-2 text-sm font-bold text-blue-900">
                                    Ghi chú điều trị
                                  </Text>
                                </View>
                                <Text className="text-base leading-6 text-blue-800">
                                  {h.treatmentNotes}
                                </Text>
                              </View>
                            )}

                            {/* Status Badges */}
                            <View className="flex-row flex-wrap gap-2">
                              <View
                                className={`flex-row items-center rounded-2xl border px-3 py-2 ${
                                  h.requiresTreatment
                                    ? 'border-red-200 bg-red-100'
                                    : 'border-green-200 bg-green-100'
                                }`}
                              >
                                <View
                                  className={`mr-2 h-2 w-2 rounded-full ${
                                    h.requiresTreatment
                                      ? 'bg-red-500'
                                      : 'bg-green-500'
                                  }`}
                                />
                                <Text
                                  className={`text-sm font-bold ${
                                    h.requiresTreatment
                                      ? 'text-red-700'
                                      : 'text-green-700'
                                  }`}
                                >
                                  {h.requiresTreatment
                                    ? 'Cần điều trị'
                                    : 'Không cần điều trị'}
                                </Text>
                              </View>

                              <View
                                className={`flex-row items-center rounded-2xl border px-3 py-2 ${
                                  h.isIsolated
                                    ? 'border-purple-200 bg-purple-100'
                                    : 'border-gray-200 bg-gray-100'
                                }`}
                              >
                                <View
                                  className={`mr-2 h-2 w-2 rounded-full ${
                                    h.isIsolated
                                      ? 'bg-purple-500'
                                      : 'bg-gray-400'
                                  }`}
                                />
                                <Text
                                  className={`text-sm font-bold ${
                                    h.isIsolated
                                      ? 'text-purple-700'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  {h.isIsolated
                                    ? 'Đang cách ly'
                                    : 'Không cách ly'}
                                </Text>
                              </View>
                            </View>

                            {/* Incident ID Badge */}
                            <View className="mt-3 flex-row items-center px-3 py-2">
                              <Text className="text-sm text-gray-500">
                                Mã sự cố:
                              </Text>
                              <Text className="ml-1 text-xs font-bold text-gray-700">
                                #{h.incidentId}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable InfoRow Component
function InfoRow({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactElement;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center">
      <View
        className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${iconBg}`}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-500">{label}</Text>
        <Text className="text-lg font-semibold text-gray-900">{value}</Text>
      </View>
    </View>
  );
}
