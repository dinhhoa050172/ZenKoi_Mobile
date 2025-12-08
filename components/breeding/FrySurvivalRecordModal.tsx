import { useCreateClassificationStage } from '@/hooks/useClassificationStage';
import { useGetFryFishByBreedingProcessId } from '@/hooks/useFryFish';
import {
  useCreateFrySurvivalRecord,
  useGetFrySurvivalRecords,
} from '@/hooks/useFrySurvivalRecord';
import { useGetPonds } from '@/hooks/usePond';
import { PondStatus } from '@/lib/api/services/fetchPond';
import { TypeOfPond } from '@/lib/api/services/fetchPondType';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRight,
  FileText,
  Info,
  Save,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';
import ContextMenuField from '../ContextMenuField';
import { CustomAlert } from '../CustomAlert';
import FishSvg from '../icons/FishSvg';
import PondSvg from '../icons/PondSvg';

interface FrySurvivalRecordModalProps {
  visible: boolean;
  onClose: () => void;
  breedingId: number | null;
  pondTypeEnum?: TypeOfPond;
}

export function FrySurvivalRecordModal({
  visible,
  onClose,
  breedingId,
  pondTypeEnum,
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
      errors.countAlive = 'Nhập số cá sống lớn hơn hoặc bằng 0';

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
      queryClient.invalidateQueries({
        queryKey: ['fryFish', 'summary', fryFishQuery.data?.id],
      });
      handleClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Không thể tạo bản ghi');
      setShowErrorAlert(true);
    }
  };

  const isLoading =
    createFrySurvival.status === 'pending' ||
    createClassificationStage.status === 'pending';

  const hasExistingRecords =
    (frySurvivalRecordsQuery.data?.data?.length ?? 0) > 0;

  const currentCount = hasExistingRecords
    ? (frySurvivalRecordsQuery.data?.data?.[
        frySurvivalRecordsQuery.data.data.length - 1
      ]?.countAlive ?? 0)
    : (fryFishQuery.data?.initialCount ?? 0);

  // When modal opens, refetch latest fry fish and survival records
  useEffect(() => {
    if (!visible) return;

    let mounted = true;
    (async () => {
      const res = await fryFishQuery.refetch();
      const fryFishId = res?.data?.id ?? fryFishQuery.data?.id;

      if (mounted && fryFishId) {
        await frySurvivalRecordsQuery.refetch();
      }
    })();

    return () => {
      mounted = false;
    };
  }, [visible, breedingId, fryFishQuery, frySurvivalRecordsQuery]);

  // internal ponds: modal fetches empty ponds itself
  const internalPondsQuery = useGetPonds(
    { pageIndex: 1, pageSize: 200, status: PondStatus.EMPTY, pondTypeEnum },
    !!visible
  );
  const internalPondsList = internalPondsQuery.data?.data ?? [];

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
            className="w-full max-w-lg flex-1 overflow-hidden rounded-3xl bg-white"
            style={{ maxHeight: '85%' }}
          >
            {/* Header */}
            <View className="bg-purple-600 pb-6 pt-4">
              <View className="flex-row items-center justify-between px-5">
                <View className="h-10 w-10" />
                <View className="flex-1 items-center">
                  <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-white/20">
                    <FishSvg size={24} color="white" />
                  </View>
                  <Text className="text-xs font-medium uppercase tracking-wide text-white/80">
                    Ghi nhận
                  </Text>
                  <Text className="text-xl font-bold text-white">
                    Theo dõi cá bột
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
                  disabled={isLoading}
                >
                  <X size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <KeyboardAwareScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 100,
              }}
              bottomOffset={20}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Fry Fish Info */}
              <View className="mb-4">
                <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
                  Thông tin lô cá bột
                </Text>
                <View className="rounded-2xl border border-gray-200 bg-white p-4">
                  {fryFishQuery.isLoading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#3b82f6" />
                      <Text className="ml-3 text-base text-gray-600">
                        Đang tải thông tin...
                      </Text>
                    </View>
                  ) : fryFishQuery.error ? (
                    <View className="flex-row items-center">
                      <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-red-100">
                        <AlertCircle size={16} color="#ef4444" />
                      </View>
                      <Text className="flex-1 text-base text-red-600">
                        Không thể tải thông tin cá bột
                      </Text>
                    </View>
                  ) : fryFishQuery.data ? (
                    <>
                      <View className="mb-3 flex-row items-center">
                        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                          <FishSvg size={22} color="#9333ea" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-base text-gray-500">
                            Mã lô cá bột
                          </Text>
                          <Text className="text-lg font-bold text-gray-900">
                            #{fryFishQuery.data.id}
                          </Text>
                        </View>
                      </View>

                      <View className="rounded-2xl border border-purple-200 bg-purple-50 p-3">
                        <View className="mb-2 flex-row items-center">
                          <Info size={14} color="#9333ea" />
                          <Text className="ml-2 text-base font-semibold text-purple-900">
                            {hasExistingRecords
                              ? 'Số cá sống hiện tại'
                              : 'Số lượng ban đầu'}
                          </Text>
                        </View>
                        <Text className="text-2xl font-bold text-cyan-700">
                          {currentCount.toLocaleString()} con
                        </Text>
                        {hasExistingRecords && (
                          <Text className="mt-1 text-base text-purple-600">
                            Đã có {frySurvivalRecordsQuery.data?.data?.length}{' '}
                            bản ghi theo dõi
                          </Text>
                        )}
                      </View>
                    </>
                  ) : (
                    <Text className="text-sm text-gray-500">
                      Không tìm thấy lô cá bột
                    </Text>
                  )}
                  {fryErrors.fryFish && (
                    <Text className="mt-2 text-xs text-red-500">
                      {fryErrors.fryFish}
                    </Text>
                  )}
                </View>
              </View>

              {/* Input Fields */}
              <View className="mb-4">
                <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
                  Cập nhật số liệu
                </Text>
                <View className="rounded-2xl border border-gray-200 bg-white p-4">
                  {/* Count Alive */}
                  <View className="mb-4 flex-row items-center">
                    <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                      <FishSvg size={22} color="#9333ea" />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-1 text-base font-medium text-gray-600">
                        Số cá còn sống <Text className="text-red-500">*</Text>
                      </Text>
                      <TextInput
                        className={`rounded-2xl border ${fryErrors.countAlive ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} px-3 py-2 text-base font-medium text-gray-900`}
                        value={fryCountAlive}
                        onChangeText={(t) => {
                          const v = t.replace(/[^0-9]/g, '');
                          setFryCountAlive(v);
                          if (fryErrors.countAlive)
                            setFryErrors((p) => ({
                              ...p,
                              countAlive: undefined,
                            }));
                        }}
                        placeholder="VD: 4400"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                      />
                      {fryErrors.countAlive ? (
                        <Text className="mt-1 text-sm text-red-500">
                          {fryErrors.countAlive}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Notes */}
                  <View className="flex-row items-start">
                    <View className="mr-3 mt-3 h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                      <FileText size={18} color="#f59e0b" />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-1 text-base font-medium text-gray-600">
                        Ghi chú (tùy chọn)
                      </Text>
                      <TextInput
                        className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-base text-gray-900"
                        value={fryNote}
                        onChangeText={(t) => setFryNote(t)}
                        placeholder="Thêm ghi chú về tình trạng cá..."
                        placeholderTextColor="#9ca3af"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Transfer Stage */}
              <View className="mb-4">
                <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
                  Chuyển giai đoạn
                </Text>
                <View className="rounded-2xl border border-gray-200 bg-white p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center">
                      <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                        <ArrowRight size={18} color="#a855f7" />
                      </View>
                      <Text className="flex-1 text-base font-medium text-gray-700">
                        Chuyển sang tuyển chọn
                      </Text>
                    </View>
                    <Switch
                      value={frySuccess}
                      onValueChange={(v) => setFrySuccess(v)}
                      trackColor={{ true: '#a855f7', false: '#d1d5db' }}
                      thumbColor="#ffffff"
                    />
                  </View>

                  {frySuccess && (
                    <View className="mt-4 flex-row items-start border-t border-gray-100 pt-4">
                      <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                        <PondSvg size={18} color="#3b82f6" />
                      </View>
                      <View className="flex-1">
                        <ContextMenuField
                          label="Hồ tuyển chọn *"
                          value={fryPondLabel}
                          options={internalPondsList.map((p) => ({
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
                          onPress={internalPondsQuery.refetch}
                          placeholder="Chọn hồ"
                        />
                        {fryErrors.pond ? (
                          <Text className="mt-2 text-xs text-red-500">
                            {fryErrors.pond}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </KeyboardAwareScrollView>

            {/* Fixed Bottom Actions */}
            <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-5 py-4">
              <View className="flex-row">
                <TouchableOpacity
                  className="mr-2 flex-1 rounded-2xl border-2 border-gray-200 bg-gray-50 py-4"
                  onPress={handleClose}
                  disabled={isLoading}
                >
                  <Text className="text-center text-base font-semibold text-gray-700">
                    Hủy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`ml-2 flex-1 flex-row items-center justify-center rounded-2xl py-4 ${
                    isLoading ? 'bg-gray-300' : 'bg-purple-600'
                  }`}
                  disabled={isLoading}
                  onPress={handleSave}
                >
                  {isLoading ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text className="ml-2 text-base font-semibold text-white">
                        Đang lưu...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Save size={20} color="white" />
                      <Text className="ml-2 text-base font-semibold text-white">
                        Lưu bản ghi
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
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
