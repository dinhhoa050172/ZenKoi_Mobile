import type { WaterQualityRecord } from '@/lib/api/services/fetchPond';
import { router } from 'expo-router';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Droplet,
  FileText,
  FlaskConical,
  Gauge,
  Microscope,
  Ruler,
  TestTube,
  Thermometer,
} from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface WaterParametersProps {
  pondId: number;
  isExpanded: boolean;
  onToggle: () => void;
  record?: WaterQualityRecord | null;
}

export default function WaterParameters({
  pondId,
  isExpanded,
  onToggle,
  record,
}: WaterParametersProps) {
  return (
    <View className="mb-4 rounded-2xl bg-white shadow-sm">
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between p-4"
      >
        <Text className="text-lg font-semibold text-gray-900">
          Thông số nước
        </Text>
        {isExpanded ? (
          <ChevronUp size={20} color="#6b7280" />
        ) : (
          <ChevronDown size={20} color="#6b7280" />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View className="px-4 pb-4">
          {/* Use flex-wrap with half-width items so RN renders two columns reliably */}
          <View className="-mx-2 flex-row flex-wrap">
            {/* pH */}
            <View className="mb-3 w-1/2 px-2">
              <View className="relative rounded-2xl bg-gray-50 p-3">
                <View className="mb-2 flex-row items-center">
                  <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <FlaskConical size={16} color="#3b82f6" />
                  </View>
                  <Text className="text-sm text-gray-600">Độ pH</Text>
                </View>
                <Text className="text-lg font-bold">
                  {record?.phLevel ?? '--'}
                </Text>
              </View>
            </View>

            {/* Water level */}
            <View className="mb-3 w-1/2 px-2">
              <View className="relative rounded-2xl bg-gray-50 p-3">
                <View className="mb-2 flex-row items-center">
                  <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-sky-100">
                    <Droplet size={16} color="#06b6d4" />
                  </View>
                  <Text className="text-sm text-gray-600">Mực nước (m)</Text>
                </View>
                <Text className="text-lg font-bold">
                  {record?.waterLevelMeters ?? '--'} m
                </Text>
              </View>
            </View>

            {/* Temperature */}
            <View className="mb-3 w-1/2 px-2">
              <View className="relative rounded-2xl bg-gray-50 p-3">
                <View className="mb-2 flex-row items-center">
                  <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                    <Thermometer size={16} color="#f97316" />
                  </View>
                  <Text className="text-sm text-gray-600">Nhiệt độ</Text>
                </View>
                <Text className="text-lg font-bold">
                  {record?.temperatureCelsius ?? '--'} °C
                </Text>
              </View>
            </View>

            {/* Oxygen */}
            <View className="mb-3 w-1/2 px-2">
              <View className="relative rounded-2xl bg-gray-50 p-3">
                <View className="mb-2 flex-row items-center">
                  <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                    <Gauge size={16} color="#10b981" />
                  </View>
                  <Text className="text-sm text-gray-600">Oxy hòa tan</Text>
                </View>
                <Text className="text-lg font-bold">
                  {record?.oxygenLevel ?? '--'} mg/L
                </Text>
              </View>
            </View>

            {/* Ammonia */}
            <View className="mb-3 w-1/2 px-2">
              <View className="relative rounded-2xl bg-gray-50 p-3">
                <View className="mb-2 flex-row items-center">
                  <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                    <AlertTriangle size={16} color="#eab308" />
                  </View>
                  <Text className="text-sm text-gray-600">Amoniac - NH₃</Text>
                </View>
                <Text className="text-lg font-bold">
                  {record?.ammoniaLevel ?? '--'} mg/L
                </Text>
              </View>
            </View>

            {/* Nitrite */}
            <View className="mb-3 w-1/2 px-2">
              <View className="relative rounded-2xl bg-gray-50 p-3">
                <View className="mb-2 flex-row items-center">
                  <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-violet-100">
                    <Microscope size={16} color="#8b5cf6" />
                  </View>
                  <Text className="text-sm text-gray-600">Nitrit - NO₂</Text>
                </View>
                <Text className="text-lg font-bold">
                  {record?.nitriteLevel ?? '--'} mg/L
                </Text>
              </View>
            </View>

            {/* Nitrate */}
            <View className="mb-3 w-1/2 px-2">
              <View className="relative rounded-2xl bg-gray-50 p-3">
                <View className="mb-2 flex-row items-center">
                  <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                    <TestTube size={16} color="#6366f1" />
                  </View>
                  <Text className="text-sm text-gray-600">Nitrate - NO₃</Text>
                </View>
                <Text className="text-lg font-bold">
                  {record?.nitrateLevel ?? '--'} mg/L
                </Text>
              </View>
            </View>

            {/* Carbon hardness */}
            <View className="mb-3 w-1/2 px-2">
              <View className="relative rounded-2xl bg-gray-50 p-3">
                <View className="mb-2 flex-row items-center">
                  <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                    <Ruler size={16} color="#6b7280" />
                  </View>
                  <Text className="text-sm text-gray-600">Độ cứng - KH</Text>
                </View>
                <Text className="text-lg font-bold">
                  {record?.carbonHardness ?? '--'} °dH
                </Text>
              </View>
            </View>

            {/* Notes (span full width) */}
            {record?.notes ? (
              <View className="w-full px-2">
                <View className="rounded-2xl bg-gray-50 p-3">
                  <View className="mb-2 flex-row items-center">
                    <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                      <FileText size={16} color="#f59e0b" />
                    </View>
                    <Text className="text-sm text-gray-600">Ghi chú</Text>
                  </View>
                  <Text className="mt-1 text-sm text-gray-700">
                    {record.notes}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Action button span full width */}
            <View className="w-full px-2">
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    `/water/create-record?pondId=${pondId}&redirect=pondDetail&redirectId=${pondId}`
                  )
                }
                className="mt-4 rounded-2xl bg-primary py-3"
              >
                <Text className="text-center font-medium text-white">
                  Ghi lại dữ liệu của hồ
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
