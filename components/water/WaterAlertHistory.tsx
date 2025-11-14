import { useGetWaterAlerts } from '@/hooks/useWaterAlert';
import { Severity, WaterAlert } from '@/lib/api/services/fetchWaterAlert';
import { WaterParameterType } from '@/lib/api/services/fetchWaterParameterThreshold';
import { formatDate } from '@/lib/utils/formatDate';
import { useFocusEffect } from '@react-navigation/native';
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Droplets,
  Plus,
  RefreshCw,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  pondId: number;
  limit?: number;
  title?: string;
  isExpanded?: boolean;
  onToggle?: () => void;
};

const paramLabel = (p: WaterParameterType) => {
  switch (p) {
    case WaterParameterType.PH_LEVEL:
      return 'Độ pH';
    case WaterParameterType.TEMPERATURE_CELSIUS:
      return 'Nhiệt độ';
    case WaterParameterType.OXYGEN_LEVEL:
      return 'Oxy hòa tan';
    case WaterParameterType.AMMONIA_LEVEL:
      return 'Amoniac (NH₃)';
    case WaterParameterType.NITRITE_LEVEL:
      return 'Nitrit (NO₂)';
    case WaterParameterType.NITRATE_LEVEL:
      return 'Nitrate (NO₃)';
    case WaterParameterType.CARBON_HARDNESS:
      return 'Độ cứng (KH)';
    case WaterParameterType.WATER_LEVEL_METERS:
      return 'Mực nước';
    default:
      return String(p);
  }
};

const paramUnit = (p: WaterParameterType) => {
  switch (p) {
    case WaterParameterType.TEMPERATURE_CELSIUS:
      return '°C';
    case WaterParameterType.OXYGEN_LEVEL:
      return 'mg/L';
    case WaterParameterType.AMMONIA_LEVEL:
      return 'mg/L';
    case WaterParameterType.NITRITE_LEVEL:
      return 'mg/L';
    case WaterParameterType.NITRATE_LEVEL:
      return 'mg/L';
    case WaterParameterType.CARBON_HARDNESS:
      return '°dH';
    case WaterParameterType.WATER_LEVEL_METERS:
      return 'm';
    default:
      return '';
  }
};

const SmallItem: React.FC<{ item: WaterAlert }> = ({ item }) => {
  const isSevere =
    item.severity === Severity.HIGH || item.severity === Severity.URGENT;
  return (
    <View className="mb-3 flex-row items-start rounded-lg bg-white p-3">
      <View className="mr-3 mt-0.5">
        <Droplets size={18} color={isSevere ? '#dc2626' : '#f97316'} />
      </View>
      <View className="flex-1">
        <Text
          className="text-base font-semibold text-gray-800"
          numberOfLines={1}
        >
          {paramLabel(item.parameterName)} — {item.message}
        </Text>
        <View className="mt-1">
          <Text className="text-base text-gray-600">
            Giá trị: {item.measuredValue ?? '--'}{' '}
            {paramUnit(item.parameterName)}
          </Text>
        </View>
        <View className="mt-1 flex-row items-center justify-between">
          <Text className="text-base text-gray-500">
            {formatDate(item.createdAt, 'dd/MM/yyyy HH:mm')}
          </Text>
          <View className="flex-row items-center space-x-2">
            <View
              className={`rounded-2xl px-2 py-0.5 ${isSevere ? 'bg-red-100' : 'bg-orange-100'}`}
            >
              <Text
                className={`text-base ${isSevere ? 'text-red-700' : 'text-orange-700'}`}
              >
                {isSevere ? 'Nguy hiểm' : 'Cảnh báo'}
              </Text>
            </View>
            {item.isResolved && (
              <View className="ml-2 rounded-2xl bg-green-100 px-2 py-0.5">
                <Text className="text-base text-green-700">Đã xử lý</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const WaterAlertHistory: React.FC<Props> = ({
  pondId,
  limit = 5,
  title = 'Lịch sử cảnh báo',
  isExpanded = false,
  onToggle,
}) => {
  const enabled = !!pondId;
  const FETCH_PAGE_SIZE = 100;
  const alertsQuery = useGetWaterAlerts(
    { pondId, pageIndex: 1, pageSize: FETCH_PAGE_SIZE },
    enabled
  );

  useFocusEffect(
    useCallback(() => {
      if (enabled) {
        if (!hasRefetchedOnFocus.current) {
          alertsQuery.refetch?.();
          hasRefetchedOnFocus.current = true;
        }
      }
      return undefined;
    }, [alertsQuery, enabled])
  );

  const hasRefetchedOnFocus = useRef(false);

  useEffect(() => {
    hasRefetchedOnFocus.current = false;
  }, [pondId]);

  const allItems = alertsQuery.data?.data ?? [];
  const [visibleCount, setVisibleCount] = useState<number>(4);
  const [showMoreLoading, setShowMoreLoading] = useState<boolean>(false);
  const [refreshLoading, setRefreshLoading] = useState<boolean>(false);
  const items = allItems.slice(0, visibleCount);

  // Rotation animation for the refresh icon
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotationLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const isRefreshing = refreshLoading || alertsQuery.isFetching;
    if (isRefreshing) {
      // start rotation loop
      rotateAnim.setValue(0);
      rotationLoopRef.current = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotationLoopRef.current.start();
    } else {
      // stop and reset
      if (rotationLoopRef.current) {
        rotationLoopRef.current.stop();
        rotationLoopRef.current = null;
      }
      rotateAnim.setValue(0);
    }

    return () => {
      if (rotationLoopRef.current) {
        rotationLoopRef.current.stop();
        rotationLoopRef.current = null;
      }
    };
  }, [refreshLoading, alertsQuery.isFetching, rotateAnim]);

  const handleShowMore = () => {
    const total = allItems.length;
    setShowMoreLoading(true);
    setVisibleCount((prev) => Math.min(prev + 10, total));
    setTimeout(() => setShowMoreLoading(false), 300);
  };

  return (
    <View className="mb-4 rounded-2xl bg-white shadow-sm">
      {/* Header */}
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between p-4"
      >
        <View>
          <Text className="text-lg font-semibold text-gray-900">{title}</Text>
        </View>

        {isExpanded ? (
          <ChevronUp size={20} color="#6b7280" />
        ) : (
          <ChevronDown size={20} color="#6b7280" />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View className="px-4 pb-4">
          {alertsQuery.isLoading ? (
            <View className="items-center py-6">
              <ActivityIndicator />
              <Text className="mt-2 text-sm text-gray-600">
                Đang tải lịch sử...
              </Text>
            </View>
          ) : items.length === 0 ? (
            <View className="items-center py-3">
              <View className="rounded-full bg-red-100 p-4">
                <AlertCircle size={28} color="red" />
              </View>
              <Text className="mt-4 text-base text-gray-600">
                Chưa có cảnh báo
              </Text>
            </View>
          ) : (
            <>
              <FlatList<WaterAlert>
                data={items}
                keyExtractor={(i) => String(i.id)}
                renderItem={({ item }) => <SmallItem item={item} />}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              />

              {allItems.length > visibleCount && (
                <View className="mt-3">
                  <TouchableOpacity
                    onPress={handleShowMore}
                    disabled={showMoreLoading}
                    className="flex-row items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-2"
                    activeOpacity={0.8}
                  >
                    {showMoreLoading ? (
                      <ActivityIndicator size="small" color="#0A3D62" />
                    ) : (
                      <Plus size={18} color="#0A3D62" />
                    )}
                    <Text className="ml-2 text-center text-base font-semibold text-gray-700">
                      {showMoreLoading ? 'Đang tải...' : 'Hiện thêm'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {/* Footer: quick refresh */}
          <View className="mt-3">
            <TouchableOpacity
              onPress={async () => {
                try {
                  setRefreshLoading(true);
                  await alertsQuery.refetch();
                } finally {
                  setRefreshLoading(false);
                }
              }}
              disabled={refreshLoading || alertsQuery.isFetching}
              className="flex-row items-center justify-center rounded-2xl bg-primary px-4 py-2"
              activeOpacity={0.8}
            >
              {/* Animated rotating RefreshCw while fetching */}
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                }}
              >
                <RefreshCw size={18} color="#fff" />
              </Animated.View>

              <Text className="ml-2 text-center text-base font-semibold text-white">
                Tải lại
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default WaterAlertHistory;
