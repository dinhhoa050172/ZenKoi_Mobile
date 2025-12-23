import { getAffectedStatusInfo } from '@/app/(home)/incidents/[id]';
import { KoiAffectedStatus } from '@/lib/api/services/fetchIncident';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Droplets, Heart, Stethoscope, X } from 'lucide-react-native';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FishSvg from '../icons/FishSvg';
import InputField from '../InputField';
import ModalChangePondForKoi from './ModalChangePondForKoi';

export default function KoiCard({ koi, index, onRemove, onUpdate }: any) {
  const [showChangePondModal, setShowChangePondModal] = useState(false);

  const handleIsolationToggle = () => {
    const newIsolatedState = !koi.isIsolated;
    onUpdate(koi.id, 'isIsolated', newIsolatedState);

    // Show pond change modal when enabling isolation
    if (newIsolatedState) {
      setShowChangePondModal(true);
    }
  };

  return (
    <>
      <View
        className="mb-4 overflow-hidden rounded-2xl border-2 border-orange-200 bg-white shadow-md"
        style={{ elevation: 3 }}
      >
        {/* Header */}
        <LinearGradient colors={['#f97316', '#ea580c']} className="px-5 py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center">
              <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <FishSvg size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-black text-white">
                  {koi.koiName || `Cá #${koi.id}`}
                </Text>
                <Text className="text-sm text-white/80">RFID: {koi.rfid}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onRemove}
              className="h-10 w-10 items-center justify-center rounded-full bg-red-500 shadow-lg"
              style={{ elevation: 4 }}
              activeOpacity={0.7}
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Content */}
        <View className="flex-1 gap-4 p-5">
          {/* Status Selection */}
          <View>
            <Text className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-600">
              Trạng thái
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {Object.values(KoiAffectedStatus).map((status) => {
                const statusInfo = getAffectedStatusInfo(status);
                const isSelected = koi.affectedStatus === status;
                return (
                  <TouchableOpacity
                    key={`${koi.id}-${status}`}
                    onPress={() => onUpdate(koi.id, 'affectedStatus', status)}
                    className="overflow-hidden rounded-lg"
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        isSelected
                          ? ['#f97316', '#ea580c']
                          : ['#f3f4f6', '#e5e7eb']
                      }
                      className="px-4 py-2"
                    >
                      <Text
                        className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-600'}`}
                      >
                        {statusInfo.label}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <InputField
            icon={<Stethoscope size={20} color="#ea580c" />}
            label="Triệu chứng *"
            placeholder="Mô tả triệu chứng cụ thể..."
            value={koi.specificSymptoms || ''}
            onChangeText={(text: string) =>
              onUpdate(koi.id, 'specificSymptoms', text)
            }
            iconBg="bg-orange-100"
            multiline
          />

          <InputField
            icon={<Heart size={20} color="#ea580c" />}
            label="Ghi chú điều trị"
            placeholder="Ghi chú về điều trị..."
            value={koi.treatmentNotes || ''}
            onChangeText={(text: string) =>
              onUpdate(koi.id, 'treatmentNotes', text)
            }
            iconBg="bg-orange-100"
            multiline
          />

          {/* Toggles */}
          <View className="flex-row gap-3">
            <View className="flex-1 flex-row items-center justify-between rounded-2xl bg-orange-50 px-4 py-3">
              <View className="flex-row items-center">
                <Stethoscope size={16} color="#ea580c" />
                <Text className="ml-2 text-xs font-bold text-orange-900">
                  Điều trị
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  onUpdate(koi.id, 'requiresTreatment', !koi.requiresTreatment)
                }
                className={`h-6 w-6 items-center justify-center rounded-full ${koi.requiresTreatment ? 'bg-orange-500' : 'bg-gray-300'}`}
                activeOpacity={0.8}
              >
                {koi.requiresTreatment && <Check size={14} color="white" />}
              </TouchableOpacity>
            </View>

            <View className="flex-1 flex-row items-center justify-between rounded-2xl bg-orange-50 px-4 py-3">
              <View className="flex-row items-center">
                <Droplets size={16} color="#ea580c" />
                <Text className="ml-2 text-xs font-bold text-orange-900">
                  Cách ly
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleIsolationToggle}
                className={`h-6 w-6 items-center justify-center rounded-full ${koi.isIsolated ? 'bg-orange-500' : 'bg-gray-300'}`}
                activeOpacity={0.8}
              >
                {koi.isIsolated && <Check size={14} color="white" />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Change Pond Modal */}
      <ModalChangePondForKoi
        visible={showChangePondModal}
        koi={koi}
        onClose={() => setShowChangePondModal(false)}
        onSuccess={(newPondId) => {
          // Update koi pond information if needed
          console.log(`Koi ${koi.id} moved to pond ${newPondId}`);
          setShowChangePondModal(false);
        }}
      />
    </>
  );
}
