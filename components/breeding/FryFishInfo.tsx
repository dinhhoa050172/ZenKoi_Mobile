import { useGetFryFishByBreedingProcessId } from '@/hooks/useFryFish';
import { useGetFrySurvivalRecords } from '@/hooks/useFrySurvivalRecord';
import { formatDate } from '@/lib/utils/formatDate';
import React from 'react';
import { Text, View } from 'react-native';

interface FryFishInfoProps {
  breedingProcessId: number;
  startDate?: string;
}

export default function FryFishInfo({
  breedingProcessId,
  startDate,
}: FryFishInfoProps) {
  const fryFishQuery = useGetFryFishByBreedingProcessId(
    breedingProcessId,
    !!breedingProcessId
  );

  // Get fry survival records for this fry fish
  const frySurvivalRecordsQuery = useGetFrySurvivalRecords(
    {
      fryFishId: fryFishQuery.data?.id,
      pageIndex: 1,
      pageSize: 100,
    },
    !!fryFishQuery.data?.id
  );

  if (fryFishQuery.isLoading) {
    return (
      <View className="rounded-lg bg-gray-50 p-3">
        <Text className="text-sm text-gray-600">
          Đang tải thông tin cá bột...
        </Text>
      </View>
    );
  }

  const initialCount = fryFishQuery.data?.initialCount ?? 0;

  // Get the last survival record if exists
  const survivalRecords = frySurvivalRecordsQuery.data?.data ?? [];
  const lastRecord =
    survivalRecords.length > 0
      ? survivalRecords[survivalRecords.length - 1]
      : null;

  // Use countAlive from last record if exists, otherwise use initialCount
  const currentCount = lastRecord ? lastRecord.countAlive : initialCount;

  return (
    <View className="rounded-lg bg-gray-50 p-3">
      <Text className="text-sm text-gray-600">
        Số lượng cá bột:{' '}
        <Text className="font-semibold text-gray-900">{currentCount} con</Text>
      </Text>
      <Text className="mt-2 text-sm text-gray-600">
        Bắt đầu:{' '}
        <Text className="font-semibold text-gray-900">
          {formatDate(startDate, 'dd/MM/yyyy')}
        </Text>
      </Text>
    </View>
  );
}
