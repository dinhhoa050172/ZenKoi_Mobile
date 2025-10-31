import { useGetEggBatchByBreedingProcessId } from '@/hooks/useEggBatch';
import { useGetIncubationDailyRecordSummaryByEggBatchId } from '@/hooks/useIncubationDailyRecord';
import { Text, View } from 'react-native';

interface IncubationSummaryProps {
  breedingProcessId: number;
}

export default function IncubationSummary({
  breedingProcessId,
}: IncubationSummaryProps) {
  // Get egg batch for this breeding process
  const eggBatchQuery = useGetEggBatchByBreedingProcessId(
    breedingProcessId,
    !!breedingProcessId
  );

  // Get incubation summary
  const summaryQuery = useGetIncubationDailyRecordSummaryByEggBatchId(
    eggBatchQuery.data?.id ?? 0,
    !!eggBatchQuery.data?.id
  );

  if (summaryQuery.isLoading || eggBatchQuery.isLoading) {
    return (
      <View className="mt-3">
        <View className="flex-row justify-between">
          <View className="mr-2 flex-1 items-center rounded bg-gray-50 p-3">
            <Text className="text-sm font-medium text-gray-500">
              Đang tải...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const summary = summaryQuery.data;
  const totalEggs = eggBatchQuery.data?.quantity ?? 0;
  const totalHatched = summary?.totalHatchedEggs ?? 0;
  const totalRotten = summary?.totalRottenEggs ?? 0;
  const healthyEggs = totalEggs - totalHatched - totalRotten;

  return (
    <View className="mt-3">
      <View className="flex-row justify-between">
        <View className="mr-2 flex-1 items-center rounded bg-green-50 p-3">
          <Text className="text-sm font-medium text-green-700">Khỏe</Text>
          <Text className="text-xl font-bold text-green-700">
            {healthyEggs >= 0 ? healthyEggs : '—'}
          </Text>
        </View>
        <View className="mr-2 flex-1 items-center rounded bg-orange-50 p-3">
          <Text className="text-sm font-medium text-orange-600">Hỏng</Text>
          <Text className="text-xl font-bold text-orange-600">
            {totalRotten ?? '—'}
          </Text>
        </View>
        <View className="flex-1 items-center rounded bg-purple-50 p-3">
          <Text className="text-sm font-medium text-purple-600">Đã nở</Text>
          <Text className="text-xl font-bold text-purple-600">
            {totalHatched ?? '—'}
          </Text>
        </View>
      </View>
    </View>
  );
}
