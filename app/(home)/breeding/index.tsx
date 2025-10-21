import { useRouter } from 'expo-router';
import {
  Camera,
  ChevronDown,
  Egg,
  Eye,
  Filter,
  Fish,
  Mars,
  MoveRight,
  Thermometer,
  Venus,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

interface BreedingData {
  id: string;
  code: string;
  name: string;
  maleFish: string;
  femaleFish: string;
  pond: string;
  eggCount: number;
  temperature: number;
  survivalRate: number;
  daysLeft: number;
  status:
    | 'Đang ghép cặp'
    | 'Ấp trứng'
    | 'Nuôi cá bột'
    | 'Tuyển chọn'
    | 'Hủy ghép cặp';
}

export default function BreedingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('Tất cả bể cá');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showCountModal, setShowCountModal] = useState(false);
  const [countMethod, setCountMethod] = useState('Đếm theo mẫu');

  const [totalWeight, setTotalWeight] = useState('');
  const [sampleWeight, setSampleWeight] = useState('');
  const [sampleCount, setSampleCount] = useState('');
  const [avgWeight, setAvgWeight] = useState('');
  const [showIncubationModal, setShowIncubationModal] = useState(false);
  const [healthyEggs, setHealthyEggs] = useState('');
  const [badEggs, setBadEggs] = useState('');
  const [hatchedEggs, setHatchedEggs] = useState('');
  const [waterTemp, setWaterTemp] = useState('');
  const [ph, setPh] = useState('');
  const [oxygen, setOxygen] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferCount, setTransferCount] = useState('');
  const [selectedPondForTransfer, setSelectedPondForTransfer] =
    useState('Hồ A');
  const [showFryUpdateModal, setShowFryUpdateModal] = useState(false);
  const [currentFryCount, setCurrentFryCount] = useState('');
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectionCount, setSelectionCount] = useState('');

  const filterOptions = ['Tất cả bể cá', 'Đang sinh sản', 'Hoàn thành', 'Hủy'];

  const breedingData: BreedingData[] = [
    {
      id: '1',
      code: 'BC-001',
      name: 'Sakura × Yuki',
      maleFish: 'Kohaku',
      femaleFish: 'Sanke',
      pond: 'Hồ A',
      eggCount: 800,
      temperature: 22,
      survivalRate: 85,
      daysLeft: 12,
      status: 'Đang ghép cặp',
    },
    {
      id: '2',
      code: 'BC-002',
      name: 'Tancho × Showa',
      maleFish: 'Tancho',
      femaleFish: 'Showa',
      pond: 'Hồ B',
      eggCount: 650,
      temperature: 23,
      survivalRate: 78,
      daysLeft: 8,
      status: 'Ấp trứng',
    },
    {
      id: '3',
      code: 'BC-003',
      name: 'Asagi × Kohaku',
      maleFish: 'Asagi',
      femaleFish: 'Kohaku',
      pond: 'Hồ C',
      eggCount: 1200,
      temperature: 21,
      survivalRate: 72,
      daysLeft: 0,
      status: 'Tuyển chọn',
    },
    {
      id: '4',
      code: 'BC-004',
      name: 'Yamabuki × Ginrin',
      maleFish: 'Yamabuki',
      femaleFish: 'Ginrin',
      pond: 'Hồ D',
      eggCount: 950,
      temperature: 20,
      survivalRate: 0,
      daysLeft: 0,
      status: 'Hủy ghép cặp',
    },
    {
      id: '5',
      code: 'BC-005',
      name: 'Kenzo × Mei',
      maleFish: 'Kenzo',
      femaleFish: 'Mei',
      pond: 'Hồ C',
      eggCount: 1800,
      temperature: 21,
      survivalRate: 72,
      daysLeft: 45,
      status: 'Nuôi cá bột',
    },
  ];

  const ContextMenuField = ({
    label,
    value,
    options,
    onSelect,
    placeholder,
  }: {
    label: string;
    value: string;
    options: string[];
    onSelect: (val: string) => void;
    placeholder: string;
  }) => {
    const [showDialog, setShowDialog] = useState(false);

    return (
      <>
        <View className="mb-4">
          <Text className="mb-2 text-base font-medium text-gray-900">
            {label}
          </Text>
          <TouchableOpacity
            className="flex-row items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
            onPress={() => setShowDialog(true)}
          >
            <Text
              className={`${value && value !== placeholder ? 'text-gray-900' : 'text-gray-500'}`}
            >
              {value || placeholder}
            </Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <Modal
          visible={showDialog}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDialog(false)}
        >
          <View className="flex-1 items-center justify-center bg-black/50 p-4">
            <View className="w-full max-w-sm rounded-2xl bg-white">
              <View className="border-b border-gray-200 p-4">
                <Text className="text-center text-lg font-semibold text-gray-900">
                  Chọn {label.toLowerCase()}
                </Text>
              </View>
              <ScrollView className="max-h-80">
                {options.map((opt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    className={`flex-row items-center px-4 py-4 ${idx < options.length - 1 ? 'border-b border-gray-100' : ''}`}
                    onPress={() => {
                      onSelect(opt);
                      setShowDialog(false);
                    }}
                  >
                    <View
                      className={`mr-3 h-5 w-5 rounded-full border-2 ${value === opt ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}
                    ></View>
                    <Text
                      className={`flex-1 ${value === opt ? 'font-medium text-blue-600' : 'text-gray-900'}`}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View className="border-t border-gray-200 p-4">
                <TouchableOpacity
                  className="rounded-lg bg-gray-100 py-3"
                  onPress={() => setShowDialog(false)}
                >
                  <Text className="text-center font-medium text-gray-700">
                    Hủy
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đang ghép cặp':
        return '#3b82f6'; // blue
      case 'Ấp trứng':
        return '#f59e0b'; // amber
      case 'Nuôi cá bột':
        return '#10b981'; // green
      case 'Tuyển chọn':
        return '#6366f1'; // indigo
      case 'Hủy ghép cặp':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusText = (status: string) => {
    // Status strings are already Vietnamese labels, return as-is
    return status;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Filter Dropdown */}
        <View className="relative mb-4">
          <TouchableOpacity
            className="flex-row items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3"
            onPress={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <Text className="text-gray-900">{selectedFilter}</Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>

          {showFilterDropdown && (
            <View className="absolute left-0 right-0 top-full z-10 mt-1 rounded-2xl border border-gray-200 bg-white shadow-lg">
              {filterOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  className={`px-4 py-3 ${index < filterOptions.length - 1 ? 'border-b border-gray-100' : ''}`}
                  onPress={() => {
                    setSelectedFilter(option);
                    setShowFilterDropdown(false);
                  }}
                >
                  <Text className="text-gray-900">{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-900">
            Quản lý sinh sản
          </Text>
          <TouchableOpacity className="rounded-lg border border-gray-300 px-3 py-2">
            <Filter size={16} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
      >
        {breedingData.map((breeding) => {
          const color = getStatusColor(breeding.status);
          const badgeBg = color + '20';

          return (
            <View
              key={breeding.id}
              className="mb-4 rounded-2xl bg-white px-4 py-2 shadow-sm"
            >
              {/* Header */}
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-gray-900">
                  {breeding.code}
                </Text>
                <View
                  className="rounded-full px-2 py-1"
                  style={{ backgroundColor: badgeBg }}
                >
                  <Text className="text-xs font-medium" style={{ color }}>
                    {getStatusText(breeding.status)}
                  </Text>
                </View>
              </View>

              {/* Common top info */}
              <View className="mb-3">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-gray-900">
                    {breeding.name}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-sm text-gray-600">
                      {breeding.maleFish}
                    </Text>
                    <Mars
                      size={12}
                      color="#6b7280"
                      style={{ marginHorizontal: 2 }}
                    />
                    <Text className="text-sm text-gray-600"> × </Text>
                    <Text className="text-sm text-gray-600">
                      {breeding.femaleFish}
                    </Text>
                    <Venus
                      size={12}
                      color="#6b7280"
                      style={{ marginLeft: 2 }}
                    />
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
                  <Text className="text-sm text-gray-600">
                    Đang ở {breeding.pond}
                  </Text>
                </View>
              </View>

              {/* Variants by status */}
              {breeding.status === 'Đang ghép cặp' && (
                <View>
                  <View className="flex-row flex-wrap">
                    <View className="mb-2 w-1/2">
                      <Text className="text-xs text-gray-500">
                        Giai đoạn hiện tại
                      </Text>
                      <Text className="text-sm font-semibold text-gray-900">
                        Ghép cặp
                      </Text>
                    </View>
                    <View className="mb-2 w-1/2">
                      <Text className="text-xs text-gray-500">Số ngày</Text>
                      <Text className="text-sm font-semibold text-gray-900">
                        {breeding.daysLeft} ngày
                      </Text>
                    </View>
                  </View>

                  <View className="mt-4 flex-row border-t border-gray-200 pt-2">
                    <TouchableOpacity
                      className="mr-2 flex-1 flex-row items-center justify-center rounded-lg bg-green-600 py-2"
                      onPress={() => {
                        /* Cập nhật: Đã đẻ */
                      }}
                    >
                      <Text className="font-medium text-white">
                        Cập nhật: Đã đẻ
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="ml-2 flex-1 flex-row items-center justify-center rounded-lg border border-gray-200 py-2"
                      onPress={() => router.push(`/breeding/${breeding.id}`)}
                    >
                      <Eye size={16} color="#6b7280" />
                      <Text className="ml-2 text-sm text-gray-600">
                        Chi tiết
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {breeding.status === 'Ấp trứng' && (
                <View>
                  <View className="rounded-lg bg-gray-50 p-3">
                    <Text className="text-sm text-gray-600">
                      Số trứng:{' '}
                      <Text className="font-semibold text-gray-900">
                        Chưa đếm
                      </Text>{' '}
                      Tỷ lệ thụ tinh:{' '}
                      <Text className="font-semibold text-gray-900">85%</Text>
                    </Text>
                    <Text className="mt-2 text-sm text-gray-600">
                      Số ngày ấp:{' '}
                      <Text className="font-semibold text-gray-900">
                        15 ngày
                      </Text>
                    </Text>
                  </View>

                  <View className="mt-3">
                    <View className="flex-row justify-between">
                      <View className="mr-2 flex-1 items-center rounded bg-green-50 p-3">
                        <Text className="text-sm font-medium text-green-700">
                          Khỏe
                        </Text>
                        <Text className="text-xl font-bold text-green-700">
                          0
                        </Text>
                      </View>
                      <View className="mr-2 flex-1 items-center rounded bg-orange-50 p-3">
                        <Text className="text-sm font-medium text-orange-600">
                          Hỏng
                        </Text>
                        <Text className="text-xl font-bold text-orange-600">
                          0
                        </Text>
                      </View>
                      <View className="flex-1 items-center rounded bg-purple-50 p-3">
                        <Text className="text-sm font-medium text-purple-600">
                          Đã nở
                        </Text>
                        <Text className="text-xl font-bold text-purple-600">
                          0
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="mt-4 border-t border-gray-200 pt-2">
                    <View className="mb-2 flex-row">
                      <TouchableOpacity
                        className="mr-2 flex-1 flex-row items-center justify-center rounded-lg py-2"
                        style={{ backgroundColor: '#fb923c' }}
                        onPress={() => setShowCountModal(true)}
                      >
                        <Egg size={16} color="white" />
                        <Text className="ml-2 font-medium text-white">
                          Đếm trứng
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center rounded-lg py-2"
                        style={{ backgroundColor: '#2563eb' }}
                        onPress={() => setShowIncubationModal(true)}
                      >
                        <Thermometer size={16} color="white" />
                        <Text className="ml-2 font-medium text-white">
                          Ghi nhận ấp trứng
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View className="flex-row">
                      <TouchableOpacity
                        className="mr-2 flex-1 flex-row items-center justify-center rounded-lg py-2"
                        style={{ backgroundColor: '#10b981' }}
                        onPress={() => setShowTransferModal(true)}
                      >
                        <MoveRight size={16} color="white" />
                        <Text className="ml-2 font-medium text-white">
                          Chuyển nuôi cá bột
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center rounded-lg border border-gray-200 py-2"
                        onPress={() => router.push(`/breeding/${breeding.id}`)}
                      >
                        <Eye size={16} color="#6b7280" />
                        <Text className="ml-2 text-sm text-gray-700">
                          Xem chi tiết
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {breeding.status === 'Nuôi cá bột' && (
                <View>
                  <View className="rounded-lg bg-gray-50 p-3">
                    <Text className="text-sm text-gray-600">
                      Cá bột:{' '}
                      <Text className="font-semibold text-gray-900">
                        {breeding.eggCount} con
                      </Text>{' '}
                      Tỷ lệ sống:{' '}
                      <Text className="font-semibold text-gray-900">
                        {breeding.survivalRate}%
                      </Text>
                    </Text>
                    <Text className="mt-2 text-sm text-gray-600">
                      Tuổi:{' '}
                      <Text className="font-semibold text-gray-900">
                        45 ngày
                      </Text>
                    </Text>
                  </View>

                  <View className="mt-3 rounded-lg border border-gray-100 bg-white p-3">
                    <View className="mb-2 flex-row">
                      <Text className="flex-1 text-center text-sm text-pink-600">
                        7 ngày
                      </Text>
                      <Text className="flex-1 text-center text-sm text-orange-500">
                        14 ngày
                      </Text>
                      <Text className="flex-1 text-center text-sm text-yellow-500">
                        30 ngày
                      </Text>
                      <Text className="flex-1 text-center text-sm text-blue-500">
                        Hiện tại
                      </Text>
                    </View>
                    <View className="flex-row">
                      <Text className="flex-1 text-center text-sm text-gray-900">
                        92%
                      </Text>
                      <Text className="flex-1 text-center text-sm text-gray-900">
                        85%
                      </Text>
                      <Text className="flex-1 text-center text-sm text-gray-900">
                        78%
                      </Text>
                      <Text className="flex-1 text-center text-sm text-gray-900">
                        72%
                      </Text>
                    </View>
                  </View>

                  <View className="mt-4 border-t border-gray-200 pt-2">
                    <View className="mb-2 flex-row space-x-2">
                      <TouchableOpacity
                        className="mr-2 flex-1 flex-row items-center justify-center rounded-lg bg-purple-600 py-2"
                        onPress={() => setShowFryUpdateModal(true)}
                      >
                        <Fish size={16} color="white" />
                        <Text className="ml-2 font-medium text-white">
                          Cập nhật cá bột
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center rounded-lg bg-indigo-600 py-2"
                        onPress={() => {
                          /* TODO: open camera counting flow */
                        }}
                      >
                        <Camera size={16} color="white" />
                        <Text className="ml-2 font-medium text-white">
                          Đếm bằng camera
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View>
                      <TouchableOpacity
                        className="w-full flex-row items-center justify-center rounded-lg border border-gray-200 py-2"
                        onPress={() => router.push(`/breeding/${breeding.id}`)}
                      >
                        <Eye size={16} color="#6b7280" />
                        <Text className="ml-2 text-gray-700">Chi tiết</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {breeding.status === 'Tuyển chọn' && (
                <View>
                  <View className="rounded-lg bg-gray-50 p-3">
                    <Text className="text-sm text-gray-600">
                      Tuổi cá:{' '}
                      <Text className="font-semibold text-gray-900">
                        75 ngày
                      </Text>{' '}
                      Đã tuyển chọn:{' '}
                      <Text className="font-semibold text-gray-900">0 đợt</Text>
                    </Text>
                    <Text className="mt-2 text-sm text-gray-600">
                      Số cá hiện tại:{' '}
                      <Text className="font-semibold text-gray-900">
                        2200 con
                      </Text>
                    </Text>
                  </View>

                  <View className="mt-3 rounded-lg border border-gray-100 bg-white p-3">
                    {/* table simulated */}
                    <View className="mb-1 flex-row rounded bg-gray-50 p-2">
                      <Text className="flex-1 text-center text-xs font-medium text-gray-600">
                        Lần
                      </Text>
                      <Text className="flex-1 text-center text-xs font-medium text-gray-600">
                        Show
                      </Text>
                      <Text className="flex-1 text-center text-xs font-medium text-gray-600">
                        High
                      </Text>
                      <Text className="flex-1 text-center text-xs font-medium text-gray-600">
                        Pond
                      </Text>
                      <Text className="flex-1 text-center text-xs font-medium text-gray-600">
                        Cull
                      </Text>
                    </View>
                    {[1, 2, 3, 4].map((i) => (
                      <View
                        key={i}
                        className="flex-row border-b border-gray-100 py-1"
                      >
                        <Text className="flex-1 text-center text-xs text-gray-900">
                          {i}
                        </Text>
                        <Text className="flex-1 text-center text-xs text-gray-900">
                          0
                        </Text>
                        <Text className="flex-1 text-center text-xs text-gray-900">
                          0
                        </Text>
                        <Text className="flex-1 text-center text-xs text-gray-900">
                          1000
                        </Text>
                        <Text className="flex-1 text-center text-xs text-gray-900">
                          1000
                        </Text>
                      </View>
                    ))}

                    <View className="mt-3 flex-row justify-center">
                      <Text className="mr-4 mt-1 text-sm text-black">
                        Danh sách định danh
                      </Text>
                      <TouchableOpacity
                        className="flex-row items-center rounded-lg border border-gray-300 px-3 py-1"
                        onPress={() =>
                          router.push(`/breeding/${breeding.id}/fish-list`)
                        }
                      >
                        <Eye size={16} color="black" />
                        <Text className="ml-1 text-sm text-black">
                          Xem chi tiết
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="mt-4 flex-row border-t border-gray-200 pt-2">
                    <TouchableOpacity
                      className="mr-2 flex-1 flex-row items-center justify-center rounded-lg bg-yellow-400 py-2"
                      onPress={() => setShowSelectionModal(true)}
                    >
                      <Filter size={16} color="white" />
                      <Text className="ml-2 font-medium text-white">
                        Tuyển chọn lần 1
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center rounded-lg border border-gray-200 py-2"
                      onPress={() => router.push(`/breeding/${breeding.id}`)}
                    >
                      <Eye size={16} color="#6b7280" />
                      <Text className="ml-2 text-gray-700">Xem chi tiết</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {breeding.status === 'Hủy ghép cặp' && (
                <View>
                  <View className="rounded-lg bg-gray-50 p-3">
                    <Text className="text-sm text-gray-600">
                      Trạng thái:{' '}
                      <Text className="font-semibold text-gray-900">
                        Đã hủy
                      </Text>
                    </Text>
                    <Text className="mt-2 text-sm text-gray-600">
                      Lý do:{' '}
                      <Text className="font-semibold text-gray-900">
                        Kỹ thuật
                      </Text>
                    </Text>
                  </View>

                  <View className="mt-4 border-t border-gray-200 pt-2">
                    <TouchableOpacity
                      className="flex-row items-center justify-center rounded-lg border border-gray-200 py-2"
                      onPress={() => router.push(`/breeding/${breeding.id}`)}
                    >
                      <Eye size={16} color="#6b7280" />
                      <Text className="ml-2 text-gray-700">Chi tiết</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Count modal overlay */}
      <Modal
        visible={showCountModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-4">
          <View
            className="w-11/12 rounded-2xl bg-white"
            style={{ maxHeight: '75%' }}
          >
            <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
              <Text className="text-lg font-semibold">Đếm số lượng trứng</Text>
              <TouchableOpacity onPress={() => setShowCountModal(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text className="mb-2 text-sm text-gray-600">
                Chọn phương pháp đếm trứng phù hợp
              </Text>
              <ContextMenuField
                label="Phương pháp đếm"
                value={countMethod}
                options={['Đếm theo mẫu', 'Đếm theo trọng lượng']}
                onSelect={(v) => setCountMethod(v)}
                placeholder="Chọn phương pháp đếm"
              />

              {countMethod === 'Đếm theo mẫu' ? (
                <View>
                  <Text className="text-xs text-gray-500">
                    Tổng trọng lượng trứng (gram) *
                  </Text>
                  <TextInput
                    className="mb-2 rounded border border-gray-200 p-2"
                    value={totalWeight}
                    onChangeText={setTotalWeight}
                    placeholder="VD: 500"
                    keyboardType="numeric"
                  />
                  <Text className="text-xs text-gray-500">
                    Trọng lượng mẫu (gram) *
                  </Text>
                  <TextInput
                    className="mb-2 rounded border border-gray-200 p-2"
                    value={sampleWeight}
                    onChangeText={setSampleWeight}
                    placeholder="VD: 10"
                    keyboardType="numeric"
                  />
                  <Text className="text-xs text-gray-500">
                    Số trứng trong mẫu *
                  </Text>
                  <TextInput
                    className="mb-4 rounded border border-gray-200 p-2"
                    value={sampleCount}
                    onChangeText={setSampleCount}
                    placeholder="VD: 150"
                    keyboardType="numeric"
                  />
                </View>
              ) : (
                <View>
                  <Text className="text-xs text-gray-500">
                    Tổng trọng lượng trứng (gram) *
                  </Text>
                  <TextInput
                    className="mb-2 rounded border border-gray-200 p-2"
                    value={totalWeight}
                    onChangeText={setTotalWeight}
                    placeholder="VD: 500"
                    keyboardType="numeric"
                  />
                  <Text className="text-xs text-gray-500">
                    Trọng lượng trung bình 1 trứng (gram)
                  </Text>
                  <TextInput
                    className="mb-4 rounded border border-gray-200 p-2"
                    value={avgWeight}
                    onChangeText={setAvgWeight}
                    placeholder="VD: 0.067"
                    keyboardType="numeric"
                  />
                </View>
              )}
            </ScrollView>

            <View className="flex-row justify-between border-t border-gray-100 p-4">
              <TouchableOpacity
                className="rounded-lg border border-gray-200 px-4 py-2"
                onPress={() => setShowCountModal(false)}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-lg bg-primary px-4 py-2"
                onPress={() => {
                  // TODO: compute and save result
                  setShowCountModal(false);
                }}
              >
                <Text className="text-white">Lưu kết quả</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Transfer to fry modal */}
      <Modal
        visible={showTransferModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTransferModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 p-4">
          <View
            className="w-11/12 rounded-2xl bg-white"
            style={{ maxHeight: '60%' }}
          >
            <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
              <Text className="text-lg font-semibold">
                Chuyển sang giai đoạn nuôi cá bột
              </Text>
              <TouchableOpacity onPress={() => setShowTransferModal(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text className="mb-2 text-xs text-gray-500">
                Xác nhận trứng đã nở và chuyển sang nuôi cá bột
              </Text>
              <Text className="text-xs text-gray-500">
                Số lượng cá bột ước tính *
              </Text>
              <TextInput
                className="mb-3 rounded border border-gray-200 p-2"
                value={transferCount}
                onChangeText={setTransferCount}
                placeholder="VD: 5000"
                keyboardType="numeric"
              />

              <ContextMenuField
                label="Chọn hồ"
                value={selectedPondForTransfer}
                options={['Hồ A', 'Hồ B', 'Hồ C', 'Hồ D']}
                onSelect={(v) => setSelectedPondForTransfer(v)}
                placeholder="Chọn hồ"
              />
            </ScrollView>

            <View className="flex-row justify-between border-t border-gray-100 p-4">
              <View className="flex-row">
                <TouchableOpacity
                  className="mr-2 rounded-lg bg-green-600 px-4 py-2"
                  onPress={() => {
                    // TODO: perform transfer
                    setShowTransferModal(false);
                  }}
                >
                  <Text className="text-white">Chuyển giai đoạn</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="rounded-lg bg-indigo-600 px-4 py-2"
                  onPress={() => {
                    // TODO: open camera flow
                  }}
                >
                  <Text className="text-white">Đếm bằng camera</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Incubation modal overlay */}
      <Modal
        visible={showIncubationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIncubationModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 p-4">
          <View
            className="w-full max-w-2xl rounded-2xl bg-white"
            style={{ maxHeight: '80%' }}
          >
            <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
              <Text className="text-lg font-semibold">
                Ghi nhận thông số ấp trứng
              </Text>
              <TouchableOpacity onPress={() => setShowIncubationModal(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <View className="mb-3">
                <View className="mb-2 rounded bg-green-50 p-3">
                  <Text className="text-sm text-green-700">
                    Số trứng khỏe mạnh
                  </Text>
                  <TextInput
                    className="mt-2 rounded border border-green-200 p-2"
                    value={healthyEggs}
                    onChangeText={setHealthyEggs}
                    keyboardType="numeric"
                  />
                  <Text className="mt-1 text-xs text-green-500">
                    Trứng trong suốt, có phôi thai phát triển
                  </Text>
                </View>

                <View className="mb-2 rounded bg-orange-50 p-3">
                  <Text className="text-sm text-orange-600">Số trứng hỏng</Text>
                  <TextInput
                    className="mt-2 rounded border border-orange-200 p-2"
                    value={badEggs}
                    onChangeText={setBadEggs}
                    keyboardType="numeric"
                  />
                  <Text className="mt-1 text-xs text-orange-500">
                    Trứng đục, nằm mốc hoặc không phát triển
                  </Text>
                </View>

                <View className="mb-2 rounded bg-blue-50 p-3">
                  <Text className="text-sm text-blue-700">Số trứng đã nở</Text>
                  <TextInput
                    className="mt-2 rounded border border-blue-200 p-2"
                    value={hatchedEggs}
                    onChangeText={setHatchedEggs}
                    keyboardType="numeric"
                  />
                  <Text className="mt-1 text-xs text-blue-500">
                    Cá bột mới nở, còn túi noãn hoàng
                  </Text>
                </View>
              </View>

              <Text className="mb-1 text-sm font-medium">
                Điều kiện môi trường:
              </Text>
              <Text className="text-xs text-gray-500">
                Nhiệt độ nước (°C) *
              </Text>
              <TextInput
                className="mb-2 rounded border border-gray-200 p-2"
                value={waterTemp}
                onChangeText={setWaterTemp}
                placeholder="VD: 23"
                keyboardType="numeric"
              />
              <Text className="text-xs text-gray-500">pH *</Text>
              <TextInput
                className="mb-2 rounded border border-gray-200 p-2"
                value={ph}
                onChangeText={setPh}
                placeholder="VD: 7.2"
                keyboardType="numeric"
              />
              <Text className="text-xs text-gray-500">
                Oxy hòa tan (mg/L) *
              </Text>
              <TextInput
                className="mb-4 rounded border border-gray-200 p-2"
                value={oxygen}
                onChangeText={setOxygen}
                placeholder="VD: 6.5"
                keyboardType="numeric"
              />
            </ScrollView>

            <View className="flex-row justify-between border-t border-gray-100 p-4">
              <TouchableOpacity
                className="rounded-lg border border-gray-200 px-4 py-2"
                onPress={() => setShowIncubationModal(false)}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-lg bg-primary px-4 py-2"
                onPress={() => {
                  // TODO: validate & save incubation data
                  setShowIncubationModal(false);
                }}
              >
                <Text className="text-white">Lưu thông số</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fry update modal */}
      <Modal
        visible={showFryUpdateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFryUpdateModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-4">
          <View
            className="w-11/12 rounded-2xl bg-white"
            style={{ maxHeight: '40%' }}
          >
            <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
              <Text className="text-lg font-semibold">
                Cập nhật thông tin cá bột
              </Text>
              <TouchableOpacity onPress={() => setShowFryUpdateModal(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="p-4">
              <Text className="mb-2 text-sm text-gray-600">
                Ghi nhận tình trạng và số lượng cá bột
              </Text>
              <Text className="text-xs text-gray-500">Số lượng hiện tại *</Text>
              <TextInput
                className="mb-4 rounded border border-gray-200 p-2"
                value={currentFryCount}
                onChangeText={setCurrentFryCount}
                placeholder="VD: 4500"
                keyboardType="numeric"
              />
            </View>

            <View className="flex-row justify-between border-t border-gray-100 p-4">
              <TouchableOpacity
                className="rounded-lg border border-gray-200 px-4 py-2"
                onPress={() => setShowFryUpdateModal(false)}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-lg bg-primary px-4 py-2"
                onPress={() => {
                  // TODO: save fry count to backend/state
                  setShowFryUpdateModal(false);
                }}
              >
                <Text className="text-white">Cập nhật</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Selection modal (Tuyển chọn) */}
      <Modal
        visible={showSelectionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSelectionModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-4">
          <View
            className="w-11/12 rounded-2xl bg-white"
            style={{ maxHeight: '55%' }}
          >
            <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
              <Text className="text-lg font-semibold">Tuyển chọn cá</Text>
              <TouchableOpacity onPress={() => setShowSelectionModal(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <View className="mb-3 rounded bg-blue-50 p-3">
                <Text className="text-sm font-semibold text-blue-700">
                  Thông tin hiện tại
                </Text>
                <Text className="mt-2 text-sm text-gray-700">
                  Số cá có sẵn: <Text className="font-semibold">2200 con</Text>
                </Text>
                <Text className="text-sm text-gray-700">
                  Tuổi cá: <Text className="font-semibold">75 ngày</Text>
                </Text>
              </View>

              <View className="rounded bg-green-50 p-3">
                <Text className="mb-2 text-sm text-gray-700">
                  Số lượng tuyển chọn
                </Text>
                <TextInput
                  className="rounded border border-green-200 p-2"
                  value={selectionCount}
                  onChangeText={setSelectionCount}
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <View className="flex-row justify-between border-t border-gray-100 p-4">
              <TouchableOpacity
                className="rounded-lg border border-gray-200 px-4 py-2"
                onPress={() => setShowSelectionModal(false)}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-lg bg-primary px-4 py-2"
                onPress={() => {
                  // TODO: save selection results
                  setShowSelectionModal(false);
                }}
              >
                <Text className="text-white">Lưu kết quả tuyển chọn</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
