import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, FileText, X, XCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface CancelIncidentModalProps {
  visible: boolean;
  onClose: () => void;
  onCancel: (resolutionNotes: string) => void;
  isSubmitting?: boolean;
  incidentTitle?: string;
}

export default function CancelIncidentModal({
  visible,
  onClose,
  onCancel,
  isSubmitting = false,
  incidentTitle = 'sự cố này',
}: CancelIncidentModalProps) {
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleSubmit = () => {
    if (resolutionNotes.trim()) {
      onCancel(resolutionNotes.trim());
    }
  };

  const handleClose = () => {
    setResolutionNotes('');
    onClose();
  };

  const isFormValid = resolutionNotes.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/60">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={handleClose}
          >
            <View className="flex-1 justify-center p-6">
              <TouchableOpacity activeOpacity={1}>
                <View className="overflow-hidden rounded-3xl bg-white shadow-2xl">
                  {/* Header */}
                  <LinearGradient
                    colors={['#ef4444', '#dc2626', '#b91c1c']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="relative overflow-hidden px-6 py-8"
                  >
                    {/* Decorative Elements */}
                    <View className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/10" />
                    <View className="absolute -left-4 top-12 h-12 w-12 rounded-full bg-white/5" />

                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-4">
                        <View className="mb-2 flex-row items-center">
                          <View className="mr-3 rounded-full bg-white/20 p-3">
                            <XCircle size={24} color="white" />
                          </View>
                          <Text className="text-xl font-bold text-white">
                            Hủy sự cố
                          </Text>
                        </View>
                        <Text className="text-sm text-red-100">
                          Đánh dấu &ldquo;{incidentTitle}&rdquo; đã được hủy
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={handleClose}
                        className="rounded-full bg-white/20 p-2 backdrop-blur-sm"
                        disabled={isSubmitting}
                        style={{ opacity: isSubmitting ? 0.5 : 1 }}
                      >
                        <X size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>

                  {/* Content */}
                  <ScrollView
                    className="max-h-80 px-6 py-6"
                    showsVerticalScrollIndicator={false}
                  >
                    <View className="space-y-6">
                      {/* Warning Notice */}
                      <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
                        <View className="mb-2 flex-row items-center">
                          <AlertTriangle size={20} color="#dc2626" />
                          <Text className="ml-2 text-sm font-semibold text-red-800">
                            Cảnh báo
                          </Text>
                        </View>
                        <Text className="text-sm leading-5 text-red-700">
                          Sau khi hủy, sự cố sẽ không thể khôi phục. Vui lòng
                          ghi rõ lý do hủy để tham khảo sau này.
                        </Text>
                      </View>

                      {/* Cancellation Notes Input */}
                      <View>
                        <View className="mb-3 flex-row items-center">
                          <FileText size={20} color="#374151" />
                          <Text className="ml-2 text-base font-semibold text-slate-900">
                            Lý do hủy sự cố{' '}
                            <Text className="text-red-500">*</Text>
                          </Text>
                        </View>

                        <View className="rounded-2xl border border-slate-200 bg-slate-50 p-1 shadow-sm">
                          <TextInput
                            className="min-h-[120px] rounded-2xl bg-white p-4 text-base text-slate-900 shadow-sm"
                            placeholder="Mô tả lý do tại sao sự cố này cần được hủy, các thông tin liên quan..."
                            placeholderTextColor="#94a3b8"
                            value={resolutionNotes}
                            onChangeText={setResolutionNotes}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            editable={!isSubmitting}
                            style={{
                              fontSize: 16,
                              lineHeight: 24,
                            }}
                          />
                        </View>

                        {/* Character counter */}
                        <Text className="mt-2 text-right text-sm text-slate-500">
                          {resolutionNotes.length} / 1000 ký tự
                        </Text>
                      </View>
                    </View>
                  </ScrollView>

                  {/* Footer Actions */}
                  <View className="border-t border-slate-100 px-6 py-6">
                    <View className="flex-row gap-4">
                      {/* Cancel Button */}
                      <TouchableOpacity
                        onPress={handleClose}
                        disabled={isSubmitting}
                        className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 py-4"
                        style={{ opacity: isSubmitting ? 0.5 : 1 }}
                      >
                        <Text className="text-center text-base font-semibold text-slate-700">
                          Đóng
                        </Text>
                      </TouchableOpacity>

                      {/* Submit Button */}
                      <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={!isFormValid || isSubmitting}
                        className="flex-1 overflow-hidden rounded-2xl"
                        style={{
                          opacity: !isFormValid || isSubmitting ? 0.5 : 1,
                        }}
                      >
                        <LinearGradient
                          colors={
                            isFormValid && !isSubmitting
                              ? ['#ef4444', '#dc2626']
                              : ['#94a3b8', '#64748b']
                          }
                          className="py-4"
                        >
                          <View className="flex-row items-center justify-center">
                            {isSubmitting ? (
                              <View className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <XCircle
                                size={20}
                                color="white"
                                className="mr-2"
                              />
                            )}
                            <Text className="text-base font-bold text-white">
                              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận hủy'}
                            </Text>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>

                    {/* Help text */}
                    <Text className="mt-4 text-center text-xs text-slate-500">
                      Bằng việc xác nhận, sự cố sẽ được đánh dấu là đã hủy
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
