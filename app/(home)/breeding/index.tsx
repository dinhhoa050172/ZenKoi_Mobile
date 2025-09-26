import { useRouter } from "expo-router";
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
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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
    | "Đang ghép cặp"
    | "Ấp trứng"
    | "Nuôi cá bột"
    | "Tuyển chọn"
    | "Hủy ghép cặp";
}

export default function BreedingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("Tất cả bể cá");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showCountModal, setShowCountModal] = useState(false);
  const [countMethod, setCountMethod] = useState("Đếm theo mẫu");

  const [totalWeight, setTotalWeight] = useState("");
  const [sampleWeight, setSampleWeight] = useState("");
  const [sampleCount, setSampleCount] = useState("");
  const [avgWeight, setAvgWeight] = useState("");
  const [showIncubationModal, setShowIncubationModal] = useState(false);
  const [healthyEggs, setHealthyEggs] = useState("");
  const [badEggs, setBadEggs] = useState("");
  const [hatchedEggs, setHatchedEggs] = useState("");
  const [waterTemp, setWaterTemp] = useState("");
  const [ph, setPh] = useState("");
  const [oxygen, setOxygen] = useState("");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferCount, setTransferCount] = useState("");
  const [selectedPondForTransfer, setSelectedPondForTransfer] =
    useState("Hồ A");
  const [showFryUpdateModal, setShowFryUpdateModal] = useState(false);
  const [currentFryCount, setCurrentFryCount] = useState("");
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectionCount, setSelectionCount] = useState("");

  const filterOptions = ["Tất cả bể cá", "Đang sinh sản", "Hoàn thành", "Hủy"];

  const breedingData: BreedingData[] = [
    {
      id: "1",
      code: "BC-001",
      name: "Sakura × Yuki",
      maleFish: "Kohaku",
      femaleFish: "Sanke",
      pond: "Hồ A",
      eggCount: 800,
      temperature: 22,
      survivalRate: 85,
      daysLeft: 12,
      status: "Đang ghép cặp",
    },
    {
      id: "2",
      code: "BC-002",
      name: "Tancho × Showa",
      maleFish: "Tancho",
      femaleFish: "Showa",
      pond: "Hồ B",
      eggCount: 650,
      temperature: 23,
      survivalRate: 78,
      daysLeft: 8,
      status: "Ấp trứng",
    },
    {
      id: "3",
      code: "BC-003",
      name: "Asagi × Kohaku",
      maleFish: "Asagi",
      femaleFish: "Kohaku",
      pond: "Hồ C",
      eggCount: 1200,
      temperature: 21,
      survivalRate: 72,
      daysLeft: 0,
      status: "Tuyển chọn",
    },
    {
      id: "4",
      code: "BC-004",
      name: "Yamabuki × Ginrin",
      maleFish: "Yamabuki",
      femaleFish: "Ginrin",
      pond: "Hồ D",
      eggCount: 950,
      temperature: 20,
      survivalRate: 0,
      daysLeft: 0,
      status: "Hủy ghép cặp",
    },
    {
      id: "5",
      code: "BC-005",
      name: "Kenzo × Mei",
      maleFish: "Kenzo",
      femaleFish: "Mei",
      pond: "Hồ C",
      eggCount: 1800,
      temperature: 21,
      survivalRate: 72,
      daysLeft: 45,
      status: "Nuôi cá bột",
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
          <Text className="text-base font-medium text-gray-900 mb-2">
            {label}
          </Text>
          <TouchableOpacity
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
            onPress={() => setShowDialog(true)}
          >
            <Text
              className={`${value && value !== placeholder ? "text-gray-900" : "text-gray-500"}`}
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
          <View className="flex-1 bg-black/50 justify-center items-center p-4">
            <View className="bg-white rounded-2xl w-full max-w-sm">
              <View className="p-4 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-900 text-center">
                  Chọn {label.toLowerCase()}
                </Text>
              </View>
              <ScrollView className="max-h-80">
                {options.map((opt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    className={`px-4 py-4 flex-row items-center ${idx < options.length - 1 ? "border-b border-gray-100" : ""}`}
                    onPress={() => {
                      onSelect(opt);
                      setShowDialog(false);
                    }}
                  >
                    <View
                      className={`w-5 h-5 rounded-full border-2 mr-3 ${value === opt ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}
                    ></View>
                    <Text
                      className={`flex-1 ${value === opt ? "text-blue-600 font-medium" : "text-gray-900"}`}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View className="p-4 border-t border-gray-200">
                <TouchableOpacity
                  className="bg-gray-100 rounded-lg py-3"
                  onPress={() => setShowDialog(false)}
                >
                  <Text className="text-center text-gray-700 font-medium">
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
      case "Đang ghép cặp":
        return "#3b82f6"; // blue
      case "Ấp trứng":
        return "#f59e0b"; // amber
      case "Nuôi cá bột":
        return "#10b981"; // green
      case "Tuyển chọn":
        return "#6366f1"; // indigo
      case "Hủy ghép cặp":
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
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
        <View className="mb-4 relative">
          <TouchableOpacity
            className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex-row items-center justify-between"
            onPress={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <Text className="text-gray-900">{selectedFilter}</Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>

          {showFilterDropdown && (
            <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl mt-1 z-10 shadow-lg">
              {filterOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  className={`px-4 py-3 ${index < filterOptions.length - 1 ? "border-b border-gray-100" : ""}`}
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
          <TouchableOpacity className="rounded-lg px-3 py-2 border border-gray-300">
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
          const badgeBg = color + "20";

          return (
            <View
              key={breeding.id}
              className="bg-white rounded-2xl px-4 py-2 mb-4 shadow-sm"
            >
              {/* Header */}
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold text-gray-900">
                  {breeding.code}
                </Text>
                <View
                  className="px-2 py-1 rounded-full"
                  style={{ backgroundColor: badgeBg }}
                >
                  <Text className="text-xs font-medium" style={{ color }}>
                    {getStatusText(breeding.status)}
                  </Text>
                </View>
              </View>

              {/* Common top info */}
              <View className="mb-3">
                <View className="flex-row items-center justify-between mb-2">
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
                  <View className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  <Text className="text-sm text-gray-600">
                    Đang ở {breeding.pond}
                  </Text>
                </View>
              </View>

              {/* Variants by status */}
              {breeding.status === "Đang ghép cặp" && (
                <View>
                  <View className="flex-row flex-wrap">
                    <View className="w-1/2 mb-2">
                      <Text className="text-xs text-gray-500">
                        Giai đoạn hiện tại
                      </Text>
                      <Text className="text-sm font-semibold text-gray-900">
                        Ghép cặp
                      </Text>
                    </View>
                    <View className="w-1/2 mb-2">
                      <Text className="text-xs text-gray-500">Số ngày</Text>
                      <Text className="text-sm font-semibold text-gray-900">
                        {breeding.daysLeft} ngày
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row mt-4 pt-2 border-t border-gray-200">
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center py-2 mr-2 bg-green-600 rounded-lg"
                      onPress={() => {
                        /* Cập nhật: Đã đẻ */
                      }}
                    >
                      <Text className="text-white font-medium">
                        Cập nhật: Đã đẻ
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center py-2 ml-2 border border-gray-200 rounded-lg"
                      onPress={() => router.push(`/breeding/${breeding.id}`)}
                    >
                      <Eye size={16} color="#6b7280" />
                      <Text className="text-gray-600 text-sm ml-2">
                        Chi tiết
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {breeding.status === "Ấp trứng" && (
                <View>
                  <View className="bg-gray-50 rounded-lg p-3">
                    <Text className="text-sm text-gray-600">
                      Số trứng:{" "}
                      <Text className="font-semibold text-gray-900">
                        Chưa đếm
                      </Text>{" "}
                      Tỷ lệ thụ tinh:{" "}
                      <Text className="font-semibold text-gray-900">85%</Text>
                    </Text>
                    <Text className="text-sm text-gray-600 mt-2">
                      Số ngày ấp:{" "}
                      <Text className="font-semibold text-gray-900">
                        15 ngày
                      </Text>
                    </Text>
                  </View>

                  <View className="mt-3">
                    <View className="flex-row justify-between">
                      <View className="bg-green-50 rounded p-3 flex-1 mr-2 items-center">
                        <Text className="text-sm font-medium text-green-700">
                          Khỏe
                        </Text>
                        <Text className="text-xl font-bold text-green-700">
                          0
                        </Text>
                      </View>
                      <View className="bg-orange-50 rounded p-3 flex-1 mr-2 items-center">
                        <Text className="text-sm font-medium text-orange-600">
                          Hỏng
                        </Text>
                        <Text className="text-xl font-bold text-orange-600">
                          0
                        </Text>
                      </View>
                      <View className="bg-purple-50 rounded p-3 flex-1 items-center">
                        <Text className="text-sm font-medium text-purple-600">
                          Đã nở
                        </Text>
                        <Text className="text-xl font-bold text-purple-600">
                          0
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="mt-4 pt-2 border-t border-gray-200">
                    <View className="flex-row mb-2">
                      <TouchableOpacity
                        className="flex-1 py-2 mr-2 rounded-lg flex-row items-center justify-center"
                        style={{ backgroundColor: "#fb923c" }}
                        onPress={() => setShowCountModal(true)}
                      >
                        <Egg size={16} color="white" />
                        <Text className="text-white font-medium ml-2">
                          Đếm trứng
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 py-2 rounded-lg flex-row items-center justify-center"
                        style={{ backgroundColor: "#2563eb" }}
                        onPress={() => setShowIncubationModal(true)}
                      >
                        <Thermometer size={16} color="white" />
                        <Text className="text-white font-medium ml-2">
                          Ghi nhận ấp trứng
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View className="flex-row">
                      <TouchableOpacity
                        className="flex-1 py-2 mr-2 rounded-lg flex-row items-center justify-center"
                        style={{ backgroundColor: "#10b981" }}
                        onPress={() => setShowTransferModal(true)}
                      >
                        <MoveRight size={16} color="white" />
                        <Text className="text-white font-medium ml-2">
                          Chuyển nuôi cá bột
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 py-2 items-center justify-center rounded-lg border border-gray-200 flex-row"
                        onPress={() => router.push(`/breeding/${breeding.id}`)}
                      >
                        <Eye size={16} color="#6b7280" />
                        <Text className="text-sm text-gray-700 ml-2">
                          Xem chi tiết
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {breeding.status === "Nuôi cá bột" && (
                <View>
                  <View className="bg-gray-50 rounded-lg p-3">
                    <Text className="text-sm text-gray-600">
                      Cá bột:{" "}
                      <Text className="font-semibold text-gray-900">
                        {breeding.eggCount} con
                      </Text>{" "}
                      Tỷ lệ sống:{" "}
                      <Text className="font-semibold text-gray-900">
                        {breeding.survivalRate}%
                      </Text>
                    </Text>
                    <Text className="text-sm text-gray-600 mt-2">
                      Tuổi:{" "}
                      <Text className="font-semibold text-gray-900">
                        45 ngày
                      </Text>
                    </Text>
                  </View>

                  <View className="mt-3 bg-white rounded-lg p-3 border border-gray-100">
                    <View className="flex-row mb-2">
                      <Text className="text-sm text-pink-600 flex-1 text-center">
                        7 ngày
                      </Text>
                      <Text className="text-sm text-orange-500 flex-1 text-center">
                        14 ngày
                      </Text>
                      <Text className="text-sm text-yellow-500 flex-1 text-center">
                        30 ngày
                      </Text>
                      <Text className="text-sm text-blue-500 flex-1 text-center">
                        Hiện tại
                      </Text>
                    </View>
                    <View className="flex-row">
                      <Text className="text-sm text-gray-900 flex-1 text-center">
                        92%
                      </Text>
                      <Text className="text-sm text-gray-900 flex-1 text-center">
                        85%
                      </Text>
                      <Text className="text-sm text-gray-900 flex-1 text-center">
                        78%
                      </Text>
                      <Text className="text-sm text-gray-900 flex-1 text-center">
                        72%
                      </Text>
                    </View>
                  </View>

                  <View className="mt-4 pt-2 border-t border-gray-200">
                    <View className="flex-row space-x-2 mb-2">
                      <TouchableOpacity
                        className="flex-1 py-2 mr-2 rounded-lg bg-purple-600 flex-row items-center justify-center"
                        onPress={() => setShowFryUpdateModal(true)}
                      >
                        <Fish size={16} color="white" />
                        <Text className="text-white font-medium ml-2">
                          Cập nhật cá bột
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 py-2 rounded-lg bg-indigo-600 flex-row items-center justify-center"
                        onPress={() => {
                          /* TODO: open camera counting flow */
                        }}
                      >
                        <Camera size={16} color="white" />
                        <Text className="text-white font-medium ml-2">
                          Đếm bằng camera
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View>
                      <TouchableOpacity
                        className="w-full py-2 rounded-lg border border-gray-200 flex-row items-center justify-center"
                        onPress={() => router.push(`/breeding/${breeding.id}`)}
                      >
                        <Eye size={16} color="#6b7280" />
                        <Text className="text-gray-700 ml-2">Chi tiết</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {breeding.status === "Tuyển chọn" && (
                <View>
                  <View className="bg-gray-50 rounded-lg p-3">
                    <Text className="text-sm text-gray-600">
                      Tuổi cá:{" "}
                      <Text className="font-semibold text-gray-900">
                        75 ngày
                      </Text>{" "}
                      Đã tuyển chọn:{" "}
                      <Text className="font-semibold text-gray-900">0 đợt</Text>
                    </Text>
                    <Text className="text-sm text-gray-600 mt-2">
                      Số cá hiện tại:{" "}
                      <Text className="font-semibold text-gray-900">
                        2200 con
                      </Text>
                    </Text>
                  </View>

                  <View className="mt-3 bg-white rounded-lg p-3 border border-gray-100">
                    {/* table simulated */}
                    <View className="flex-row bg-gray-50 p-2 rounded mb-1">
                      <Text className="text-xs font-medium text-gray-600 flex-1 text-center">
                        Lần
                      </Text>
                      <Text className="text-xs font-medium text-gray-600 flex-1 text-center">
                        Show
                      </Text>
                      <Text className="text-xs font-medium text-gray-600 flex-1 text-center">
                        High
                      </Text>
                      <Text className="text-xs font-medium text-gray-600 flex-1 text-center">
                        Pond
                      </Text>
                      <Text className="text-xs font-medium text-gray-600 flex-1 text-center">
                        Cull
                      </Text>
                    </View>
                    {[1, 2, 3, 4].map((i) => (
                      <View
                        key={i}
                        className="flex-row py-1 border-b border-gray-100"
                      >
                        <Text className="text-xs text-gray-900 flex-1 text-center">
                          {i}
                        </Text>
                        <Text className="text-xs text-gray-900 flex-1 text-center">
                          0
                        </Text>
                        <Text className="text-xs text-gray-900 flex-1 text-center">
                          0
                        </Text>
                        <Text className="text-xs text-gray-900 flex-1 text-center">
                          1000
                        </Text>
                        <Text className="text-xs text-gray-900 flex-1 text-center">
                          1000
                        </Text>
                      </View>
                    ))}

                    <View className="flex-row justify-center mt-3">
                      <Text className="text-sm text-black mr-4 mt-1">
                        Danh sách định danh
                      </Text>
                      <TouchableOpacity
                        className="flex-row items-center border border-gray-300 rounded-lg px-3 py-1"
                        onPress={() =>
                          router.push(
                            `/breeding/fish-list?from=breeding-detail&breedingId=${breeding.id}`
                          )
                        }
                      >
                        <Eye size={16} color="black" />
                        <Text className="text-sm text-black ml-1">
                          Xem chi tiết
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="flex-row mt-4 pt-2 border-t border-gray-200">
                    <TouchableOpacity className="flex-1 py-2 mr-2 rounded-lg bg-yellow-400 flex-row items-center justify-center" onPress={() => setShowSelectionModal(true)}>
                      <Filter size={16} color="white" />
                      <Text className="text-white font-medium ml-2">
                        Tuyển chọn lần 1
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 py-2 rounded-lg border border-gray-200 items-center flex-row justify-center"
                      onPress={() => router.push(`/breeding/${breeding.id}`)}
                    >
                      <Eye size={16} color="#6b7280" />
                      <Text className="text-gray-700 ml-2">Xem chi tiết</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {breeding.status === "Hủy ghép cặp" && (
                <View>
                  <View className="bg-gray-50 rounded-lg p-3">
                    <Text className="text-sm text-gray-600">
                      Trạng thái:{" "}
                      <Text className="font-semibold text-gray-900">
                        Đã hủy
                      </Text>
                    </Text>
                    <Text className="text-sm text-gray-600 mt-2">
                      Lý do:{" "}
                      <Text className="font-semibold text-gray-900">
                        Kỹ thuật
                      </Text>
                    </Text>
                  </View>

                  <View className="mt-4 pt-2 border-t border-gray-200">
                    <TouchableOpacity
                      className="py-2 rounded-lg border border-gray-200 items-center flex-row justify-center"
                      onPress={() => router.push(`/breeding/${breeding.id}`)}
                    >
                      <Eye size={16} color="#6b7280" />
                      <Text className="text-gray-700 ml-2">Chi tiết</Text>
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
        <View className="flex-1 bg-black/40 items-center justify-center px-4">
          <View
            className="w-11/12 bg-white rounded-2xl"
            style={{ maxHeight: "75%" }}
          >
            <View className="p-4 border-b border-gray-100 flex-row items-center justify-between">
              <Text className="text-lg font-semibold">Đếm số lượng trứng</Text>
              <TouchableOpacity onPress={() => setShowCountModal(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text className="text-sm text-gray-600 mb-2">
                Chọn phương pháp đếm trứng phù hợp
              </Text>
              <ContextMenuField
                label="Phương pháp đếm"
                value={countMethod}
                options={["Đếm theo mẫu", "Đếm theo trọng lượng"]}
                onSelect={(v) => setCountMethod(v)}
                placeholder="Chọn phương pháp đếm"
              />

              {countMethod === "Đếm theo mẫu" ? (
                <View>
                  <Text className="text-xs text-gray-500">
                    Tổng trọng lượng trứng (gram) *
                  </Text>
                  <TextInput
                    className="border border-gray-200 rounded p-2 mb-2"
                    value={totalWeight}
                    onChangeText={setTotalWeight}
                    placeholder="VD: 500"
                    keyboardType="numeric"
                  />
                  <Text className="text-xs text-gray-500">
                    Trọng lượng mẫu (gram) *
                  </Text>
                  <TextInput
                    className="border border-gray-200 rounded p-2 mb-2"
                    value={sampleWeight}
                    onChangeText={setSampleWeight}
                    placeholder="VD: 10"
                    keyboardType="numeric"
                  />
                  <Text className="text-xs text-gray-500">
                    Số trứng trong mẫu *
                  </Text>
                  <TextInput
                    className="border border-gray-200 rounded p-2 mb-4"
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
                    className="border border-gray-200 rounded p-2 mb-2"
                    value={totalWeight}
                    onChangeText={setTotalWeight}
                    placeholder="VD: 500"
                    keyboardType="numeric"
                  />
                  <Text className="text-xs text-gray-500">
                    Trọng lượng trung bình 1 trứng (gram)
                  </Text>
                  <TextInput
                    className="border border-gray-200 rounded p-2 mb-4"
                    value={avgWeight}
                    onChangeText={setAvgWeight}
                    placeholder="VD: 0.067"
                    keyboardType="numeric"
                  />
                </View>
              )}
            </ScrollView>

            <View className="p-4 border-t border-gray-100 flex-row justify-between">
              <TouchableOpacity
                className="px-4 py-2 rounded-lg border border-gray-200"
                onPress={() => setShowCountModal(false)}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 rounded-lg bg-primary"
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
        <View className="flex-1 bg-black/40 items-center justify-center p-4">
          <View
            className="w-11/12 bg-white rounded-2xl"
            style={{ maxHeight: "60%" }}
          >
            <View className="p-4 border-b border-gray-100 flex-row items-center justify-between">
              <Text className="text-lg font-semibold">
                Chuyển sang giai đoạn nuôi cá bột
              </Text>
              <TouchableOpacity onPress={() => setShowTransferModal(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text className="text-xs text-gray-500 mb-2">
                Xác nhận trứng đã nở và chuyển sang nuôi cá bột
              </Text>
              <Text className="text-xs text-gray-500">
                Số lượng cá bột ước tính *
              </Text>
              <TextInput
                className="border border-gray-200 rounded p-2 mb-3"
                value={transferCount}
                onChangeText={setTransferCount}
                placeholder="VD: 5000"
                keyboardType="numeric"
              />

              <ContextMenuField
                label="Chọn hồ"
                value={selectedPondForTransfer}
                options={["Hồ A", "Hồ B", "Hồ C", "Hồ D"]}
                onSelect={(v) => setSelectedPondForTransfer(v)}
                placeholder="Chọn hồ"
              />
            </ScrollView>

            <View className="p-4 border-t border-gray-100 flex-row justify-between">
              <View className="flex-row">
                <TouchableOpacity
                  className="px-4 py-2 rounded-lg bg-green-600 mr-2"
                  onPress={() => {
                    // TODO: perform transfer
                    setShowTransferModal(false);
                  }}
                >
                  <Text className="text-white">Chuyển giai đoạn</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-2 rounded-lg bg-indigo-600"
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
        <View className="flex-1 bg-black/40 items-center justify-center p-4">
          <View
            className="w-full max-w-2xl bg-white rounded-2xl"
            style={{ maxHeight: "80%" }}
          >
            <View className="p-4 border-b border-gray-100 flex-row items-center justify-between">
              <Text className="text-lg font-semibold">
                Ghi nhận thông số ấp trứng
              </Text>
              <TouchableOpacity onPress={() => setShowIncubationModal(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <View className="mb-3">
                <View className="bg-green-50 rounded p-3 mb-2">
                  <Text className="text-sm text-green-700">
                    Số trứng khỏe mạnh
                  </Text>
                  <TextInput
                    className="border border-green-200 rounded p-2 mt-2"
                    value={healthyEggs}
                    onChangeText={setHealthyEggs}
                    keyboardType="numeric"
                  />
                  <Text className="text-xs text-green-500 mt-1">
                    Trứng trong suốt, có phôi thai phát triển
                  </Text>
                </View>

                <View className="bg-orange-50 rounded p-3 mb-2">
                  <Text className="text-sm text-orange-600">Số trứng hỏng</Text>
                  <TextInput
                    className="border border-orange-200 rounded p-2 mt-2"
                    value={badEggs}
                    onChangeText={setBadEggs}
                    keyboardType="numeric"
                  />
                  <Text className="text-xs text-orange-500 mt-1">
                    Trứng đục, nằm mốc hoặc không phát triển
                  </Text>
                </View>

                <View className="bg-blue-50 rounded p-3 mb-2">
                  <Text className="text-sm text-blue-700">Số trứng đã nở</Text>
                  <TextInput
                    className="border border-blue-200 rounded p-2 mt-2"
                    value={hatchedEggs}
                    onChangeText={setHatchedEggs}
                    keyboardType="numeric"
                  />
                  <Text className="text-xs text-blue-500 mt-1">
                    Cá bột mới nở, còn túi noãn hoàng
                  </Text>
                </View>
              </View>

              <Text className="text-sm font-medium mb-1">
                Điều kiện môi trường:
              </Text>
              <Text className="text-xs text-gray-500">
                Nhiệt độ nước (°C) *
              </Text>
              <TextInput
                className="border border-gray-200 rounded p-2 mb-2"
                value={waterTemp}
                onChangeText={setWaterTemp}
                placeholder="VD: 23"
                keyboardType="numeric"
              />
              <Text className="text-xs text-gray-500">pH *</Text>
              <TextInput
                className="border border-gray-200 rounded p-2 mb-2"
                value={ph}
                onChangeText={setPh}
                placeholder="VD: 7.2"
                keyboardType="numeric"
              />
              <Text className="text-xs text-gray-500">
                Oxy hòa tan (mg/L) *
              </Text>
              <TextInput
                className="border border-gray-200 rounded p-2 mb-4"
                value={oxygen}
                onChangeText={setOxygen}
                placeholder="VD: 6.5"
                keyboardType="numeric"
              />
            </ScrollView>

            <View className="p-4 border-t border-gray-100 flex-row justify-between">
              <TouchableOpacity
                className="px-4 py-2 rounded-lg border border-gray-200"
                onPress={() => setShowIncubationModal(false)}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 rounded-lg bg-primary"
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
        <View className="flex-1 bg-black/40 items-center justify-center px-4">
          <View
            className="w-11/12 bg-white rounded-2xl"
            style={{ maxHeight: "40%" }}
          >
            <View className="p-4 border-b border-gray-100 flex-row items-center justify-between">
              <Text className="text-lg font-semibold">
                Cập nhật thông tin cá bột
              </Text>
              <TouchableOpacity onPress={() => setShowFryUpdateModal(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="p-4">
              <Text className="text-sm text-gray-600 mb-2">
                Ghi nhận tình trạng và số lượng cá bột
              </Text>
              <Text className="text-xs text-gray-500">Số lượng hiện tại *</Text>
              <TextInput
                className="border border-gray-200 rounded p-2 mb-4"
                value={currentFryCount}
                onChangeText={setCurrentFryCount}
                placeholder="VD: 4500"
                keyboardType="numeric"
              />
            </View>

            <View className="p-4 border-t border-gray-100 flex-row justify-between">
              <TouchableOpacity
                className="px-4 py-2 rounded-lg border border-gray-200"
                onPress={() => setShowFryUpdateModal(false)}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 rounded-lg bg-primary"
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
        <View className="flex-1 bg-black/40 items-center justify-center px-4">
          <View className="w-11/12 bg-white rounded-2xl" style={{ maxHeight: '55%' }}>
            <View className="p-4 border-b border-gray-100 flex-row items-center justify-between">
              <Text className="text-lg font-semibold">Tuyển chọn cá</Text>
              <TouchableOpacity onPress={() => setShowSelectionModal(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <View className="bg-blue-50 rounded p-3 mb-3">
                <Text className="text-sm font-semibold text-blue-700">Thông tin hiện tại</Text>
                <Text className="text-sm text-gray-700 mt-2">Số cá có sẵn: <Text className="font-semibold">2200 con</Text></Text>
                <Text className="text-sm text-gray-700">Tuổi cá: <Text className="font-semibold">75 ngày</Text></Text>
              </View>

              <View className="bg-green-50 rounded p-3">
                <Text className="text-sm text-gray-700 mb-2">Số lượng tuyển chọn</Text>
                <TextInput className="border border-green-200 rounded p-2" value={selectionCount} onChangeText={setSelectionCount} keyboardType="numeric" />
              </View>
            </ScrollView>

            <View className="p-4 border-t border-gray-100 flex-row justify-between">
              <TouchableOpacity className="px-4 py-2 rounded-lg border border-gray-200" onPress={() => setShowSelectionModal(false)}>
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 rounded-lg bg-primary"
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
