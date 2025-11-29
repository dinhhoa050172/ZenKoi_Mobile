import { CustomAlert } from '@/components/CustomAlert';
import Loading from '@/components/Loading';
import FishSvg from '@/components/icons/FishSvg';
import PondSvg from '@/components/icons/PondSvg';
import CancelIncidentModal from '@/components/incidents/CancelIncidentModal';
import ResolveIncidentModal from '@/components/incidents/ResolveIncidentModal';
import {
  useGetIncidentById,
  useUpdateIncidentStatus,
} from '@/hooks/useIncident';
import { useGetKoiFishById } from '@/hooks/useKoiFish';
import { useGetPondById } from '@/hooks/usePond';
import {
  IncidentStatus,
  KoiAffectedStatus,
  KoiIncident,
  PondIncident,
} from '@/lib/api/services/fetchIncident';
import { formatDate } from '@/lib/utils/formatDate';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Droplets,
  Edit,
  FileText,
  Heart,
  TrendingUp,
  User,
  Waves,
  XCircle,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Helper cho TRẠNG THÁI (Status)
export const getStatusInfo = (status: IncidentStatus) => {
  switch (status) {
    case IncidentStatus.Resolved:
      return {
        icon: <CheckCircle size={16} color="#059669" />,
        color: '#059669',
        bgColor: '#f0fdf4',
        label: 'Đã giải quyết',
      };
    case IncidentStatus.Investigating:
      return {
        icon: <AlertCircle size={16} color="#2563eb" />,
        color: '#2563eb',
        bgColor: '#eff6ff',
        label: 'Đang điều tra',
      };
    case IncidentStatus.Closed:
      return {
        icon: <XCircle size={16} color="#6b7280" />,
        color: '#6b7280',
        bgColor: '#f9fafb',
        label: 'Đã đóng',
      };
    case IncidentStatus.Cancelled:
      return {
        icon: <XCircle size={16} color="#dc2626" />,
        color: '#dc2626',
        bgColor: '#fef2f2',
        label: 'Đã hủy',
      };
    default:
      return {
        icon: <AlertTriangle size={16} color="#d97706" />,
        color: '#d97706',
        bgColor: '#fffbeb',
        label: 'Đã báo cáo',
      };
  }
};

// Helper cho TRẠNG THÁI CÁ (Koi Status)
export const getAffectedStatusInfo = (status: KoiAffectedStatus) => {
  switch (status) {
    case 'Healthy':
      return {
        icon: <Heart size={14} color="#059669" />,
        color: '#059669',
        bgColor: '#f0fdf4',
        label: 'Khỏe mạnh',
      };
    case 'Warning':
      return {
        icon: <AlertTriangle size={14} color="#d97706" />,
        color: '#d97706',
        bgColor: '#fffbeb',
        label: 'Cảnh báo',
      };
    case 'Sick':
      return {
        icon: <AlertTriangle size={14} color="#dc2626" />,
        color: '#dc2626',
        bgColor: '#fef2f2',
        label: 'Bệnh',
      };
    case 'Dead':
      return {
        icon: <XCircle size={14} color="#6b7280" />,
        color: '#6b7280',
        bgColor: '#f3f4f6',
        label: 'Chết',
      };
    default:
      return {
        icon: <AlertCircle size={14} color="#6b7280" />,
        color: '#6b7280',
        bgColor: '#f3f4f6',
        label: 'Không rõ',
      };
  }
};

// --- HẾT: HELPER FUNCTIONS ---

export default function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const incidentId = parseInt(id as string, 10);
  const [isResolving, setIsResolving] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // CustomAlert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm?: () => void;
  }>({ visible: false, title: '', message: '' });

  const router = useRouter();
  const {
    data: incidentData,
    isLoading,
    refetch,
  } = useGetIncidentById(incidentId);
  const resolveMutation = useUpdateIncidentStatus();

  useEffect(() => {
    if (incidentData) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [incidentData, fadeAnim, slideAnim]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    // Sửa lại đường dẫn cho Expo Router
    router.push(`/(home)/incidents/edit?id=${incidentData?.id}`);
  };

  const handleResolveIncident = () => {
    if (!incidentData) return;
    setShowResolveModal(true);
  };

  const handleSubmitResolve = async (resolutionNotes: string) => {
    if (!incidentData) return;
    setIsResolving(true);
    try {
      await resolveMutation.mutateAsync({
        id: incidentData.id,
        IncidentResolutionRequest: {
          status: 'Resolved',
          resolutionNotes: resolutionNotes,
        },
      });
      setShowResolveModal(false);
      refetch();
      // Không cần router.back(), chỉ cần refetch để cập nhật UI
    } catch (error) {
      console.error('Error resolving incident:', error);
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: 'Không thể giải quyết sự cố. Vui lòng thử lại.',
        type: 'danger',
      });
    } finally {
      setIsResolving(false);
    }
  };

  const handleCancelIncident = () => {
    if (!incidentData) return;
    setShowCancelModal(true);
  };

  const handleSubmitCancel = async (resolutionNotes: string) => {
    if (!incidentData) return;
    setIsCancelling(true);
    try {
      await resolveMutation.mutateAsync({
        id: incidentData.id,
        IncidentResolutionRequest: {
          status: 'Cancelled',
          resolutionNotes: resolutionNotes,
        },
      });
      setShowCancelModal(false);
      refetch();
    } catch (error) {
      console.error('Error cancelling incident:', error);
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: 'Không thể hủy sự cố. Vui lòng thử lại.',
        type: 'danger',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0A3D62]">
        <StatusBar barStyle="light-content" backgroundColor="#0A3D62" />
        <View className="flex-1 items-center justify-center">
          <Loading />
        </View>
      </SafeAreaView>
    );
  }

  if (!incidentData) {
    return (
      <SafeAreaView className="flex-1 bg-[#0A3D62]">
        <StatusBar barStyle="light-content" backgroundColor="#0A3D62" />
        <View className="flex-1 items-center justify-center p-6">
          <View className="items-center rounded-3xl bg-white p-8 shadow-lg">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle size={32} color="#dc2626" />
            </View>
            <Text className="mb-2 text-xl font-bold text-gray-900">
              Không tìm thấy sự cố
            </Text>
            <Text className="mb-6 text-center text-base text-gray-500">
              Sự cố này có thể đã bị xóa hoặc không tồn tại
            </Text>
            <TouchableOpacity
              onPress={handleBack}
              className="rounded-2xl bg-[#0A3D62] px-6 py-3"
            >
              <Text className="font-semibold text-white">Quay lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(incidentData.status);

  return (
    <>
      {/* 1. Nền & Status Bar */}
      <SafeAreaView className="flex-1 bg-[#0A3D62]">
        <StatusBar barStyle="light-content" backgroundColor="#0A3D62" />

        {/* 2. Header (Thông tin chính) */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="px-6 pt-4"
        >
          {/* Nút Back & Edit */}
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handleBack}
              className="flex-row items-center rounded-full bg-white/10 p-2 pr-4"
              activeOpacity={0.8}
            >
              <ChevronLeft size={24} color="white" />
              <Text className="ml-1 text-base font-semibold text-white">
                Quay lại
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleEdit}
              className="rounded-full bg-white/10 p-3"
              activeOpacity={0.8}
            >
              <Edit size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Tiêu đề & Loại */}
          <View className="mt-6">
            <Text className="text-sm font-medium text-blue-300">
              {incidentData.incidentType.name}
            </Text>
            <Text className="mt-1 text-2xl font-bold text-white">
              {incidentData.incidentTitle}
            </Text>
          </View>

          {/* Tags (Trạng thái) */}
          <View className="mt-4 flex-row gap-2">
            <View
              className="flex-row items-center rounded-full px-3 py-2"
              style={{ backgroundColor: statusInfo.bgColor }}
            >
              {statusInfo.icon}
              <Text
                className="ml-2 text-base font-bold"
                style={{ color: statusInfo.color }}
              >
                {statusInfo.label}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* 3. Nội dung ScrollView (Thẻ trắng) */}
        <Animated.View
          className="mt-6 flex-1 rounded-t-3xl bg-slate-50"
          style={{
            opacity: fadeAnim,
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 24,
              paddingBottom: 40,
            }}
          >
            {/* Thẻ Chi Tiết */}
            <InfoCard title="Chi tiết sự cố" icon={<FileText />}>
              <Text className="mb-6 text-base leading-7 text-slate-700">
                {incidentData.description}
              </Text>
              <View className="gap-4">
                <InfoRow
                  icon={<Calendar size={20} color="#0A3D62" />}
                  label="Ngày xảy ra"
                  value={formatDate(
                    incidentData.occurredAt,
                    'dd/MM/yyyy HH:mm'
                  )}
                />
                <InfoRow
                  icon={<User size={20} color="#0A3D62" />}
                  label="Người báo cáo"
                  value={incidentData.reportedByUserName}
                />
              </View>
            </InfoCard>

            {/* Thẻ Tài Sản Bị Ảnh Hưởng */}
            {(incidentData.koiIncidents.length > 0 ||
              incidentData.pondIncidents.length > 0) && (
              <InfoCard title="Tài sản bị ảnh hưởng" icon={<Waves />}>
                {/* Danh sách Cá */}
                {incidentData.koiIncidents.length > 0 && (
                  <View className="mb-4">
                    <Text className="mb-3 text-base font-semibold text-slate-800">
                      Cá Koi ({incidentData.koiIncidents.length})
                    </Text>
                    <View className="flex-col gap-4">
                      {incidentData.koiIncidents.map(
                        (koiIncident: KoiIncident, index: number) => (
                          <ModernKoiIncidentCard
                            key={index}
                            koiIncident={koiIncident}
                          />
                        )
                      )}
                    </View>
                  </View>
                )}

                {/* Danh sách Ao */}
                {incidentData.pondIncidents.length > 0 && (
                  <View>
                    <Text className="mb-3 text-base font-semibold text-slate-800">
                      Ao nuôi ({incidentData.pondIncidents.length})
                    </Text>
                    <View className="flex-col gap-4">
                      {incidentData.pondIncidents.map(
                        (pondIncident: PondIncident, index: number) => (
                          <ModernPondIncidentCard
                            key={index}
                            pondIncident={pondIncident}
                          />
                        )
                      )}
                    </View>
                  </View>
                )}
              </InfoCard>
            )}

            {/* Thẻ Ghi Chú Giải Quyết */}
            {incidentData.resolutionNotes && (
              <InfoCard title="Ghi chú giải quyết" icon={<CheckCircle />}>
                <View className="rounded-2xl bg-emerald-50 p-4">
                  <Text className="text-base leading-7 text-emerald-800">
                    {incidentData.resolutionNotes}
                  </Text>
                </View>
              </InfoCard>
            )}
          </ScrollView>
        </Animated.View>

        {/* 4. Nút Hành Động (FAB) */}
        {incidentData.status !== IncidentStatus.Resolved &&
          incidentData.status !== IncidentStatus.Closed &&
          incidentData.status !== IncidentStatus.Cancelled && (
            <Animated.View
              className="absolute bottom-6 left-6 right-6"
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              }}
            >
              <View className="flex-row gap-3">
                {/* Cancel Button */}
                <TouchableOpacity
                  onPress={handleCancelIncident}
                  disabled={isCancelling}
                  activeOpacity={0.9}
                  className="flex-1"
                  style={{
                    shadowColor: '#dc2626',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    elevation: 8,
                  }}
                >
                  <LinearGradient
                    colors={['#ef4444', '#dc2626']}
                    className="overflow-hidden rounded-3xl py-4"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View className="flex-row items-center justify-center">
                      <XCircle size={20} color="white" />
                      <Text className="ml-2 text-base font-bold text-white">
                        {isCancelling ? 'Đang hủy...' : 'Hủy'}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Resolve Button */}
                <TouchableOpacity
                  onPress={handleResolveIncident}
                  disabled={isResolving}
                  activeOpacity={0.9}
                  className="flex-1"
                  style={{
                    shadowColor: '#0A3D62',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    elevation: 8,
                  }}
                >
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    className="overflow-hidden rounded-3xl py-4"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View className="flex-row items-center justify-center">
                      <CheckCircle size={20} color="white" />
                      <Text className="ml-2 text-base font-bold text-white">
                        {isResolving ? 'Đang giải quyết...' : 'Giải quyết'}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

        {/* 5. Modals */}
        <ResolveIncidentModal
          visible={showResolveModal}
          onClose={() => setShowResolveModal(false)}
          onResolve={handleSubmitResolve}
          isSubmitting={isResolving}
          incidentTitle={incidentData?.incidentTitle}
        />

        <CancelIncidentModal
          visible={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onCancel={handleSubmitCancel}
          isSubmitting={isCancelling}
          incidentTitle={incidentData?.incidentTitle}
        />

        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onCancel={() =>
            setAlertConfig((prev) => ({ ...prev, visible: false }))
          }
          onConfirm={() => {
            alertConfig.onConfirm?.();
            setAlertConfig((prev) => ({ ...prev, visible: false }));
          }}
        />
      </SafeAreaView>
    </>
  );
}

// --- Component Thẻ Thông Tin (Card) ---
const InfoCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <View className="mb-6 rounded-3xl bg-white p-5 shadow-md">
    <View className="mb-4 flex-row items-center">
      <View className="rounded-2xl bg-blue-100 p-3"></View>
      <Text className="ml-4 text-lg font-bold text-[#0A3D62]">{title}</Text>
    </View>
    {children}
  </View>
);

// --- Component Dòng Thông Tin (Row) ---
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <View className="flex-row items-start">
    <View className="mt-1 rounded-lg bg-slate-100 p-2"></View>
    <View className="ml-3 flex-1">
      <Text className="text-base font-medium text-slate-500">{label}</Text>
      <Text className="text-base font-semibold text-slate-900">{value}</Text>
    </View>
  </View>
);

// --- Thẻ Cá Koi (Đã thiết kế lại) ---
function ModernKoiIncidentCard({ koiIncident }: { koiIncident: KoiIncident }) {
  const { data: koi } = useGetKoiFishById(koiIncident.koiFishId, true);
  const statusInfo = getAffectedStatusInfo(koiIncident.affectedStatus);

  return (
    <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <View className="p-4">
        {/* Header Cá */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <FishSvg size={20} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-slate-900">
                {koi?.rfid || `Cá #${koiIncident.koiFishId}`}
              </Text>
              {koi?.variety && (
                <Text className="text-base text-slate-500">
                  {koi.variety.varietyName} •{' '}
                  {koi.gender === 'Male' ? 'Đực' : 'Cái'}
                </Text>
              )}
            </View>
          </View>
          {/* Tag Trạng thái */}
          <View
            className="flex-shrink-0 rounded-full px-3 py-1.5"
            style={{ backgroundColor: statusInfo.bgColor }}
          >
            <Text
              className="text-sm font-bold"
              style={{ color: statusInfo.color }}
            >
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Triệu chứng */}
        {koiIncident.specificSymptoms && (
          <View className="mt-3 rounded-lg bg-slate-50 p-3">
            <Text className="mb-1 text-base font-medium text-slate-500">
              Triệu chứng
            </Text>
            <Text className="text-base text-slate-800">
              {koiIncident.specificSymptoms}
            </Text>
          </View>
        )}

        {/* Tags (Điều trị, Cách ly) */}
        {(koiIncident.requiresTreatment || koiIncident.isIsolated) && (
          <View className="mt-3 flex-row items-center gap-2">
            {koiIncident.requiresTreatment && (
              <View className="rounded-full bg-red-100 px-2 py-1">
                <Text className="text-sm font-medium text-red-700">
                  Cần điều trị
                </Text>
              </View>
            )}
            {koiIncident.isIsolated && (
              <View className="rounded-full bg-yellow-100 px-2 py-1">
                <Text className="text-sm font-medium text-yellow-800">
                  Đã cách ly
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// --- Thẻ Ao Nuôi (Đã thiết kế lại) ---
function ModernPondIncidentCard({
  pondIncident,
}: {
  pondIncident: PondIncident;
}) {
  const { data: pond } = useGetPondById(pondIncident.pondId, true);

  return (
    <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <View className="p-4">
        {/* Header Ao */}
        <View className="mb-3 flex-row items-center">
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
            <PondSvg size={20} color="#059669" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-slate-900">
              {pond?.pondName || `Ao #${pondIncident.pondId}`}
            </Text>
            {pond && (
              <View className="mt-1 flex-row items-center gap-3">
                <View className="flex-row items-center">
                  <Droplets size={18} color="#64748b" />
                  <Text className="ml-1 text-base text-slate-500">
                    {pond.capacityLiters}L
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <TrendingUp size={18} color="#64748b" />
                  <Text className="ml-1 text-base text-slate-500">
                    {pond.depthMeters}m sâu
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Thay đổi môi trường */}
        {pondIncident.environmentalChanges && (
          <View className="mb-3 rounded-lg bg-slate-50 p-3">
            <Text className="mb-1 text-base font-medium text-slate-500">
              Thay đổi môi trường
            </Text>
            <Text className="text-base text-slate-800">
              {pondIncident.environmentalChanges}
            </Text>
          </View>
        )}

        {/* Tags (Thay nước, Cá chết) */}
        <View className="flex-row items-center gap-2">
          {pondIncident.requiresWaterChange && (
            <View className="rounded-full bg-blue-100 px-2 py-1">
              <Text className="text-sm font-medium text-blue-700">
                Cần thay nước
              </Text>
            </View>
          )}
          {pondIncident.fishDiedCount > 0 && (
            <View className="rounded-full bg-red-100 px-2 py-1">
              <Text className="text-sm font-medium text-red-700">
                {pondIncident.fishDiedCount} cá chết
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
