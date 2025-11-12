import { useGetKoiFish } from '@/hooks/useKoiFish';
import { useGetPonds } from '@/hooks/usePond';
import { KoiFish } from '@/lib/api/services/fetchKoiFish';
import { Pond } from '@/lib/api/services/fetchPond';
import { Fish, Search, Waves, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface SelectAssetModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'koi' | 'pond';
  onSelect: (asset: KoiFish | Pond) => void;
}

export default function SelectAssetModal({
  visible,
  onClose,
  type,
  onSelect,
}: SelectAssetModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<KoiFish | Pond | null>(
    null
  );

  // Fetch data based on type
  const {
    data: koiData,
    isLoading: koiLoading,
    fetchNextPage: fetchNextKoi,
    hasNextPage: hasNextKoi,
    isFetchingNextPage: isFetchingNextKoi,
  } = useGetKoiFish(
    { search: searchQuery, pageSize: 20 },
    type === 'koi' && visible
  );

  const { data: pondData, isLoading: pondLoading } = useGetPonds(
    { search: searchQuery, pageSize: 100 },
    type === 'pond' && visible
  );

  const isLoading = type === 'koi' ? koiLoading : pondLoading;
  const assets = type === 'koi' ? koiData?.data || [] : pondData?.data || [];

  // Reset search when modal opens/closes
  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setSelectedAsset(null);
    }
  }, [visible]);

  const handleSelect = () => {
    if (selectedAsset) {
      onSelect(selectedAsset);
      onClose();
    }
  };

  const renderAssetItem = ({ item }: { item: KoiFish | Pond }) => {
    const isKoi = type === 'koi';
    const koiItem = item as KoiFish;
    const pondItem = item as Pond;

    return (
      <TouchableOpacity
        className={`mb-3 rounded-2xl border p-4 ${
          selectedAsset?.id === item.id
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 bg-white'
        }`}
        onPress={() => setSelectedAsset(item)}
      >
        <View className="flex-row items-center">
          <View
            className={`mr-3 rounded-full p-2 ${
              isKoi ? 'bg-blue-100' : 'bg-emerald-100'
            }`}
          >
            {isKoi ? (
              <Fish size={20} color="#2563eb" />
            ) : (
              <Waves size={20} color="#059669" />
            )}
          </View>

          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              {isKoi ? `Cá #${koiItem.id}` : pondItem.pondName}
            </Text>

            {isKoi && (
              <View className="mt-1">
                <Text className="text-sm text-gray-600">
                  {koiItem.variety?.varietyName} • {koiItem.size}
                </Text>
                {koiItem.origin && (
                  <Text className="text-xs text-gray-500">
                    Xuất xứ: {koiItem.origin}
                  </Text>
                )}
              </View>
            )}

            {!isKoi && (
              <View className="mt-1">
                <Text className="text-sm text-gray-600">
                  {pondItem.capacityLiters}L • {pondItem.depthMeters}m sâu
                </Text>
                <Text className="text-xs text-gray-500">
                  Khu vực: {pondItem.areaName}
                </Text>
              </View>
            )}
          </View>

          {selectedAsset?.id === item.id && (
            <View className="ml-2 h-6 w-6 items-center justify-center rounded-full bg-blue-500">
              <View className="h-2 w-2 rounded-full bg-white" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (type === 'koi' && isFetchingNextKoi) {
      return (
        <View className="py-4">
          <ActivityIndicator size="small" color="#2563eb" />
        </View>
      );
    }
    return null;
  };

  const handleLoadMore = () => {
    if (type === 'koi' && hasNextKoi && !isFetchingNextKoi) {
      fetchNextKoi();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="max-h-[85%] rounded-t-3xl bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 p-6">
            <View className="flex-row items-center">
              <View
                className={`mr-3 rounded-full p-2 ${
                  type === 'koi' ? 'bg-blue-100' : 'bg-emerald-100'
                }`}
              >
                {type === 'koi' ? (
                  <Fish size={20} color="#2563eb" />
                ) : (
                  <Waves size={20} color="#059669" />
                )}
              </View>
              <Text className="text-xl font-bold text-gray-900">
                Chọn {type === 'koi' ? 'cá Koi' : 'ao nuôi'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="rounded-full bg-gray-100 p-2"
            >
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View className="border-b border-gray-200 p-4">
            <View className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <Search size={20} color="#6b7280" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={`Tìm kiếm ${type === 'koi' ? 'cá' : 'ao'}...`}
                className="ml-3 flex-1 text-base text-gray-900"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Content */}
          <View className="flex-1 p-4">
            {isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-2 text-gray-500">
                  Đang tải danh sách {type === 'koi' ? 'cá' : 'ao'}...
                </Text>
              </View>
            ) : assets.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <View
                  className={`mb-4 rounded-full p-4 ${
                    type === 'koi' ? 'bg-blue-100' : 'bg-emerald-100'
                  }`}
                >
                  {type === 'koi' ? (
                    <Fish size={32} color="#6b7280" />
                  ) : (
                    <Waves size={32} color="#6b7280" />
                  )}
                </View>
                <Text className="text-lg font-medium text-gray-900">
                  Không có {type === 'koi' ? 'cá' : 'ao'} nào
                </Text>
                <Text className="text-center text-gray-500">
                  {searchQuery
                    ? `Không tìm thấy kết quả cho "${searchQuery}"`
                    : `Chưa có ${type === 'koi' ? 'cá' : 'ao'} nào trong hệ thống`}
                </Text>
              </View>
            ) : (
              <FlatList
                data={assets}
                renderItem={renderAssetItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                ListFooterComponent={renderFooter}
              />
            )}
          </View>

          {/* Footer */}
          <View className="border-t border-gray-200 p-4">
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 rounded-2xl border border-gray-300 bg-white py-4"
              >
                <Text className="text-center text-base font-semibold text-gray-700">
                  Hủy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSelect}
                className={`flex-1 rounded-2xl py-4 ${
                  selectedAsset
                    ? type === 'koi'
                      ? 'bg-blue-600'
                      : 'bg-emerald-600'
                    : 'bg-gray-300'
                }`}
                disabled={!selectedAsset}
              >
                <Text
                  className={`text-center text-base font-semibold ${
                    selectedAsset ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  Chọn {type === 'koi' ? 'cá này' : 'ao này'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
