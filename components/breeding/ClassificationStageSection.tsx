import { useGetClassificationStageByBreedingProcessId } from '@/hooks/useClassificationStage';
import { useRouter } from 'expo-router';
import { Eye, Filter, Plus } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import ClassificationRecordsList, {
  useClassificationRecordsCount,
} from './ClassificationRecordsList';
import ClassificationStageInfo from './ClassificationStageInfo';

interface ClassificationStageSectionProps {
  breedingProcessId: number;
  onStartSelection: () => void;
}

export default function ClassificationStageSection({
  breedingProcessId,
  onStartSelection,
}: ClassificationStageSectionProps) {
  const router = useRouter();

  // Get classification stage to get the ID
  const classificationStageQuery = useGetClassificationStageByBreedingProcessId(
    breedingProcessId,
    !!breedingProcessId
  );

  const classificationStageId = classificationStageQuery.data?.id ?? 0;

  // Get count of classification records
  const { count: recordsCount, isLoading: recordsLoading } =
    useClassificationRecordsCount(
      classificationStageId,
      !!classificationStageId
    );

  // Determine button text based on records count
  const selectionButtonText =
    recordsCount === 0
      ? 'Tuyển chọn lần 1'
      : `Tuyển chọn lần ${recordsCount + 1}`;

  return (
    <View>
      <ClassificationStageInfo breedingProcessId={breedingProcessId} />

      <ClassificationRecordsList
        classificationStageId={classificationStageId}
      />

      {recordsCount >= 4 && (
        <View className="mt-3 flex-row justify-center">
          <Text className="mr-4 mt-1 text-sm text-black">
            Danh sách định danh
          </Text>
          <TouchableOpacity
            className="flex-row items-center rounded-lg border border-gray-300 px-3 py-1"
            onPress={() =>
              router.push(
                `/breeding/${breedingProcessId}/fish-list?redirect=/breeding`
              )
            }
          >
            <Eye size={16} color="black" />
            <Text className="ml-1 text-sm text-black">Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="mt-4 flex-row border-t border-gray-200 pt-2">
        {recordsCount >= 4 ? (
          <TouchableOpacity
            className="mr-2 flex-1 flex-row items-center justify-center rounded-lg bg-green-500 py-2"
            onPress={() =>
              router.push(
                `/breeding/${breedingProcessId}/fish-list?redirect=/breeding`
              )
            }
          >
            <Plus size={16} color="white" />
            <Text className="ml-2 font-medium text-white">Thêm cá</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="mr-2 flex-1 flex-row items-center justify-center rounded-lg bg-yellow-400 py-2"
            onPress={onStartSelection}
            disabled={recordsLoading}
          >
            <Filter size={16} color="white" />
            <Text className="ml-2 font-medium text-white">
              {recordsLoading ? 'Đang tải...' : selectionButtonText}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center rounded-lg border border-gray-200 py-2"
          onPress={() => router.push(`/breeding/${breedingProcessId}`)}
        >
          <Eye size={16} color="#6b7280" />
          <Text className="ml-2 text-gray-700">Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
