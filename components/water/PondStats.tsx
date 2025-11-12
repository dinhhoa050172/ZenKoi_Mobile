import { Pond, PondStatus } from '@/lib/api/services/fetchPond';
import React from 'react';
import { Text, View } from 'react-native';

interface PondStatsProps {
  ponds: Pond[];
  isLoading?: boolean;
}

export default function PondStats({ ponds, isLoading }: PondStatsProps) {
  // const totalPonds = ponds.length;
  const activePonds = ponds.filter(
    (pond) => pond.pondStatus === PondStatus.ACTIVE
  ).length;
  const maintenancePonds = ponds.filter(
    (pond) => pond.pondStatus === PondStatus.MAINTENANCE
  ).length;
  const emptyPonds = ponds.filter(
    (pond) => pond.pondStatus === PondStatus.EMPTY
  ).length;

  if (isLoading) {
    return (
      <View className="mb-4 mt-2 flex-row">
        {[1, 2, 3].map((index) => (
          <View
            key={index}
            className="mx-1 flex-1 items-center rounded-2xl bg-white p-4 shadow-sm"
          >
            <View className="mb-1 h-6 w-8 rounded bg-gray-200" />
            <View className="h-4 w-16 rounded bg-gray-200" />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="mb-4 mt-2 flex-row">
      <View className="mr-2 flex-1 items-center rounded-2xl bg-white p-4 shadow-sm">
        <Text className="text-2xl font-bold text-green-600">{activePonds}</Text>
        <Text className="text-sm text-gray-600">Hoạt động</Text>
      </View>
      <View className="mr-2 flex-1 items-center rounded-2xl bg-white p-4 shadow-sm">
        <Text className="text-2xl font-bold text-primary">{emptyPonds}</Text>
        <Text className="text-sm text-gray-600">Hồ trống</Text>
      </View>
      <View className="flex-1 items-center rounded-2xl bg-white p-4 shadow-sm">
        <Text className="text-2xl font-bold text-yellow-600">
          {maintenancePonds}
        </Text>
        <Text className="text-sm text-gray-600">Bảo trì</Text>
      </View>
    </View>
  );
}
