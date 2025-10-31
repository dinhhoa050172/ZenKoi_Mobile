import {
  useGetFryFishByBreedingProcessId,
  useGetFryFishSummaryByFryFishId,
} from '@/hooks/useFryFish';
import React from 'react';
import { Text, View } from 'react-native';

interface FryFishSummaryProps {
  breedingProcessId: number;
}

export default function FryFishSummary({
  breedingProcessId,
}: FryFishSummaryProps) {
  // First get the fry fish to get its ID
  const fryFishQuery = useGetFryFishByBreedingProcessId(
    breedingProcessId,
    !!breedingProcessId
  );

  // Then get the summary using the fry fish ID
  const summaryQuery = useGetFryFishSummaryByFryFishId(
    fryFishQuery.data?.id ?? 0,
    !!fryFishQuery.data?.id
  );

  if (fryFishQuery.isLoading || summaryQuery.isLoading) {
    return (
      <View className="mt-3 rounded-lg border border-gray-100 bg-white p-3">
        <Text className="text-center text-sm text-gray-500">
          Đang tải thông tin...
        </Text>
      </View>
    );
  }

  if (fryFishQuery.error || summaryQuery.error || !summaryQuery.data) {
    return null; // Don't show anything if there's an error
  }

  const summary = summaryQuery.data;

  return (
    <View className="mt-3 rounded-lg border border-gray-100 bg-white p-3">
      <View className="mb-2 flex-row">
        <Text className="flex-1 text-center text-sm text-pink-600">7 ngày</Text>
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
          {summary.survivalRate7Days !== null
            ? `${summary.survivalRate7Days.toFixed(0)}%`
            : '—'}
        </Text>
        <Text className="flex-1 text-center text-sm text-gray-900">
          {summary.survivalRate14Days !== null
            ? `${summary.survivalRate14Days.toFixed(0)}%`
            : '—'}
        </Text>
        <Text className="flex-1 text-center text-sm text-gray-900">
          {summary.survivalRate30Days !== null
            ? `${summary.survivalRate30Days.toFixed(0)}%`
            : '—'}
        </Text>
        <Text className="flex-1 text-center text-sm text-gray-900">
          {summary.currentRate !== null
            ? `${summary.currentRate.toFixed(0)}%`
            : '—'}
        </Text>
      </View>
    </View>
  );
}
