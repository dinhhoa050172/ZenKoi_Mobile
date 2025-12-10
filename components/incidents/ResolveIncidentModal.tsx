import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, CheckCircle, FileText, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

interface ResolveIncidentModalProps {
  visible: boolean;
  onClose: () => void;
  onResolve: (resolutionNotes: string) => void;
  isSubmitting?: boolean;
  incidentTitle?: string;
}

export default function ResolveIncidentModal({
  visible,
  onClose,
  onResolve,
  isSubmitting = false,
  incidentTitle = 'sự cố này',
}: ResolveIncidentModalProps) {
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleSubmit = () => {
    if (resolutionNotes.trim()) {
      onResolve(resolutionNotes.trim());
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
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 24,
          }}
          keyboardShouldPersistTaps="handled"
          bottomOffset={10}
        >
          <TouchableOpacity activeOpacity={1} onPress={handleClose}>
            <TouchableOpacity activeOpacity={1}>
              <View className="overflow-hidden rounded-3xl bg-white shadow-2xl">
                {/* Header */}
                <LinearGradient
                  colors={['#10b981', '#059669', '#047857']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="relative overflow-hidden p-6"
                >
                  {/* Decorative Elements */}
                  <View className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/10" />
                  <View className="absolute -left-4 top-12 h-12 w-12 rounded-full bg-white/5" />

                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-4">
                      <View className="mb-2 flex-row items-center">
                        <View className="mr-3 rounded-full bg-white/20 p-3">
                          <CheckCircle size={24} color="white" />
                        </View>
                        <Text className="text-xl font-bold text-white">
                          Giải quyết sự cố
                        </Text>
                      </View>
                      <Text className="text-sm text-emerald-100">
                        Đánh dấu &ldquo;{incidentTitle}&rdquo; đã được giải
                        quyết
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
                <View className="max-h-96 px-6 pt-6">
                  <View className="gap-4">
                    {/* Warning Notice */}
                    <View className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <View className="mb-2 flex-row items-center">
                        <AlertTriangle size={20} color="#d97706" />
                        <Text className="ml-2 text-sm font-semibold text-amber-800">
                          Lưu ý quan trọng
                        </Text>
                      </View>
                      <Text className="text-sm leading-5 text-amber-700">
                        Sau khi giải quyết, trạng thái sự cố sẽ không thể thay
                        đổi. Vui lòng ghi chú đầy đủ về cách giải quyết.
                      </Text>
                    </View>

                    {/* Resolution Notes Input */}
                    <View>
                      <View className="mb-3 flex-row items-center">
                        <FileText size={20} color="#374151" />
                        <Text className="ml-2 text-base font-semibold text-slate-900">
                          Ghi chú giải quyết{' '}
                          <Text className="text-red-500">*</Text>
                        </Text>
                      </View>

                      <View className="rounded-2xl border border-slate-200 bg-slate-50 p-1 shadow-sm">
                        <TextInput
                          className="min-h-[120px] rounded-2xl bg-white p-4 text-base text-slate-900 shadow-sm"
                          placeholder="Mô tả chi tiết cách giải quyết sự cố, các biện pháp đã thực hiện, kết quả đạt được..."
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
                </View>

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
                        Hủy bỏ
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
                            ? ['#10b981', '#059669']
                            : ['#94a3b8', '#64748b']
                        }
                        className="py-4"
                      >
                        <View className="flex-row items-center justify-center gap-2">
                          {isSubmitting ? (
                            <View className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <CheckCircle
                              size={20}
                              color="white"
                              className="mr-2"
                            />
                          )}
                          <Text className="text-base font-bold text-white">
                            {isSubmitting ? 'Đang xử lý...' : 'Giải quyết'}
                          </Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  {/* Help text */}
                  <Text className="mt-4 text-center text-sm text-slate-500">
                    Bằng việc xác nhận, bạn đồng ý rằng sự cố đã được giải quyết
                    hoàn toàn
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </View>
    </Modal>
  );
}
