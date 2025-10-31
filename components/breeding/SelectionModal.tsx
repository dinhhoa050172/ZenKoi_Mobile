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
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { CustomAlert } from '../CustomAlert';

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

  const resetModal = () => {
    setSelectionCount('');
    setSelectionNote('');
    setSelectionError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

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

    const recordsCount = classificationRecordsQuery.data?.data?.length ?? 0;

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
        text1: 'Đã tạo bản ghi tuyển chọn!',
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

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-4">
          <View
            className="w-11/12 rounded-2xl bg-white"
            style={{ maxHeight: '75%' }}
          >
            <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
              <Text className="text-lg font-semibold">Tuyển chọn cá</Text>
              <TouchableOpacity onPress={handleClose}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              {classificationStageQuery.isLoading ? (
                <Text className="text-center text-sm text-gray-500">
                  Đang tải thông tin...
                </Text>
              ) : classificationStageQuery.error ? (
                <Text className="text-center text-sm text-red-500">
                  Không thể tải thông tin giai đoạn tuyển chọn
                </Text>
              ) : classificationStageQuery.data ? (
                <>
                  <View className="mb-3 rounded bg-blue-50 p-3">
                    <Text className="text-sm text-blue-700">
                      Giai đoạn:{' '}
                      <Text className="font-semibold">
                        Tuyển chọn lần{' '}
                        {(classificationRecordsQuery.data?.data?.length ?? 0) +
                          1}
                      </Text>
                    </Text>
                    <Text className="mt-1 text-sm text-blue-700">
                      Tổng số cá:{' '}
                      <Text className="font-semibold">
                        {classificationStageQuery.data.totalCount ?? 0} con
                      </Text>
                    </Text>
                  </View>

                  {(classificationRecordsQuery.data?.data?.length ?? 0) > 0 && (
                    <View className="mb-3 rounded bg-green-50 p-3">
                      <Text className="text-sm font-semibold text-green-700">
                        Đã có{' '}
                        {classificationRecordsQuery.data?.data?.length ?? 0} lần
                        tuyển chọn
                      </Text>
                      {classificationSummaryQuery.data && (
                        <>
                          {(classificationRecordsQuery.data?.data?.length ??
                            0) < 3 && (
                            <Text className="mt-1 text-sm text-green-700">
                              Số cá hiện tại:{' '}
                              <Text className="font-semibold">
                                {classificationSummaryQuery.data.currentFish ??
                                  0}{' '}
                                con
                              </Text>
                            </Text>
                          )}
                          {(classificationRecordsQuery.data?.data?.length ??
                            0) === 3 && (
                            <Text className="mt-1 text-sm text-green-700">
                              Số cá High hiện tại:{' '}
                              <Text className="font-semibold">
                                {classificationSummaryQuery.data
                                  .totalHighQualified ?? 0}{' '}
                                con
                              </Text>
                            </Text>
                          )}
                        </>
                      )}
                    </View>
                  )}

                  <Text className="mb-1 text-xs text-gray-500">
                    {(classificationRecordsQuery.data?.data?.length ?? 0) ===
                      0 ||
                    (classificationRecordsQuery.data?.data?.length ?? 0) === 1
                      ? 'Số lượng cá không đạt chuẩn'
                      : (classificationRecordsQuery.data?.data?.length ?? 0) ===
                          2
                        ? 'Số lượng cá High'
                        : 'Số lượng cá Show'}{' '}
                    <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="mb-2 rounded border border-gray-200 p-2"
                    value={selectionCount}
                    onChangeText={(t) => {
                      setSelectionCount(t.replace(/[^0-9]/g, ''));
                      if (selectionError) setSelectionError('');
                    }}
                    placeholder="VD: 1000"
                    keyboardType="numeric"
                  />
                  {selectionError ? (
                    <Text className="mb-2 text-sm text-red-500">
                      {selectionError}
                    </Text>
                  ) : null}

                  <Text className="text-xs text-gray-500">Ghi chú</Text>
                  <TextInput
                    className="mb-2 rounded border border-gray-200 p-2"
                    value={selectionNote}
                    onChangeText={(t) => setSelectionNote(t)}
                    placeholder="Ghi chú (tuỳ chọn)"
                    multiline
                    numberOfLines={3}
                  />
                </>
              ) : null}
            </ScrollView>

            <View className="flex-row justify-between border-t border-gray-100 p-4">
              <TouchableOpacity
                className="rounded-lg border border-gray-200 px-4 py-2"
                onPress={handleClose}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`rounded-lg bg-primary px-4 py-2 ${
                  createClassificationV1.status === 'pending' ||
                  createClassificationV2.status === 'pending' ||
                  createClassificationV3.status === 'pending'
                    ? 'opacity-60'
                    : ''
                }`}
                disabled={
                  createClassificationV1.status === 'pending' ||
                  createClassificationV2.status === 'pending' ||
                  createClassificationV3.status === 'pending'
                }
                onPress={handleSave}
              >
                {createClassificationV1.status === 'pending' ||
                createClassificationV2.status === 'pending' ||
                createClassificationV3.status === 'pending' ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white">Lưu</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={showFishIdentificationAlert}
        title="Định danh cá"
        message="Bạn có muốn định danh cá ngay bây giờ không?"
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

      <CustomAlert
        visible={showErrorAlert}
        title="Lỗi"
        message={errorMessage}
        type="danger"
        confirmText="Đóng"
        onCancel={() => setShowErrorAlert(false)}
        onConfirm={() => setShowErrorAlert(false)}
      />
    </>
  );
}
