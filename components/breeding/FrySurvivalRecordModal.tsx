import { useCreateClassificationStage } from '@/hooks/useClassificationStage';
import { useGetFryFishByBreedingProcessId } from '@/hooks/useFryFish';
import {
  useCreateFrySurvivalRecord,
  useGetFrySurvivalRecords,
} from '@/hooks/useFrySurvivalRecord';
import { Pond } from '@/lib/api/services/fetchPond';
import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import ContextMenuField from '../ContextMenuField';
import { CustomAlert } from '../CustomAlert';

interface FrySurvivalRecordModalProps {
  visible: boolean;
  onClose: () => void;
  breedingId: number | null;
  emptyPonds: Pond[];
  onRefetchPonds: () => void;
}

export function FrySurvivalRecordModal({
  visible,
  onClose,
  breedingId,
  emptyPonds,
  onRefetchPonds,
}: FrySurvivalRecordModalProps) {
  const queryClient = useQueryClient();

  const [fryCountAlive, setFryCountAlive] = useState('');
  const [fryNote, setFryNote] = useState('');
  const [frySuccess, setFrySuccess] = useState(false);
  const [fryPondId, setFryPondId] = useState<number | null>(null);
  const [fryPondLabel, setFryPondLabel] = useState<string>('Chọn hồ');
  const [fryErrors, setFryErrors] = useState<{
    countAlive?: string;
    fryFish?: string;
    pond?: string;
  }>({});
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fryFishQuery = useGetFryFishByBreedingProcessId(
    breedingId ?? 0,
    !!breedingId
  );

  const frySurvivalRecordsQuery = useGetFrySurvivalRecords(
    {
      fryFishId: fryFishQuery.data?.id,
      pageIndex: 1,
      pageSize: 100,
    },
    !!fryFishQuery.data?.id && !!visible
  );

  const createFrySurvival = useCreateFrySurvivalRecord();
  const createClassificationStage = useCreateClassificationStage();

  const resetModal = () => {
    setFryCountAlive('');
    setFryNote('');
    setFrySuccess(false);
    setFryPondId(null);
    setFryPondLabel('Chọn hồ');
    setFryErrors({});
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSave = async () => {
    if (
      createFrySurvival.status === 'pending' ||
      createClassificationStage.status === 'pending'
    )
      return;

    setFryErrors({});

    const errors: any = {};
    const alive =
      fryCountAlive.trim() === '' ? NaN : parseInt(fryCountAlive, 10);

    if (!Number.isFinite(alive) || alive < 0)
      errors.countAlive = 'Vui lòng nhập số lượng hợp lệ';

    const fryFish = fryFishQuery.data;
    if (!fryFish || !fryFish.id)
      errors.fryFish = 'Không tìm thấy lô cá bột liên quan';

    if (frySuccess && !fryPondId) {
      errors.pond = 'Vui lòng chọn hồ nuôi tuyển chọn';
    }

    setFryErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await createFrySurvival.mutateAsync({
        fryFishId: fryFish!.id,
        countAlive: alive,
        note: fryNote.trim() || '',
        success: frySuccess,
      });

      if (frySuccess && fryPondId && breedingId) {
        await createClassificationStage.mutateAsync({
          breedingProcessId: breedingId,
          pondId: fryPondId,
          notes: '',
        });
        Toast.show({
          type: 'success',
          text1: 'Đã chuyển sang giai đoạn tuyển chọn!',
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Đã tạo bản ghi cá bột thành công!',
        });
      }

      queryClient.invalidateQueries({ queryKey: ['breedingProcesses'] });
      queryClient.invalidateQueries({ queryKey: ['fryFish'] });
      queryClient.invalidateQueries({ queryKey: ['frySurvivalRecords'] });
      handleClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Không thể tạo bản ghi');
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
              <Text className="text-lg font-semibold">Ghi nhận cá bột</Text>
              <TouchableOpacity onPress={handleClose}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{
                paddingTop: 8,
                paddingHorizontal: 16,
              }}
            >
              {fryErrors.fryFish ? (
                <Text className="mb-2 text-sm text-red-500">
                  {fryErrors.fryFish}
                </Text>
              ) : null}

              {fryFishQuery.isLoading ? (
                <Text className="text-sm text-gray-500">
                  Đang tìm lô cá bột liên quan...
                </Text>
              ) : fryFishQuery.error ? (
                <Text className="text-sm text-red-500">
                  Không thể tải thông tin cá bột
                </Text>
              ) : fryFishQuery.data ? (
                <View className="mb-3 rounded bg-blue-50 p-3">
                  <Text className="text-sm text-blue-700">
                    Lô cá bột:{' '}
                    <Text className="font-semibold">
                      #{fryFishQuery.data.id}
                    </Text>
                  </Text>
                  <Text className="mt-1 text-sm text-blue-700">
                    {frySurvivalRecordsQuery.data?.data &&
                    frySurvivalRecordsQuery.data.data.length > 0 ? (
                      <>
                        Số cá sống hiện tại:{' '}
                        <Text className="font-semibold">
                          {frySurvivalRecordsQuery.data.data[
                            frySurvivalRecordsQuery.data.data.length - 1
                          ]?.countAlive ?? 0}{' '}
                          con
                        </Text>
                      </>
                    ) : (
                      <>
                        Số lượng ban đầu:{' '}
                        <Text className="font-semibold">
                          {fryFishQuery.data.initialCount ?? 0} con
                        </Text>
                      </>
                    )}
                  </Text>
                  {frySurvivalRecordsQuery.data?.data &&
                  frySurvivalRecordsQuery.data.data.length > 0 ? (
                    <Text className="mt-1 text-sm text-blue-700">
                      Đã có {frySurvivalRecordsQuery.data.data.length} bản ghi
                      theo dõi
                    </Text>
                  ) : null}
                </View>
              ) : null}

              <Text className="text-xs text-gray-500">
                Số cá sống <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="mb-1 rounded border border-gray-200 p-2"
                value={fryCountAlive}
                onChangeText={(t) => {
                  const v = t.replace(/[^0-9]/g, '');
                  setFryCountAlive(v);
                  if (fryErrors.countAlive)
                    setFryErrors((p) => ({ ...p, countAlive: undefined }));
                }}
                placeholder="VD: 4400"
                keyboardType="numeric"
              />
              {fryErrors.countAlive ? (
                <Text className="mb-2 text-sm text-red-500">
                  {fryErrors.countAlive}
                </Text>
              ) : null}

              <Text className="text-xs text-gray-500">Ghi chú</Text>
              <TextInput
                className="mb-2 rounded border border-gray-200 p-2"
                value={fryNote}
                onChangeText={(t) => {
                  setFryNote(t);
                }}
                placeholder="Ghi chú (tuỳ chọn)"
                multiline
                numberOfLines={3}
              />

              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-700">
                  Chuyển sang giai đoạn tuyển chọn
                </Text>
                <Switch
                  value={frySuccess}
                  onValueChange={(v) => setFrySuccess(v)}
                  trackColor={{ true: '#10b981', false: '#d1d5db' }}
                  thumbColor={frySuccess ? '#ffffff' : '#ffffff'}
                />
              </View>

              {frySuccess ? (
                <View className="mt-3">
                  <ContextMenuField
                    label="Hồ chuyển sang tuyển chọn"
                    value={fryPondLabel}
                    options={(emptyPonds ?? []).map((p) => ({
                      label: `${p.id}: ${p.pondName ?? p.id}`,
                      value: `${p.id}: ${p.pondName ?? p.id}`,
                      meta: `Sức chứa tối đa: ${p.maxFishCount ?? '—'}`,
                    }))}
                    onSelect={(v: string) => {
                      const id = String(v).split(':')[0]?.trim();
                      setFryPondId(id ? Number(id) : null);
                      setFryPondLabel(String(v));
                      if (fryErrors.pond)
                        setFryErrors((p) => ({ ...p, pond: undefined }));
                    }}
                    onPress={onRefetchPonds}
                    placeholder="Chọn hồ"
                  />
                  {fryErrors.pond ? (
                    <Text className="mb-2 text-sm text-red-500">
                      {fryErrors.pond}
                    </Text>
                  ) : null}
                </View>
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
                className={`rounded-lg bg-primary px-4 py-2 ${createFrySurvival.status === 'pending' || createClassificationStage.status === 'pending' ? 'opacity-60' : ''}`}
                disabled={
                  createFrySurvival.status === 'pending' ||
                  createClassificationStage.status === 'pending'
                }
                onPress={handleSave}
              >
                {createFrySurvival.status === 'pending' ||
                createClassificationStage.status === 'pending' ? (
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
