import {
  useDeleteWaterAlert,
  useGetInfiniteWaterAlerts,
  useResolveWaterAlert,
} from '@/hooks/useWaterAlert';
import { Severity, WaterAlert } from '@/lib/api/services/fetchWaterAlert';
import { WaterParameterType } from '@/lib/api/services/fetchWaterParameterThreshold';
import { formatDate } from '@/lib/utils/formatDate';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Droplets,
  Info,
  Trash2,
  X,
} from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  PanResponder,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CustomAlert } from './CustomAlert';

type Props = {
  visible: boolean;
  onClose: () => void;
  pondId?: number;
};

const WaterAlertBottomSheet: React.FC<Props> = ({
  visible,
  onClose,
  pondId,
}) => {
  const filters = pondId ? { pondId } : undefined;
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    refetch,
  } = useGetInfiniteWaterAlerts(filters, visible);

  const resolveMutation = useResolveWaterAlert();
  const deleteMutation = useDeleteWaterAlert();

  const [resolvingIds, setResolvingIds] = useState<Set<number>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const alertsList = useMemo(() => {
    const list = data?.pages.flatMap((page) => page.data) ?? [];
    return list;
  }, [data]);

  const onResolve = (id: number) => {
    setResolvingIds((prev) => new Set(prev).add(id));
    resolveMutation.mutate(id, {
      onSettled: () => {
        setResolvingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      },
    });
  };

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const onDelete = (id: number) => {
    setDeleteTarget(id);
  };

  const getSeverityConfig = (severity: string) => {
    const s = (severity || '').toLowerCase();
    switch (true) {
      case s.includes('cao') ||
        s.includes('high') ||
        s.includes('critical') ||
        s.includes('urgent'):
        return {
          bg: 'bg-red-500',
          lightBg: 'bg-red-50',
          border: 'border-red-100',
          text: 'text-red-600',
          darkText: 'text-red-700',
          icon: '#ef4444',
          gradient: ['#fee2e2', '#fecaca'],
        };
      case s.includes('trung bình') ||
        s.includes('medium') ||
        s.includes('warning'):
        return {
          bg: 'bg-orange-500',
          lightBg: 'bg-orange-50',
          border: 'border-orange-100',
          text: 'text-orange-600',
          darkText: 'text-orange-700',
          icon: '#f97316',
          gradient: ['#ffedd5', '#fed7aa'],
        };
      case s.includes('thấp') || s.includes('low'):
        return {
          bg: 'bg-yellow-500',
          lightBg: 'bg-yellow-50',
          border: 'border-yellow-100',
          text: 'text-yellow-600',
          darkText: 'text-yellow-700',
          icon: '#eab308',
          gradient: ['#fef9c3', '#fef08a'],
        };
      default:
        return {
          bg: 'bg-blue-500',
          lightBg: 'bg-blue-50',
          border: 'border-blue-100',
          text: 'text-blue-600',
          darkText: 'text-blue-700',
          icon: '#3b82f6',
          gradient: ['#dbeafe', '#bfdbfe'],
        };
    }
  };

  const translateSeverity = (severity: string) => {
    const s = (severity || '').toLowerCase();
    if (!s) return '';
    switch (true) {
      case s === (Severity.LOW || '').toLowerCase() ||
        s.includes('low') ||
        s.includes('thấp'):
        return 'Thấp';
      case s === (Severity.MEDIUM || '').toLowerCase() ||
        s.includes('medium') ||
        s.includes('trung bình'):
        return 'Trung bình';
      case s === (Severity.HIGH || '').toLowerCase() ||
        s.includes('high') ||
        s.includes('cao'):
        return 'Cao';
      case s === (Severity.URGENT || '').toLowerCase() ||
        s.includes('urgent') ||
        s.includes('khẩn'):
        return 'Khẩn cấp';
      default:
        return severity.charAt(0).toUpperCase() + severity.slice(1);
    }
  };

  const translateParameterName = (param: string) => {
    switch (param) {
      case WaterParameterType.PH_LEVEL:
        return 'Độ pH';
      case WaterParameterType.TEMPERATURE_CELSIUS:
        return 'Nhiệt độ';
      case WaterParameterType.OXYGEN_LEVEL:
        return 'Hàm lượng Oxy hòa tan';
      case WaterParameterType.AMMONIA_LEVEL:
        return 'Nồng độ Amoniac';
      case WaterParameterType.NITRITE_LEVEL:
        return 'Nồng độ Nitrit';
      case WaterParameterType.NITRATE_LEVEL:
        return 'Nồng độ Nitrat';
      case WaterParameterType.CARBON_HARDNESS:
        return 'Độ cứng cacbonat';
      case WaterParameterType.WATER_LEVEL_METERS:
        return 'Mực nước';
      default:
        return param;
    }
  };

  const getSeverityIcon = (severity: string) => {
    const s = (severity || '').toLowerCase();
    if (s.includes('cao') || s.includes('urgent')) {
      return AlertTriangle;
    } else if (s.includes('trung')) {
      return AlertCircle;
    }
    return Info;
  };

  const renderItem = ({ item }: { item: WaterAlert }) => {
    const config = getSeverityConfig(item.severity);
    const SeverityIcon = getSeverityIcon(item.severity);

    return (
      <View className="mb-4 overflow-hidden rounded-3xl bg-white shadow-lg shadow-black/5">
        {/* Severity Badge - Floating Style */}
        <View className="absolute right-3 top-3 z-10 flex-row items-center rounded-full bg-white/95 px-3 py-1.5 shadow-sm">
          <SeverityIcon size={14} color={config.icon} strokeWidth={2.5} />
          <Text className={`ml-1.5 text-xs font-bold uppercase ${config.text}`}>
            {translateSeverity(item.severity)}
          </Text>
        </View>

        {/* Header with gradient background */}
        <View className={`${config.lightBg} px-5 pb-4 pt-5`}>
          <View className="flex-row items-start">
            <View className={`${config.bg} mr-3 rounded-2xl p-2.5 shadow-sm`}>
              <Droplets size={20} color="white" strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                {item.pondName}
              </Text>
              <View className="mt-1.5 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Activity size={14} color="#6b7280" strokeWidth={2} />
                  <Text className="ml-1.5 text-sm font-medium text-gray-600">
                    {translateParameterName(item.parameterName)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Clock size={10} color="#6b7280" />
                  <Text className="ml-1 text-sm font-medium text-gray-500">
                    {formatDate(
                      new Date(
                        new Date(item.createdAt).getTime() + 7 * 60 * 60 * 1000
                      ).toISOString(),
                      'HH:mm dd/MM/yyyy'
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="px-5 py-4">
          {/* Message */}
          <View className="mb-4 rounded-2xl bg-gray-50 p-4">
            <Text className="text-[15px] leading-6 text-gray-700">
              {item.message}
            </Text>
          </View>

          {/* Action Buttons */}
          {item.isResolved ? (
            <View className="mb-2 flex-row items-center justify-center rounded-2xl bg-emerald-50 px-4 py-4">
              <CheckCircle2 size={20} color="#10b981" strokeWidth={2.5} />
              <Text className="ml-2 text-base font-bold text-emerald-600">
                Đã giải quyết
              </Text>
            </View>
          ) : (
            <View className="mb-2 flex-row gap-2">
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center rounded-2xl bg-emerald-500 py-4 shadow-sm shadow-emerald-500/30 active:bg-emerald-600"
                onPress={() => onResolve(item.id)}
                disabled={resolvingIds.has(item.id)}
              >
                {resolvingIds.has(item.id) ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Check size={20} color="white" strokeWidth={2.5} />
                    <Text className="ml-2 text-base font-bold text-white">
                      Xử lý
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center rounded-2xl border border-red-200 bg-red-50 py-4 active:bg-red-100"
                onPress={() => onDelete(item.id)}
                disabled={deletingIds.has(item.id)}
              >
                {deletingIds.has(item.id) ? (
                  <ActivityIndicator size="small" color="#dc2626" />
                ) : (
                  <>
                    <Trash2 size={18} color="#dc2626" strokeWidth={2} />
                    <Text className="ml-2 text-sm font-semibold text-red-600">
                      Xóa cảnh báo
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View className="border-b border-gray-100 px-5 pb-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="mr-3 rounded-2xl p-2.5">
            <AlertCircle size={22} color="red" strokeWidth={2.5} />
          </View>
          <View>
            <Text className="text-xl font-bold text-gray-900">
              Cảnh báo nước
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onClose}
          className="rounded-full bg-gray-200 p-2 active:bg-gray-200"
        >
          <X size={20} color="#6b7280" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="items-center py-6">
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text className="mt-2 text-sm font-medium text-gray-500">
          Đang tải thêm...
        </Text>
      </View>
    );
  };

  const slideAnim = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;
  const modalHeight = (screenHeight * 85) / 100;

  useEffect(() => {
    if (visible) {
      panY.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, panY, slideAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120) {
          onClose();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            tension: 65,
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [modalHeight, 0],
  });

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999998,
          elevation: 998,
          opacity: slideAnim,
        }}
      />

      {/* Bottom Sheet */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: modalHeight,
          backgroundColor: '#fafafa',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          transform: [{ translateY }, { translateY: panY }],
          zIndex: 999999,
          elevation: 999,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        }}
        {...panResponder.panHandlers}
      >
        {/* Drag Handle */}
        <View className="mb-3 mt-3 h-1.5 w-12 self-center rounded-full bg-gray-300" />

        {/* Header */}
        {renderHeader()}

        {/* Content */}
        <FlatList
          data={alertsList}
          keyExtractor={(item, index) => `alert-${item.id}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 100,
          }}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          scrollEventThrottle={16}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={['#3b82f6']}
              tintColor="#3b82f6"
            />
          }
          ListEmptyComponent={() => (
            <View className="items-center py-16">
              {isLoading ? (
                <>
                  <View className="rounded-full bg-blue-50 p-6">
                    <ActivityIndicator size="large" color="#3b82f6" />
                  </View>
                  <Text className="mt-4 text-base font-semibold text-gray-700">
                    Đang tải cảnh báo...
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500">
                    Vui lòng chờ trong giây lát
                  </Text>
                </>
              ) : isError ? (
                <>
                  <View className="rounded-full bg-red-50 p-6">
                    <AlertCircle size={40} color="#ef4444" strokeWidth={2} />
                  </View>
                  <Text className="mt-4 text-lg font-bold text-red-600">
                    Không thể tải cảnh báo
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500">
                    Đã xảy ra lỗi, vui lòng thử lại
                  </Text>
                  <TouchableOpacity
                    onPress={() => refetch()}
                    className="mt-6 rounded-2xl bg-blue-500 px-8 py-3.5 shadow-sm shadow-blue-500/30"
                    activeOpacity={0.8}
                  >
                    <Text className="text-center text-base font-bold text-white">
                      Thử lại
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View className="rounded-full bg-emerald-50 p-6">
                    <CheckCircle2 size={40} color="#10b981" strokeWidth={2} />
                  </View>
                  <Text className="mt-4 text-lg font-bold text-gray-700">
                    Không có cảnh báo
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500">
                    Tất cả các thông số đều ổn định
                  </Text>
                </>
              )}
            </View>
          )}
        />
      </Animated.View>

      {/* Delete Confirmation */}
      <CustomAlert
        visible={deleteTarget !== null}
        title="Xóa cảnh báo"
        message="Bạn có chắc chắn muốn xóa cảnh báo này không?"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget !== null) {
            setDeletingIds((prev) => new Set(prev).add(deleteTarget));
            deleteMutation.mutate(deleteTarget, {
              onSettled: () => {
                setDeletingIds((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(deleteTarget);
                  return newSet;
                });
              },
            });
          }
          setDeleteTarget(null);
        }}
        cancelText="Hủy"
        confirmText="Xóa"
        type="danger"
      />
    </>
  );
};

export default WaterAlertBottomSheet;
