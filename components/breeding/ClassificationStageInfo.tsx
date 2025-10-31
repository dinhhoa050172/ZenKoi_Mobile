import { useGetClassificationRecordSummary } from '@/hooks/useClassificationRecord';
import { useGetClassificationStageByBreedingProcessId } from '@/hooks/useClassificationStage';
import { ClassificationStatus } from '@/lib/api/services/fetchClassificationStage';
import React from 'react';
import { Text, View } from 'react-native';

interface ClassificationStageInfoProps {
  breedingProcessId: number;
}

// Helper function to translate classification status
const getClassificationStatusText = (status: ClassificationStatus) => {
  switch (status) {
    case ClassificationStatus.PREPARING:
      return 'Đang chuẩn bị';
    case ClassificationStatus.STAGE1:
      return 'Giai đoạn 1';
    case ClassificationStatus.STAGE2:
      return 'Giai đoạn 2';
    case ClassificationStatus.STAGE3:
      return 'Giai đoạn 3';
    case ClassificationStatus.STAGE4:
      return 'Giai đoạn 4';
    case ClassificationStatus.SUCCESS:
      return 'Thành công';
    default:
      return status;
  }
};

export default function ClassificationStageInfo({
  breedingProcessId,
}: ClassificationStageInfoProps) {
  const classificationStageQuery = useGetClassificationStageByBreedingProcessId(
    breedingProcessId,
    !!breedingProcessId
  );

  // Get summary data based on classification stage ID
  const summaryQuery = useGetClassificationRecordSummary(
    classificationStageQuery.data?.id || 0,
    !!classificationStageQuery.data?.id
  );

  if (classificationStageQuery.isLoading) {
    return (
      <View className="rounded-lg bg-gray-50 p-3">
        <Text className="text-center text-sm text-gray-500">Đang tải...</Text>
      </View>
    );
  }

  if (classificationStageQuery.error || !classificationStageQuery.data) {
    return (
      <View className="rounded-lg bg-gray-50 p-3">
        <Text className="text-sm text-gray-600">
          Chưa có thông tin giai đoạn tuyển chọn
        </Text>
      </View>
    );
  }

  const stage = classificationStageQuery.data;
  const summary = summaryQuery.data;

  return (
    <View className="rounded-lg bg-gray-50 p-3">
      <Text className="text-sm text-gray-600">
        Trạng thái:{' '}
        <Text className="font-semibold text-gray-900">
          {getClassificationStatusText(stage.status)}
        </Text>
      </Text>

      {summaryQuery.isLoading ? (
        <Text className="mt-2 text-center text-sm text-gray-500">
          Đang tải thống kê...
        </Text>
      ) : summary ? (
        <>
          <Text className="mt-2 text-sm text-gray-600">
            Số cá hiện tại:{' '}
            <Text className="font-semibold text-gray-900">
              {summary.currentFish?.toLocaleString() || 0} con
            </Text>
          </Text>
          <View className="mt-2 flex-row flex-wrap justify-between">
            <Text className="mb-1 text-xs text-gray-600">
              Show:{' '}
              <Text className="font-semibold text-green-600">
                {summary.totalShowQualified ?? 0}
              </Text>
            </Text>
            <Text className="mb-1 text-xs text-gray-600">
              High:{' '}
              <Text className="font-semibold text-blue-600">
                {summary.totalHighQualified ?? 0}
              </Text>
            </Text>
            <Text className="mb-1 text-xs text-gray-600">
              Pond:{' '}
              <Text className="font-semibold text-yellow-600">
                {summary.totalPondQualified ?? 0}
              </Text>
            </Text>
            <Text className="mb-1 text-xs text-gray-600">
              Cull:{' '}
              <Text className="font-semibold text-red-600">
                {summary.totalCullQualified ?? 0}
              </Text>
            </Text>
          </View>
        </>
      ) : (
        <Text className="mt-2 text-sm text-gray-600">
          Chưa có dữ liệu thống kê
        </Text>
      )}

      {stage.notes && (
        <Text className="mt-2 text-sm text-gray-600">
          Ghi chú:{' '}
          <Text className="font-semibold text-gray-900">{stage.notes}</Text>
        </Text>
      )}
    </View>
  );
}
