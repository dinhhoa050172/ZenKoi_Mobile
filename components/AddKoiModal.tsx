import { Camera, ChevronDown, X } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActionSheetIOS,
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FishSvg from "./icons/FishSvg";

interface AddKoiModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (koiData: KoiFormData) => void;
}

export interface KoiFormData {
  name: string;
  rfid: string;
  breed: string;
  gender: string;
  age: string;
  length: string;
  weight: string;
  pond: string;
  type: string;
  notes: string;
  image?: string;
}

const AddKoiModal: React.FC<AddKoiModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<KoiFormData>({
    name: "",
    rfid: "",
    breed: "",
    gender: "",
    age: "",
    length: "",
    weight: "",
    pond: "",
    type: "",
    notes: "",
    image: undefined,
  });



  const breedOptions = [
    "Chọn giống",
    "Kohaku",
    "Sanke",
    "Showa",
    "Tancho",
    "Chagoi",
    "Ogon",
    "Asagi",
    "Shusui",
  ];
  const genderOptions = ["Chọn giới tính", "Đực", "Cái", "Chưa xác định"];
  const pondOptions = ["Chọn bể cá", "Bể A", "Bể B", "Bể C", "Bể D"];
  const typeOptions = ["Show", "High"];

  const checkPermissionAndPickImage = async () => {
    if (Platform.OS === 'ios') {
      // iOS - sử dụng ActionSheet
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Hủy', 'Chọn từ thư viện', 'Chụp ảnh'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            // Chọn từ thư viện
            pickImageFromLibrary();
          } else if (buttonIndex === 2) {
            // Chụp ảnh
            takePhoto();
          }
        }
      );
    } else {
      // Android - hiển thị alert
      Alert.alert(
        'Chọn ảnh',
        'Bạn muốn chọn ảnh từ đâu?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Thư viện', onPress: pickImageFromLibrary },
          { text: 'Chụp ảnh', onPress: takePhoto },
        ]
      );
    }
  };

  const pickImageFromLibrary = () => {
    // TODO: Implement expo-image-picker for library
    Alert.alert('Thông báo', 'Chức năng chọn từ thư viện sẽ được thêm sau');
    // Tạm thời set một ảnh placeholder
    setFormData({ ...formData, image: 'https://via.placeholder.com/200x200/0A3D62/FFFFFF?text=Koi' });
  };

  const takePhoto = () => {
    // TODO: Implement expo-image-picker for camera
    Alert.alert('Thông báo', 'Chức năng chụp ảnh sẽ được thêm sau');
    // Tạm thời set một ảnh placeholder
    setFormData({ ...formData, image: 'https://via.placeholder.com/200x200/0A3D62/FFFFFF?text=Photo' });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên cá");
      return;
    }
    onSave(formData);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      rfid: "",
      breed: "",
      gender: "",
      age: "",
      length: "",
      weight: "",
      pond: "",
      type: "",
      notes: "",
      image: undefined,
    });
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

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
    onSelect: (value: string) => void;
    placeholder: string;
  }) => {
    const [showDialog, setShowDialog] = useState(false);

    return (
      <>
        <View className="mb-4">
          <Text className="text-base font-medium text-gray-900 mb-2">{label}</Text>
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

        {/* Selection Dialog Modal */}
        <Modal
          visible={showDialog}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDialog(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center p-4">
            <View className="bg-white rounded-2xl w-full max-w-sm">
              {/* Dialog Header */}
              <View className="p-4 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-900 text-center">
                  Chọn {label.toLowerCase()}
                </Text>
              </View>
              
              {/* Options List */}
              <ScrollView className="max-h-80">
                {options.filter(opt => opt !== placeholder).map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`px-4 py-4 flex-row items-center ${
                      index < options.filter(opt => opt !== placeholder).length - 1 
                        ? 'border-b border-gray-100' 
                        : ''
                    }`}
                    onPress={() => {
                      onSelect(option);
                      setShowDialog(false);
                    }}
                  >
                    <View className={`w-5 h-5 rounded-full border-2 mr-3 ${
                      value === option 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {value === option && (
                        <View className="w-full h-full rounded-full bg-white border-2 border-blue-500" />
                      )}
                    </View>
                    <Text className={`flex-1 ${
                      value === option ? 'text-blue-600 font-medium' : 'text-gray-900'
                    }`}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {/* Dialog Footer */}
              <View className="p-4 border-t border-gray-200">
                <TouchableOpacity
                  className="bg-gray-100 rounded-lg py-3"
                  onPress={() => setShowDialog(false)}
                >
                  <Text className="text-center text-gray-700 font-medium">Hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900">
            <FishSvg /> Thêm cá Koi mới
          </Text>
          <TouchableOpacity className="p-1" onPress={handleCancel}>
            <X size={24} color="red" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Image Upload */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-900 mb-2">
              Ảnh cá
            </Text>
            <TouchableOpacity
              className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 items-center justify-center"
              onPress={checkPermissionAndPickImage}
            >
              {formData.image ? (
                <Image
                  source={{ uri: formData.image }}
                  className="w-24 h-24 rounded-lg"
                />
              ) : (
                <View className="items-center">
                  <Camera size={32} color="#9ca3af" />
                  <Text className="text-gray-600 text-center">
                    Chụp ảnh hoặc chọn từ thư viện
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Name and RFID */}
          <View className="flex-row mb-2">
            <View className="flex-1 mr-2">
              <Text className="text-base font-medium text-gray-900 mb-2">
                Tên cá <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
                placeholder="Nhập tên cá"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-base font-medium text-gray-900 mb-2">
                Mã RFID <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
                placeholder="Nhập mã RFID"
                value={formData.rfid}
                onChangeText={(text) =>
                  setFormData({ ...formData, rfid: text })
                }
              />
            </View>
          </View>

          {/* Breed and Gender */}
          <View className="flex-row">
            <View className="flex-1 mr-2">
              <ContextMenuField
                label="Giống cá"
                value={formData.breed}
                options={breedOptions}
                onSelect={(value) => setFormData({ ...formData, breed: value })}
                placeholder="Chọn giống"
              />
            </View>
            <View className="flex-1 ml-2">
              <ContextMenuField
                label="Giới tính"
                value={formData.gender}
                options={genderOptions}
                onSelect={(value) =>
                  setFormData({ ...formData, gender: value })
                }
                placeholder="Chọn giới tính"
              />
            </View>
          </View>

          {/* Age, Length, Weight */}
          <View className="flex-row mb-2">
            <View className="flex-1 mr-1">
              <Text className="text-base font-medium text-gray-900 mb-2">
                Tuổi
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
                placeholder="VD: 2 năm"
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
              />
            </View>
            <View className="flex-1 mx-1">
              <Text className="text-base font-medium text-gray-900 mb-2">
                Chiều dài
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
                placeholder="VD: 35cm"
                value={formData.length}
                onChangeText={(text) =>
                  setFormData({ ...formData, length: text })
                }
              />
            </View>
            <View className="flex-1 ml-1">
              <Text className="text-base font-medium text-gray-900 mb-2">
                Cân nặng
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
                placeholder="VD: 1.2kg"
                value={formData.weight}
                onChangeText={(text) =>
                  setFormData({ ...formData, weight: text })
                }
              />
            </View>
          </View>

          {/* Pond and Type */}
          <View className="flex-row">
            <View className="flex-1 mr-2">
              <ContextMenuField
                label="Bể cá"
                value={formData.pond}
                options={pondOptions}
                onSelect={(value) => setFormData({ ...formData, pond: value })}
                placeholder="Chọn bể cá"
              />
            </View>
            <View className="flex-1 ml-2">
              <ContextMenuField
                label="Loại"
                value={formData.type}
                options={typeOptions}
                onSelect={(value) => setFormData({ ...formData, type: value })}
                placeholder="Chọn loại"
              />
            </View>
          </View>

          {/* Notes */}
          <View className="mb-8">
            <Text className="text-base font-medium text-gray-900 mb-2">
              Ghi chú
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
              placeholder="Thông tin bổ sung về cá..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
            />
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View className="flex-row p-4 border-t border-gray-200">
          <TouchableOpacity
            className="flex-1 bg-gray-100 rounded-lg py-3 mr-2"
            onPress={handleCancel}
          >
            <Text className="text-center text-gray-900 font-medium">Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 rounded-lg py-3 ml-2"
            style={{ backgroundColor: "#0A3D62" }}
            onPress={handleSave}
          >
            <Text className="text-center text-white font-medium">Lưu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default AddKoiModal;
