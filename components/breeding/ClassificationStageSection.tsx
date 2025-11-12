import { useGetClassificationStageByBreedingProcessId } from '@/hooks/useClassificationStage';
import { useGetPondPacketFishes } from '@/hooks/usePondPacketFish';
import { useRouter } from 'expo-router';
import { Edit, Eye, Filter, List, Package, Plus } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import ClassificationRecordsList, {
  useClassificationRecordsCount,
} from './ClassificationRecordsList';
import ClassificationStageInfo from './ClassificationStageInfo';

interface ClassificationStageSectionProps {
  breedingProcessId: number;
  onStartSelection: () => void;
  onCreatePacket?: (breedingProcessId: number) => void;
  onEditPacket?: (breedingProcessId: number, packetFishId: number) => void;
}

export default function ClassificationStageSection({
  breedingProcessId,
  onStartSelection,
  onCreatePacket,
  onEditPacket,
}: ClassificationStageSectionProps) {
  const router = useRouter();

  const pondPacketQuery = useGetPondPacketFishes(
    { breedingProcessId: breedingProcessId, pageIndex: 1, pageSize: 1 },
    !!breedingProcessId
  );

  const pondPackets = pondPacketQuery.data?.data ?? [];
  const hasPondPacket = pondPackets.length > 0;
  const existingPacketFishId: number | undefined = pondPackets[0]
    ? ((pondPackets[0] as any).packetFishId ??
      (pondPackets[0] as any).packetFish?.id)
    : undefined;

  const classificationStageQuery = useGetClassificationStageByBreedingProcessId(
    breedingProcessId,
    !!breedingProcessId
  );

  const classificationStageId = classificationStageQuery.data?.id ?? 0;

  const { count: recordsCount, isLoading: recordsLoading } =
    useClassificationRecordsCount(
      classificationStageId,
      !!classificationStageId
    );

  const selectionButtonText =
    recordsCount === 0
      ? 'Tuyển chọn lần 1'
      : `Tuyển chọn lần ${recordsCount + 1}`;

  return (
    <View>
      {/* Classification Stage Info Card */}
      <ClassificationStageInfo breedingProcessId={breedingProcessId} />

      {/* Classification Records List */}
      <ClassificationRecordsList
        classificationStageId={classificationStageId}
      />

      {/* Fish List Link (appears after 4 rounds) */}
      {recordsCount >= 4 && (
        <View className="mt-3 flex-row items-center justify-between gap-2">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center rounded-2xl border-2 border-indigo-200 bg-indigo-50 py-3"
            onPress={() =>
              router.push(
                `/breeding/${breedingProcessId}/fish-list?redirect=/breeding`
              )
            }
          >
            <List size={18} color="#6366f1" />
            <Text className="ml-2 text-sm font-semibold text-indigo-700">
              Xem danh sách định danh
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="h-12 w-12 items-center justify-center rounded-2xl border border-gray-200"
            onPress={() => router.push(`/breeding/${breedingProcessId}`)}
          >
            <Eye size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons */}
      <View className="mt-3 flex-row gap-2">
        {recordsCount >= 4 ? (
          // After 4 rounds - Show Add Fish & Packet Management
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="w-[50%] flex-row items-center justify-center  rounded-2xl bg-green-600 py-3"
              onPress={() =>
                router.push(
                  `/breeding/${breedingProcessId}/fish-list?redirect=/breeding`
                )
              }
            >
              <Plus size={18} color="white" />
              <Text className="ml-2 font-semibold text-white">Thêm cá</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-[48%] flex-row items-center justify-center  rounded-2xl bg-indigo-600 py-3"
              onPress={() => {
                if (hasPondPacket && existingPacketFishId) {
                  if (onEditPacket)
                    return onEditPacket(
                      breedingProcessId,
                      existingPacketFishId
                    );
                  return router.push(`/breeding/${breedingProcessId}`);
                }
                if (onCreatePacket) return onCreatePacket(breedingProcessId);
                return router.push(`/breeding/${breedingProcessId}`);
              }}
              disabled={!classificationStageId}
            >
              {hasPondPacket ? (
                <>
                  <Edit size={18} color="#fff" />
                  <Text className="ml-2 font-semibold text-white">
                    Sửa lô cá
                  </Text>
                </>
              ) : (
                <>
                  <Package size={18} color="#fff" />
                  <Text className="ml-2 font-semibold text-white">
                    Tạo lô cá
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="w-[85%] flex-row items-center justify-center rounded-2xl bg-yellow-500 py-3"
              onPress={onStartSelection}
              disabled={recordsLoading}
            >
              <Filter size={18} color="white" />
              <Text className="ml-2 font-semibold text-white">
                {recordsLoading ? 'Đang tải...' : selectionButtonText}
              </Text>
            </TouchableOpacity>

            {/* Detail Button - Always shown */}
            <TouchableOpacity
              className="h-12 w-12 items-center justify-center rounded-2xl border border-gray-200"
              onPress={() => router.push(`/breeding/${breedingProcessId}`)}
            >
              <Eye size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
