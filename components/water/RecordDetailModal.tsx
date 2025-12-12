import { useGetWaterParameterThresholds } from '@/hooks/useWaterParameterThreshold';
import type { WaterParameterRecord } from '@/lib/api/services/fetchWaterParameterRecord';
import {
  WaterParameterThreshold,
  WaterParameterType,
} from '@/lib/api/services/fetchWaterParameterThreshold';
import { formatDateSmart } from '@/lib/utils/formatDate';
import {
  AlertTriangle,
  Droplet,
  FileText,
  FlaskConical,
  Microscope,
  Ruler,
  TestTube,
  Thermometer,
  X,
} from 'lucide-react-native';
import React from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

interface RecordDetailModalProps {
  visible: boolean;
  record?: WaterParameterRecord | null;
  onClose: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function RecordDetailModal({
  visible,
  record,
  onClose,
}: RecordDetailModalProps) {
  const getPhStatus = (ph: number) => {
    if (ph < 6.5)
      return {
        color: 'bg-red-100',
        textColor: 'text-red-700',
        label: 'Thấp',
        border: 'border-red-200',
      };
    if (ph > 8.5)
      return {
        color: 'bg-orange-100',
        textColor: 'text-orange-700',
        label: 'Cao',
        border: 'border-orange-200',
      };
    return {
      color: 'bg-green-100',
      textColor: 'text-green-700',
      label: 'Tốt',
      border: 'border-green-200',
    };
  };

  const getTempStatus = (temp: number) => {
    if (temp < 20 || temp > 30)
      return {
        color: 'bg-orange-100',
        textColor: 'text-orange-700',
        border: 'border-orange-200',
        label: 'Cảnh báo',
      };
    return {
      color: 'bg-green-100',
      textColor: 'text-green-700',
      border: 'border-green-200',
      label: 'Tốt',
    };
  };

  const { data: thresholdsResp } = useGetWaterParameterThresholds(undefined);
  const thresholdsList = thresholdsResp?.data || [];

  const findThreshold = (type: WaterParameterType) => {
    if (!thresholdsList || thresholdsList.length === 0) return undefined;
    return thresholdsList.find((t) => t.parameterName === type);
  };

  const evaluateAgainstThreshold = (
    value: number | undefined,
    threshold?: WaterParameterThreshold
  ) => {
    if (value === undefined || value === null) return null;
    if (!threshold) return null;
    const min = Number(threshold.minValue ?? NaN);
    const max = Number(threshold.maxValue ?? NaN);
    if (Number.isNaN(min) || Number.isNaN(max)) return null;
    // Danger if outside range
    if (value < min || value > max)
      return {
        label: 'Nguy hiểm',
        color: 'bg-red-100',
        textColor: 'text-red-700',
        border: 'border-red-200',
      };
    const range = max - min;
    // Warning when within 10% of either bound
    if (range > 0) {
      const pct = range * 0.1;
      if (value <= min + pct || value >= max - pct)
        return {
          label: 'Cảnh báo',
          color: 'bg-orange-100',
          textColor: 'text-orange-700',
          border: 'border-orange-200',
        };
    }
    return {
      label: 'Tốt',
      color: 'bg-green-100',
      textColor: 'text-green-700',
      border: 'border-green-200',
    };
  };

  // Find thresholds for parameters
  const phThreshold = findThreshold(WaterParameterType.PH_LEVEL);
  const tempThreshold = findThreshold(WaterParameterType.TEMPERATURE_CELSIUS);
  const oxygenThreshold = findThreshold(WaterParameterType.OXYGEN_LEVEL);
  const ammoniaThreshold = findThreshold(WaterParameterType.AMMONIA_LEVEL);
  const nitriteThreshold = findThreshold(WaterParameterType.NITRITE_LEVEL);
  const nitrateThreshold = findThreshold(WaterParameterType.NITRATE_LEVEL);
  const khThreshold = findThreshold(WaterParameterType.CARBON_HARDNESS);
  const waterLevelThreshold = findThreshold(
    WaterParameterType.WATER_LEVEL_METERS
  );

  const phStatus =
    record && typeof record.phLevel === 'number'
      ? evaluateAgainstThreshold(record.phLevel, phThreshold) ||
        getPhStatus(record.phLevel)
      : null;

  const tempStatus =
    record && typeof record.temperatureCelsius === 'number'
      ? evaluateAgainstThreshold(record.temperatureCelsius, tempThreshold) ||
        getTempStatus(record.temperatureCelsius)
      : null;

  // Default positive status used when no threshold exists
  const defaultGoodStatus = {
    label: 'Tốt',
    color: 'bg-green-100',
    textColor: 'text-green-700',
    border: 'border-green-200',
  };

  // Compute statuses for water-quality metrics, ensuring we always have a badge.
  const oxygenStatus =
    record && typeof record.oxygenLevel === 'number'
      ? evaluateAgainstThreshold(record.oxygenLevel, oxygenThreshold) ||
        defaultGoodStatus
      : null;

  // For ammonia/nitrite we keep previous simple heuristics as fallback if no thresholds
  const ammoniaWarning =
    record && typeof record.ammoniaLevel === 'number'
      ? record.ammoniaLevel > 0.05
      : false;
  const ammoniaStatus =
    record && typeof record.ammoniaLevel === 'number'
      ? evaluateAgainstThreshold(record.ammoniaLevel, ammoniaThreshold) ||
        (ammoniaWarning
          ? {
              label: 'Cảnh báo',
              color: 'bg-orange-100',
              textColor: 'text-orange-700',
              border: 'border-orange-200',
            }
          : defaultGoodStatus)
      : null;

  const nitriteWarning =
    record && typeof record.nitriteLevel === 'number'
      ? record.nitriteLevel > 0.1
      : false;
  const nitriteStatus =
    record && typeof record.nitriteLevel === 'number'
      ? evaluateAgainstThreshold(record.nitriteLevel, nitriteThreshold) ||
        (nitriteWarning
          ? {
              label: 'Cảnh báo',
              color: 'bg-orange-100',
              textColor: 'text-orange-700',
              border: 'border-orange-200',
            }
          : defaultGoodStatus)
      : null;

  const nitrateStatus =
    record && typeof record.nitrateLevel === 'number'
      ? evaluateAgainstThreshold(record.nitrateLevel, nitrateThreshold) ||
        defaultGoodStatus
      : null;

  const khStatus =
    record && typeof record.carbonHardness === 'number'
      ? evaluateAgainstThreshold(record.carbonHardness, khThreshold) ||
        defaultGoodStatus
      : null;

  const waterLevelStatus =
    record && typeof record.waterLevelMeters === 'number'
      ? evaluateAgainstThreshold(
          record.waterLevelMeters,
          waterLevelThreshold
        ) || defaultGoodStatus
      : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1" style={{ height: SCREEN_HEIGHT }}>
        <Pressable
          onPress={onClose}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          className="bg-black/50"
        />
        <View className="flex-1 justify-end">
          <View>
            <View
              className="overflow-hidden rounded-t-3xl bg-white"
              style={{ maxHeight: SCREEN_HEIGHT * 0.8 }}
            >
              {/* Header */}
              <View className="bg-primary px-5 py-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-medium text-white opacity-80">
                    THÔNG TIN BẢN GHI
                  </Text>
                  <Pressable
                    onPress={onClose}
                    className="h-8 w-8 items-center justify-center rounded-full bg-white/20"
                  >
                    <X size={18} color="white" />
                  </Pressable>
                </View>
                <View className="mt-2 flex-row items-center justify-between">
                  <Text className="text-2xl font-bold text-white">
                    Chi tiết đo lường
                  </Text>
                  {record && (
                    <Text className="mt-1 text-base text-white/90">
                      {formatDateSmart(record.recordedAt)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Content */}
              <ScrollView
                style={{ maxHeight: SCREEN_HEIGHT * 0.75 }}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingVertical: 20,
                  flexGrow: 1,
                }}
                keyboardShouldPersistTaps="handled"
              >
                {!record ? (
                  <View className="items-center py-8">
                    <Text className="text-sm text-gray-500">
                      Không có dữ liệu
                    </Text>
                  </View>
                ) : (
                  <View>
                    {/* Critical Parameters */}
                    <View>
                      <Text className="mb-3 text-base font-semibold uppercase tracking-wide text-gray-500">
                        Thông số quan trọng
                      </Text>

                      {/* pH Card */}
                      <View
                        className={`rounded-2xl border-2 ${phStatus?.border} mb-3 p-4 ${phStatus?.color}`}
                      >
                        <View className="mb-2 flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                              <FlaskConical size={18} color="white" />
                            </View>
                            <View>
                              <Text className="text-sm font-medium text-gray-600">
                                Độ pH
                              </Text>
                              <Text className="text-2xl font-bold text-gray-900">
                                {record.phLevel}
                              </Text>
                            </View>
                          </View>
                          {phStatus && (
                            <View
                              className={`rounded-full px-3 py-1 ${phStatus.color} border ${phStatus.border}`}
                            >
                              <Text
                                className={`text-sm font-semibold ${phStatus.textColor}`}
                              >
                                {phStatus.label}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Temperature Card */}
                      <View
                        className={`rounded-2xl border-2 ${tempStatus?.border} p-4 ${tempStatus?.color}`}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-red-500">
                              <Thermometer size={18} color="white" />
                            </View>
                            <View>
                              <Text className="text-sm font-medium text-gray-600">
                                Nhiệt độ
                              </Text>
                              <Text className="text-2xl font-bold text-gray-900">
                                {record.temperatureCelsius}°C
                              </Text>
                            </View>
                          </View>
                          {tempStatus && (
                            <View
                              className={`rounded-full px-3 py-1 ${tempStatus.color} border ${tempStatus.border}`}
                            >
                              <Text
                                className={`text-sm font-semibold ${tempStatus.textColor}`}
                              >
                                {tempStatus.label}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Water Quality Parameters */}
                    <View>
                      <Text className="mb-3 mt-4 text-base font-semibold uppercase tracking-wide text-gray-500">
                        Chất lượng nước
                      </Text>
                      <View className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                        {record.oxygenLevel !== undefined && (
                          <MetricRow
                            icon={<Droplet size={16} color="white" />}
                            label="Oxy hòa tan"
                            value={`${record.oxygenLevel} mg/L`}
                            iconBg="bg-cyan-500"
                            statusLabel={oxygenStatus?.label}
                            statusColor={oxygenStatus?.color}
                            statusTextColor={oxygenStatus?.textColor}
                          />
                        )}
                        {record.ammoniaLevel !== undefined && (
                          <MetricRow
                            icon={<AlertTriangle size={14} color="white" />}
                            label="Amoniac (NH₃)"
                            value={`${record.ammoniaLevel} mg/L`}
                            iconBg="bg-yellow-500"
                            statusLabel={ammoniaStatus?.label}
                            statusColor={ammoniaStatus?.color}
                            statusTextColor={ammoniaStatus?.textColor}
                          />
                        )}
                        {record.nitriteLevel !== undefined && (
                          <MetricRow
                            icon={<Microscope size={14} color="white" />}
                            label="Nitrit (NO₂)"
                            value={`${record.nitriteLevel} mg/L`}
                            iconBg="bg-purple-500"
                            statusLabel={nitriteStatus?.label}
                            statusColor={nitriteStatus?.color}
                            statusTextColor={nitriteStatus?.textColor}
                          />
                        )}
                        {record.nitrateLevel !== undefined && (
                          <MetricRow
                            icon={<TestTube size={14} color="white" />}
                            label="Nitrate (NO₃)"
                            value={`${record.nitrateLevel} mg/L`}
                            iconBg="bg-indigo-500"
                            statusLabel={nitrateStatus?.label}
                            statusColor={nitrateStatus?.color}
                            statusTextColor={nitrateStatus?.textColor}
                          />
                        )}
                        {record.carbonHardness !== undefined && (
                          <MetricRow
                            icon={<Ruler size={14} color="white" />}
                            label="Độ cứng cacbonat (KH)"
                            value={`${record.carbonHardness} °dH`}
                            iconBg="bg-gray-500"
                            statusLabel={khStatus?.label}
                            statusColor={khStatus?.color}
                            statusTextColor={khStatus?.textColor}
                            isLast
                          />
                        )}
                      </View>
                    </View>

                    {/* Other Information */}
                    {record.waterLevelMeters !== undefined && (
                      <View>
                        <Text className="mb-3 mt-4 text-base font-semibold uppercase tracking-wide text-gray-500">
                          Thông tin khác
                        </Text>
                        <View className="rounded-2xl border border-gray-200 bg-white p-4">
                          <View className="flex-row items-center">
                            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-400">
                              <Ruler size={18} color="white" />
                            </View>
                            <View className="w-[87%] flex-row items-center justify-between">
                              <View className="flex-col">
                                <Text className="text-sm font-medium text-gray-600">
                                  Mực nước
                                </Text>
                                <Text className="text-lg font-semibold text-gray-900">
                                  {record.waterLevelMeters} mét
                                </Text>
                              </View>
                              {waterLevelStatus && (
                                <View
                                  className={`${waterLevelStatus?.color ?? 'bg-gray-100'} ml-3 rounded-full border px-2 py-1 ${waterLevelStatus?.border ?? 'border-gray-200'}`}
                                >
                                  <Text
                                    className={`${waterLevelStatus?.textColor ?? 'text-gray-700'} text-sm font-semibold`}
                                  >
                                    {waterLevelStatus?.label}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Notes */}
                    {record.notes && (
                      <View>
                        <Text className="mb-3 mt-4 text-base font-semibold uppercase tracking-wide text-gray-500">
                          Ghi chú
                        </Text>
                        <View className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                          <View className="flex-row items-center">
                            <View className="mr-3">
                              <FileText size={20} color="#92400e" />
                            </View>
                            <Text className="flex-1 text-base leading-5">
                              {record.notes}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>

              {/* Footer */}
              <View className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                <Pressable
                  onPress={onClose}
                  className="w-full items-center rounded-2xl bg-primary px-4 py-4 active:bg-primary/90"
                >
                  <Text className="text-base font-semibold text-white">
                    Đóng
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function MetricRow({
  icon,
  label,
  value,
  iconBg,
  warning,
  isLast,
  statusLabel,
  statusColor,
  statusTextColor,
}: {
  icon: React.ReactElement;
  label: string;
  value: string;
  iconBg: string;
  warning?: boolean;
  isLast?: boolean;
  statusLabel?: string;
  statusColor?: string;
  statusTextColor?: string;
}) {
  return (
    <View
      className={`flex-row items-center p-4 ${!isLast ? 'border-b border-gray-100' : ''}`}
    >
      <View
        className={`h-9 w-9 rounded-full ${iconBg} mr-3 items-center justify-center`}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-gray-600">{label}</Text>
        <Text
          className={`text-base font-semibold ${warning ? 'text-orange-600' : 'text-gray-900'}`}
        >
          {value}
        </Text>
      </View>
      {statusLabel ? (
        <View
          className={`${statusColor ?? 'bg-gray-100'} rounded-full border px-2 py-1 ${statusColor === 'bg-green-100' ? 'border-green-200' : statusColor === 'bg-orange-100' ? 'border-orange-200' : 'border-red-200'}`}
        >
          <Text
            className={`${statusTextColor ?? 'text-gray-700'} text-sm font-semibold`}
          >
            {statusLabel}
          </Text>
        </View>
      ) : warning ? (
        <View className="rounded-full border border-orange-200 bg-orange-100 px-2 py-1">
          <Text className="text-xs font-semibold text-orange-600">!</Text>
        </View>
      ) : null}
    </View>
  );
}
