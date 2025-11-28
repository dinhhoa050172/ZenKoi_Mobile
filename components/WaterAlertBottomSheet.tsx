import {
  useDeleteWaterAlert,
  useGetInfiniteWaterAlerts,
  useResolveWaterAlert,
} from '@/hooks/useWaterAlert';
import { Severity, WaterAlert } from '@/lib/api/services/fetchWaterAlert';
import { formatDate } from '@/lib/utils/formatDate';
import { AlertCircle, Check, Droplets, Trash2, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  PanResponder,
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
    refetch,
  } = useGetInfiniteWaterAlerts(filters, visible);

  const resolveMutation = useResolveWaterAlert();
  const deleteMutation = useDeleteWaterAlert();

  // Flatten pages data
  const alertsList = useMemo(() => {
    const list = data?.pages.flatMap((page) => page.data) ?? [];
    return list;
  }, [data]);

  const onResolve = (id: number) => {
    resolveMutation.mutate(id);
  };

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const onDelete = (id: number) => {
    // open custom confirm modal
    setDeleteTarget(id);
  };

  // Determine severity color
  const getSeverityColor = (severity: string) => {
    const s = (severity || '').toLowerCase();
    switch (true) {
      case s.includes('cao') ||
        s.includes('high') ||
        s.includes('critical') ||
        s.includes('urgent'):
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: '#dc2626',
        };
      case s.includes('trung bình') ||
        s.includes('medium') ||
        s.includes('warning'):
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          icon: '#ea580c',
        };
      case s.includes('thấp') || s.includes('low'):
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: '#ca8a04',
        };
      default:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: '#ca8a04',
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

  const renderItem = ({ item }: { item: WaterAlert }) => {
    const severityStyle = getSeverityColor(item.severity);

    return (
      <View className="mb-3 rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Header with severity indicator */}
        <View
          className={`flex-row items-center justify-between rounded-t-2xl border-b ${severityStyle.border} ${severityStyle.bg} px-4 py-3`}
        >
          <View className="flex-1 flex-row items-center">
            <AlertCircle size={22} color={severityStyle.icon} />
            <Text
              className={`ml-2 text-base font-semibold uppercase ${severityStyle.text}`}
            >
              {translateSeverity(item.severity)}
            </Text>
          </View>
          <Text className="text-base text-gray-500">
            {formatDate(item.createdAt, 'HH:mm dd/MM/yyyy')}
          </Text>
        </View>

        {/* Content */}
        <View className="p-4">
          <View className="flex-row items-start">
            <View className="mr-3 mt-0.5">
              <Droplets size={22} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {item.pondName}
              </Text>
              <Text className="mt-1 text-base font-medium text-gray-700">
                {item.parameterName}
              </Text>
              <Text className="mt-2 text-base leading-5 text-gray-600">
                {item.message}
              </Text>

              {/* Measured Value Badge */}
              <View className="mt-3 inline-flex self-start rounded-full bg-blue-50 px-3 py-1.5">
                <Text className="text-base font-medium text-blue-700">
                  Giá trị: {item.measuredValue}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mt-4 flex-row gap-2">
            {!item.isResolved && (
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center rounded-2xl border border-green-200 bg-green-50 py-3 active:bg-green-100"
                onPress={() => onResolve(item.id)}
                disabled={resolveMutation.isPending}
              >
                {resolveMutation.isPending ? (
                  <ActivityIndicator size="small" color="#16a34a" />
                ) : (
                  <>
                    <Check size={22} color="#16a34a" strokeWidth={2.5} />
                    <Text className="ml-2 text-base font-semibold text-green-700">
                      Đã xử lý
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center rounded-2xl border border-red-200 bg-red-50 py-3 active:bg-red-100"
              onPress={() => onDelete(item.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <ActivityIndicator size="small" color="#dc2626" />
              ) : (
                <>
                  <Trash2 size={22} color="#dc2626" strokeWidth={2.5} />
                  <Text className="ml-2 text-base font-semibold text-red-700">
                    Xóa
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Custom header for the modal
  const renderHeader = () => (
    <View className="flex-row items-center justify-between border-b border-gray-200 px-4 pb-4">
      <View className="flex-row items-center">
        <View className="mr-3 rounded-full bg-red-100 p-2">
          <AlertCircle size={20} color="red" />
        </View>
        <Text className="text-lg font-bold text-red-500">Cảnh báo nước</Text>
      </View>
      <TouchableOpacity
        onPress={onClose}
        className="rounded-full bg-gray-100 p-2 active:bg-gray-200"
      >
        <X size={20} color="#6b7280" />
      </TouchableOpacity>
    </View>
  );

  // Load more handler
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Footer component for loading indicator
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="items-center py-4">
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text className="mt-2 text-sm text-gray-500">Đang tải thêm...</Text>
      </View>
    );
  };

  // Bottom sheet animation and pan responder (self-contained — no BottomSheetModal)
  const slideAnim = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;
  const modalHeight = (screenHeight * 80) / 100; // 80% height

  useEffect(() => {
    if (visible) {
      panY.setValue(0);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
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
      {/* Overlay Background */}
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
          backgroundColor: 'white',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          transform: [{ translateY }, { translateY: panY }],
          zIndex: 999999,
          elevation: 999,
        }}
        {...panResponder.panHandlers}
      >
        {/* Drag handle */}
        <View className="mb-2 mt-3 h-1.5 w-12 self-center rounded-full bg-gray-300" />

        {/* Header */}
        {renderHeader()}

        {/* Content: FlatList */}
        <FlatList
          data={alertsList}
          keyExtractor={(item, index) => `alert-${item.id}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 90,
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
          ListEmptyComponent={() => (
            <View className="items-center py-12">
              {isLoading ? (
                <>
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text className="mt-4 text-sm font-medium text-gray-600">
                    Đang tải cảnh báo...
                  </Text>
                </>
              ) : isError ? (
                <>
                  <View className="rounded-full bg-red-100 p-4">
                    <AlertCircle size={32} color="#dc2626" />
                  </View>
                  <Text className="mt-4 text-lg font-semibold text-red-600">
                    Không thể tải cảnh báo
                  </Text>
                  <Text className="mt-1 text-base text-gray-500">
                    Vui lòng thử lại sau
                  </Text>

                  <TouchableOpacity
                    onPress={() => refetch()}
                    className="mt-4 rounded-2xl bg-primary px-4 py-2"
                    activeOpacity={0.8}
                  >
                    <Text className="text-center text-lg font-semibold text-white">
                      Thử lại
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View className="rounded-full bg-gray-100 p-4">
                    <Droplets size={32} color="#9ca3af" />
                  </View>
                  <Text className="mt-4 text-sm font-medium text-gray-600">
                    Không có cảnh báo
                  </Text>
                  <Text className="mt-1 text-xs text-gray-500">
                    Tất cả các thông số đều ổn định
                  </Text>
                </>
              )}
            </View>
          )}
        />
      </Animated.View>

      {/* Delete confirmation using CustomAlert */}
      <CustomAlert
        visible={deleteTarget !== null}
        title="Xóa cảnh báo"
        message="Bạn có chắc muốn xóa cảnh báo này?"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget !== null) {
            deleteMutation.mutate(deleteTarget);
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
