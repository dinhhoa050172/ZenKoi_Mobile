import { LinearGradient } from 'expo-linear-gradient';
import { Droplets, FileText, Fish, Wrench, X } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import PondSvg from '../icons/PondSvg';
import InputField from '../InputField';

export default function PondCard({ pond, index, onRemove, onUpdate }: any) {
  return (
    <View
      className="mb-4 overflow-hidden rounded-2xl border-2 border-cyan-200 bg-white shadow-md"
      style={{ elevation: 3 }}
    >
      {/* Header */}
      <LinearGradient colors={['#06b6d4', '#0891b2']} className="px-5 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center">
            <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <PondSvg size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-black text-white">
                {pond.pondName}
              </Text>
              <Text className="text-sm text-white/80">
                {(pond.lengthMeters * pond.widthMeters)?.toFixed(1)}m² • Độ sâu:{' '}
                {pond.depth}m
              </Text>
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
        <InputField
          icon={<Droplets size={20} color="#0891b2" />}
          label="Thay đổi môi trường"
          placeholder="Mô tả các thay đổi môi trường..."
          value={pond.environmentalChanges || ''}
          onChangeText={(text: string) =>
            onUpdate(pond.id, 'environmentalChanges', text)
          }
          iconBg="bg-cyan-100"
          multiline
        />

        <InputField
          icon={<Wrench size={20} color="#0891b2" />}
          label="Biện pháp khắc phục"
          placeholder="Các biện pháp đã thực hiện..."
          value={pond.correctiveActions || ''}
          onChangeText={(text: string) =>
            onUpdate(pond.id, 'correctiveActions', text)
          }
          iconBg="bg-cyan-100"
          multiline
        />

        <InputField
          icon={<Fish size={20} color="#0891b2" />}
          label="Số cá chết"
          placeholder="0"
          value={pond.fishDiedCount?.toString() || '0'}
          onChangeText={(text: string) =>
            onUpdate(pond.id, 'fishDiedCount', parseInt(text) || 0)
          }
          iconBg="bg-cyan-100"
          keyboardType="numeric"
        />

        <InputField
          icon={<FileText size={20} color="#0891b2" />}
          label="Ghi chú"
          placeholder="Ghi chú thêm..."
          value={pond.notes || ''}
          onChangeText={(text: string) => onUpdate(pond.id, 'notes', text)}
          iconBg="bg-cyan-100"
          multiline
        />

        <View className="flex-row items-center justify-between rounded-2xl bg-cyan-50 px-4 py-3">
          <View className="flex-row items-center">
            <Droplets size={20} color="#0891b2" />
            <Text className="ml-2 font-bold text-cyan-900">Cần thay nước</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              onUpdate(
                pond.id,
                'requiresWaterChange',
                !pond.requiresWaterChange
              )
            }
            className={`h-8 w-14 items-center justify-center rounded-full ${pond.requiresWaterChange ? 'bg-cyan-500' : 'bg-gray-300'}`}
            activeOpacity={0.8}
          >
            <View
              className={`h-6 w-6 rounded-full bg-white shadow-md ${pond.requiresWaterChange ? 'self-end' : 'self-start'}`}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
