import {
  useCreateClassificationRecordV1,
  useCreateClassificationRecordV2,
  useCreateClassificationRecordV3,
  useGetClassificationRecords,
  useGetClassificationRecordSummary,
} from '@/hooks/useClassificationRecord';
import { useGetClassificationStageByBreedingProcessId } from '@/hooks/useClassificationStage';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { AlertCircle, CheckCircle2, FileText, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';
import { CustomAlert } from '../CustomAlert';
import FishSvg from '../icons/FishSvg';

interface SelectionModalProps {
  visible: boolean;
  onClose: () => void;
  breedingId: number | null;
}

export function SelectionModal({
  visible,
  onClose,
  breedingId,
}: SelectionModalProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [selectionCount, setSelectionCount] = useState('');
  const [selectionNote, setSelectionNote] = useState('');
  const [selectionError, setSelectionError] = useState('');
  const [showFishIdentificationAlert, setShowFishIdentificationAlert] =
    useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const classificationStageQuery = useGetClassificationStageByBreedingProcessId(
    breedingId ?? 0,
    !!breedingId && !!visible
  );

  const classificationRecordsQuery = useGetClassificationRecords(
    {
      classificationStageId: classificationStageQuery.data?.id,
      pageIndex: 1,
      pageSize: 100,
    },
    !!classificationStageQuery.data?.id && !!visible
  );

  const classificationSummaryQuery = useGetClassificationRecordSummary(
    classificationStageQuery.data?.id ?? 0,
    !!classificationStageQuery.data?.id &&
      !!visible &&
      (classificationRecordsQuery.data?.data?.length ?? 0) >= 1
  );

  const createClassificationV1 = useCreateClassificationRecordV1();
  const createClassificationV2 = useCreateClassificationRecordV2();
  const createClassificationV3 = useCreateClassificationRecordV3();

  const recordsCount = classificationRecordsQuery.data?.data?.length ?? 0;
  const currentRound = recordsCount + 1;

  const resetModal = () => {
    setSelectionCount('');
    setSelectionNote('');
    setSelectionError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // When modal opens, refetch latest stage/records/summary
  useEffect(() => {
    if (!visible) return;

    let mounted = true;
    (async () => {
      // Refetch stage first
      const res = await classificationStageQuery.refetch();
      const stageId = res?.data?.id ?? classificationStageQuery.data?.id;

      // If we have a stage, refetch records and summary
      if (mounted && stageId) {
        await classificationRecordsQuery.refetch();
        await classificationSummaryQuery.refetch();
      }
    })();

    return () => {
      mounted = false;
    };
  }, [
    visible,
    breedingId,
    classificationStageQuery,
    classificationRecordsQuery,
    classificationSummaryQuery,
  ]);

  const handleSave = async () => {
    if (
      createClassificationV1.status === 'pending' ||
      createClassificationV2.status === 'pending' ||
      createClassificationV3.status === 'pending'
    )
      return;

    setSelectionError('');
    const count =
      selectionCount.trim() === '' ? NaN : parseInt(selectionCount, 10);

    if (!Number.isFinite(count) || count <= 0) {
      setSelectionError('Vui lòng nhập số lượng hợp lệ');
      return;
    }

    const classificationStage = classificationStageQuery.data;
    if (!classificationStage || !classificationStage.id) {
      setErrorMessage('Không tìm thấy giai đoạn tuyển chọn');
      setShowErrorAlert(true);
      return;
    }

    try {
      let isLastSelection = false;

      if (recordsCount === 0 || recordsCount === 1) {
        // Lần 1 & 2: createClassificationV1 with cullQualifiedCount
        await createClassificationV1.mutateAsync({
          classificationStageId: classificationStage.id,
          cullQualifiedCount: count,
          notes: selectionNote.trim() || '',
        });
      } else if (recordsCount === 2) {
        // Lần 3: createClassificationV2 with highQualifiedCount
        await createClassificationV2.mutateAsync({
          classificationStageId: classificationStage.id,
          highQualifiedCount: count,
          notes: selectionNote.trim() || '',
        });
      } else {
        // Lần 4: createClassificationV3 with showQualifiedCount
        await createClassificationV3.mutateAsync({
          classificationStageId: classificationStage.id,
          showQualifiedCount: count,
          notes: selectionNote.trim() || '',
        });
        isLastSelection = true;
      }

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã tạo bản ghi tuyển chọn!',
      });

      queryClient.invalidateQueries({ queryKey: ['breedingProcesses'] });
      queryClient.invalidateQueries({ queryKey: ['classificationStage'] });
      queryClient.invalidateQueries({ queryKey: ['classificationRecords'] });
      queryClient.invalidateQueries({ queryKey: ['classificationSummary'] });
      handleClose();

      if (isLastSelection) {
        setTimeout(() => {
          setShowFishIdentificationAlert(true);
        }, 500);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Không thể tạo bản ghi tuyển chọn');
      setShowErrorAlert(true);
    }
  };

  // Get label and color based on round
  const getSelectionInfo = (round: number) => {
    switch (round) {
      case 1:
      case 2:
        return {
          label: 'Số lượng cá không đạt chuẩn (Cull)',
          placeholder: 'Nhập số lượng cá Cull',
          color: '#ef4444',
          bgColor: '#fef2f2',
          icon: '🗑️',
        };
      case 3:
        return {
          label: 'Số lượng cá High',
          placeholder: 'Nhập số lượng cá High',
          color: '#3b82f6',
          bgColor: '#eff6ff',
          icon: '⭐',
        };
      case 4:
        return {
          label: 'Số lượng cá Show',
          placeholder: 'Nhập số lượng cá Show',
          color: '#10b981',
          bgColor: '#f0fdf4',
          icon: '🏆',
        };
      default:
        return {
          label: 'Số lượng cá',
          placeholder: 'Nhập số lượng',
          color: '#6b7280',
          bgColor: '#f9fafb',
          icon: '🐟',
        };
    }
  };

  const selectionInfo = getSelectionInfo(currentRound);
  const isLoading =
    createClassificationV1.status === 'pending' ||
    createClassificationV2.status === 'pending' ||
    createClassificationV3.status === 'pending';

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-4">
          <View
            className="w-full max-w-md flex-1 rounded-3xl bg-white shadow-2xl"
            style={{ maxHeight: '77%' }}
          >
            {/* Header */}
            <View className="items-center border-b border-gray-100 px-6 py-4">
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                <FishSvg size={24} color="#6366f1" />
              </View>
              <Text className="text-xl font-bold text-gray-900">
                Tuyển chọn cá
              </Text>
              <Text className="mt-1 text-base text-gray-500">
                Lần {currentRound}/4
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                className="absolute right-4 top-4 rounded-full bg-gray-100 p-2"
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <KeyboardAwareScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 24 }}
              showsVerticalScrollIndicator={false}
              bottomOffset={20}
              keyboardShouldPersistTaps="handled"
            >
              {classificationStageQuery.isLoading ? (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" color="#6366f1" />
                  <Text className="mt-3 text-sm text-gray-500">
                    Đang tải thông tin...
                  </Text>
                </View>
              ) : classificationStageQuery.error ? (
                <View className="items-center rounded-2xl bg-red-50 p-6">
                  <AlertCircle size={32} color="#ef4444" />
                  <Text className="mt-3 text-center text-base text-red-600">
                    Không thể tải thông tin giai đoạn tuyển chọn
                  </Text>
                </View>
              ) : classificationStageQuery.data ? (
                <>
                  {/* Current Stage Info */}
                  <View className="mb-4 overflow-hidden rounded-2xl border border-indigo-200 bg-indigo-50">
                    <View className="flex-row items-center border-b border-indigo-100 bg-indigo-100 px-4 py-2">
                      <Text className="text-base font-semibold uppercase tracking-wide text-indigo-700">
                        Giai đoạn hiện tại
                      </Text>
                    </View>
                    <View className="p-4">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-gray-700">
                          Lần tuyển chọn
                        </Text>
                        <View className="rounded-full bg-indigo-600 px-3 py-1">
                          <Text className="text-base font-bold text-white">
                            Lần {currentRound}
                          </Text>
                        </View>
                      </View>
                      <View className="mt-2 flex-row items-center justify-between">
                        <Text className="text-base text-gray-700">
                          Tổng số cá
                        </Text>
                        <Text className="text-lg font-bold text-indigo-600">
                          {(
                            classificationStageQuery.data.totalCount ?? 0
                          ).toLocaleString()}{' '}
                          con
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Previous Selections Summary */}
                  {recordsCount > 0 && (
                    <View className="mb-4 overflow-hidden rounded-2xl border border-green-200 bg-green-50">
                      <View className="flex-row items-center border-b border-green-100 bg-green-100 px-4 py-2">
                        <CheckCircle2 size={14} color="#10b981" />
                        <Text className="ml-2 text-xs font-semibold uppercase tracking-wide text-green-700">
                          Đã hoàn thành {recordsCount} lần
                        </Text>
                      </View>
                      <View className="p-4">
                        {classificationSummaryQuery.isLoading ? (
                          <ActivityIndicator size="small" color="#10b981" />
                        ) : classificationSummaryQuery.data ? (
                          <>
                            {recordsCount < 3 ? (
                              <View className="flex-row items-center justify-between">
                                <Text className="text-sm text-gray-700">
                                  Số cá còn lại
                                </Text>
                                <Text className="text-lg font-bold text-green-600">
                                  {(
                                    classificationSummaryQuery.data
                                      .currentFish ?? 0
                                  ).toLocaleString()}{' '}
                                  con
                                </Text>
                              </View>
                            ) : (
                              <View className="flex-row items-center justify-between">
                                <Text className="text-sm text-gray-700">
                                  Số cá High hiện tại
                                </Text>
                                <Text className="text-lg font-bold text-blue-600">
                                  {(
                                    classificationSummaryQuery.data
                                      .totalHighQualified ?? 0
                                  ).toLocaleString()}{' '}
                                  con
                                </Text>
                              </View>
                            )}
                          </>
                        ) : null}
                      </View>
                    </View>
                  )}

                  {/* Input Section */}
                  <View className="mb-4 overflow-hidden rounded-2xl border-2 border-gray-200 bg-white">
                    <View
                      className="flex-row items-center px-4 py-3"
                      style={{ backgroundColor: selectionInfo.bgColor }}
                    >
                      <Text className="mr-2 text-2xl">
                        {selectionInfo.icon}
                      </Text>
                      <View className="flex-1">
                        <Text
                          className="text-base font-semibold"
                          style={{ color: selectionInfo.color }}
                        >
                          {selectionInfo.label}
                        </Text>
                        <Text className="text-base text-gray-500">
                          Bắt buộc nhập
                        </Text>
                      </View>
                    </View>
                    <View className="p-4">
                      <TextInput
                        className=" rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base font-semibold text-gray-900"
                        value={selectionCount}
                        onChangeText={(t) => {
                          setSelectionCount(t.replace(/[^0-9]/g, ''));
                          if (selectionError) setSelectionError('');
                        }}
                        placeholder={selectionInfo.placeholder}
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        style={selectionError ? { borderColor: '#ef4444' } : {}}
                      />
                      {selectionError ? (
                        <View className="mt-2 flex-row items-center">
                          <AlertCircle size={14} color="#ef4444" />
                          <Text className="ml-1 text-sm text-red-500">
                            {selectionError}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {/* Notes Section */}
                  <View className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <View className="flex-row items-center border-b border-gray-100 px-4 py-2">
                      <FileText size={20} color="#64748b" />
                      <Text className="ml-2 text-base font-semibold uppercase tracking-wide text-gray-600">
                        Ghi chú
                      </Text>
                    </View>
                    <View className="p-4">
                      <TextInput
                        className=" rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
                        value={selectionNote}
                        onChangeText={setSelectionNote}
                        placeholder="Thêm ghi chú (không bắt buộc)"
                        placeholderTextColor="#9ca3af"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>
                  </View>
                </>
              ) : null}
            </KeyboardAwareScrollView>

            {/* Footer Actions */}
            <View className="flex-row gap-3 border-t border-gray-100 p-4">
              <TouchableOpacity
                className="flex-1 items-center justify-center  rounded-2xl border-2 border-gray-300 bg-white py-3"
                onPress={handleClose}
              >
                <Text className="font-semibold text-gray-700">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 items-center justify-center  rounded-2xl py-3 ${
                  isLoading ? 'bg-indigo-400' : 'bg-indigo-600'
                }`}
                disabled={isLoading}
                onPress={handleSave}
              >
                {isLoading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="ml-2 text-base font-semibold text-white">
                      Đang lưu...
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <CheckCircle2 size={18} color="white" />
                    <Text className="ml-2 font-semibold text-white">
                      Lưu kết quả
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fish Identification Alert */}
      <CustomAlert
        visible={showFishIdentificationAlert}
        title="Hoàn thành tuyển chọn!"
        message="Bạn đã hoàn thành 4 lần tuyển chọn. Bạn có muốn định danh cá ngay bây giờ không?"
        type="info"
        cancelText="Để sau"
        confirmText="Định danh ngay"
        onCancel={() => setShowFishIdentificationAlert(false)}
        onConfirm={() => {
          setShowFishIdentificationAlert(false);
          router.push(
            `/breeding/${breedingId}/fish-list?redirect=/breeding/${breedingId}`
          );
        }}
      />

      {/* Error Alert */}
      <CustomAlert
        visible={showErrorAlert}
        title="Có lỗi xảy ra"
        message={errorMessage}
        type="danger"
        confirmText="Đóng"
        onCancel={() => setShowErrorAlert(false)}
        onConfirm={() => setShowErrorAlert(false)}
      />
    </>
  );
}
