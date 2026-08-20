import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, TextInput, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Screen } from "@/components/ui/Screen";
import { SettingRow } from "@/components/ui/SettingRow";
import { Type } from "@/components/ui/Type";
import { palette } from "@/constants/theme";
import { deleteAllLocalData } from "@/database";
import {
  disableNotifications,
  scheduleGentleReminder,
} from "@/services/notifications";
import { exportJournalArchive } from "@/services/storage/export";
import { createPinHash } from "@/services/storage/pin";
import { deleteCloudData, enableAnonymousSync } from "@/services/sync/client";
import {
  clearPreferences,
  defaultPreferences,
} from "@/services/storage/securePreferences";
import { usePreferencesStore } from "@/stores/usePreferencesStore";

export default function ProfileScreen() {
  const router = useRouter();
  const prefs = usePreferencesStore();
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const toggleBiometric = async (enabled: boolean) => {
    if (!enabled) return prefs.update({ biometricEnabled: false });
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!compatible || !enrolled)
      return Alert.alert(
        "Chưa thể bật",
        "Thiết bị chưa có sinh trắc học được thiết lập.",
      );
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Xác nhận bảo vệ InnerRoom",
    });
    if (result.success) await prefs.update({ biometricEnabled: true });
  };
  const savePin = async () => {
    if (pin.length < 4 || pin !== confirmPin) return;
    await prefs.update({ pinHash: await createPinHash(pin) });
    setPin("");
    setConfirmPin("");
    setPinOpen(false);
  };
  const toggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const granted = await scheduleGentleReminder();
      if (!granted)
        return Alert.alert(
          "Thông báo vẫn đang tắt",
          "Bạn có thể cho phép thông báo trong cài đặt hệ thống khi sẵn sàng.",
        );
    } else await disableNotifications();
    await prefs.update({ notificationEnabled: enabled });
  };
  const toggleCloudSync = async (enabled: boolean) => {
    if (!enabled) return prefs.update({ cloudSyncEnabled: false });
    try {
      await enableAnonymousSync();
      await prefs.update({ cloudSyncEnabled: true });
    } catch {
      Alert.alert(
        "Chưa thể đồng bộ",
        "Backend chưa được cấu hình hoặc kết nối đang gián đoạn. Dữ liệu vẫn an toàn trên thiết bị.",
      );
    }
  };
  const deleteEverything = () =>
    Alert.alert(
      "Xóa toàn bộ dữ liệu của tôi?",
      "Nhật ký, trò chuyện, thư và cài đặt riêng tư trên thiết bị sẽ bị xóa. Hành động này không thể hoàn tác.",
      [
        { text: "Giữ lại", style: "cancel" },
        {
          text: "Xóa toàn bộ",
          style: "destructive",
          onPress: () =>
            void (async () => {
              if (prefs.cloudSyncEnabled) {
                try {
                  await deleteCloudData();
                } catch {
                  return Alert.alert(
                    "Chưa xóa được bản cloud",
                    "Dữ liệu trên máy chưa bị xóa để tránh khiến bạn tưởng rằng mọi nơi đã được xóa. Hãy kiểm tra kết nối rồi thử lại.",
                  );
                }
              }
              await deleteAllLocalData();
              await clearPreferences();
              await prefs.update(defaultPreferences);
              router.replace("/onboarding");
            })(),
        },
      ],
    );

  return (
    <Screen>
      <PageHeader
        title="Không gian của bạn"
        subtitle="Mặc định, InnerRoom chỉ lưu trên thiết bị này. Không tài khoản, không quảng cáo, không theo dõi streak."
      />
      <Card className="mb-6">
        <Type variant="eyebrow" style={{ color: palette.moss }}>
          LƯU TRÊN THIẾT BỊ
        </Type>
        <Type variant="heading" className="mt-2">
          Local-only đang là mặc định
        </Type>
        <Type variant="small" muted className="mt-3">
          Cloud và AI memory chỉ hoạt động sau khi chính bạn bật. Nội dung nhật
          ký không được dùng cho quảng cáo.
        </Type>
      </Card>
      <Type variant="eyebrow" muted className="mb-2">
        AI VÀ KÝ ỨC
      </Type>
      <Card className="mb-7 py-0">
        <SettingRow
          title="Cho phép dùng ký ức nhật ký"
          description="Chỉ gửi tối đa 5 trang gần đây khi trò chuyện."
          value={prefs.memoryEnabled}
          onValueChange={(value) => void prefs.update({ memoryEnabled: value })}
        />
        <SettingRow
          title="Lưu lịch sử trò chuyện"
          description="Tắt để cuộc trò chuyện không được giữ lại trên máy."
          value={prefs.aiHistoryEnabled}
          onValueChange={(value) =>
            void prefs.update({ aiHistoryEnabled: value })
          }
        />
        <SettingRow
          title="Đồng bộ đám mây"
          description="Tùy chọn. Tạo một danh tính ẩn danh khi bạn bật."
          value={prefs.cloudSyncEnabled}
          onValueChange={(value) => void toggleCloudSync(value)}
        />
        <SettingRow
          title="Chế độ ẩn danh"
          description="Không gửi định danh tài khoản đến dịch vụ phản chiếu."
          value={prefs.anonymousMode}
          onValueChange={(value) => void prefs.update({ anonymousMode: value })}
        />
      </Card>
      <Type variant="eyebrow" muted className="mb-2">
        KHÓA VÀ NHẮC NHỞ
      </Type>
      <Card className="mb-4 py-0">
        <SettingRow
          title="Khóa sinh trắc học"
          description="Yêu cầu Face ID hoặc vân tay khi quay lại app."
          value={prefs.biometricEnabled}
          onValueChange={(value) => void toggleBiometric(value)}
        />
        <SettingRow
          title="Nhắc nhẹ lúc 21:30"
          description="Không streak, không trách móc; có thể tắt bất cứ lúc nào."
          value={prefs.notificationEnabled}
          onValueChange={(value) => void toggleNotifications(value)}
        />
      </Card>
      <Button
        tone="quiet"
        label={prefs.pinHash ? "Đổi PIN riêng tư" : "Thiết lập PIN riêng tư"}
        onPress={() => setPinOpen((value) => !value)}
      />
      {pinOpen ? (
        <Card className="mt-3 gap-3">
          <Type variant="small" muted>
            PIN gồm 4–6 số và chỉ lưu dưới dạng băm trong SecureStore.
          </Type>
          <TextInput
            value={pin}
            onChangeText={(value) =>
              setPin(value.replace(/\D/g, "").slice(0, 6))
            }
            secureTextEntry
            keyboardType="number-pad"
            placeholder="PIN mới"
            placeholderTextColor={palette.placeholder}
            className="h-12 rounded-2xl bg-ink-soft px-4 text-center font-semibold tracking-[6px] text-cream"
          />
          <TextInput
            value={confirmPin}
            onChangeText={(value) =>
              setConfirmPin(value.replace(/\D/g, "").slice(0, 6))
            }
            secureTextEntry
            keyboardType="number-pad"
            placeholder="Nhập lại PIN"
            placeholderTextColor={palette.placeholder}
            className="h-12 rounded-2xl bg-ink-soft px-4 text-center font-semibold tracking-[6px] text-cream"
          />
          {confirmPin && pin !== confirmPin ? (
            <Type variant="small" style={{ color: palette.danger }}>
              Hai PIN chưa giống nhau.
            </Type>
          ) : null}
          <Button
            label="Lưu PIN"
            disabled={pin.length < 4 || pin !== confirmPin}
            onPress={() => void savePin()}
          />
          {prefs.pinHash ? (
            <Button
              tone="danger"
              label="Gỡ PIN"
              onPress={() => {
                void prefs.update({ pinHash: null });
                setPinOpen(false);
              }}
            />
          ) : null}
        </Card>
      ) : null}
      <Type variant="eyebrow" muted className="mb-2 mt-9">
        DỮ LIỆU CỦA BẠN
      </Type>
      <Button
        tone="quiet"
        label="Xuất nhật ký (.json)"
        onPress={() => void exportJournalArchive()}
      />
      <Button
        className="mt-3"
        tone="danger"
        label="Xóa toàn bộ dữ liệu của tôi"
        onPress={deleteEverything}
      />
      <View className="mt-5 items-center justify-center">
        <Type variant="small" muted>
          Bản xuất luôn chứa nội dung gốc và ngày viết.
        </Type>
      </View>
      <View className="mt-3 items-center justify-center">
        <Type variant="small" muted>
          InnerRoom không tự xóa dữ liệu khi bạn vắng mặt.
        </Type>
      </View>
    </Screen>
  );
}
