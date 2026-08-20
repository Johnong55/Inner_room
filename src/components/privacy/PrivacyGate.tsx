import * as LocalAuthentication from "expo-local-authentication";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  AppState,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { palette } from "@/constants/theme";
import { verifyPin } from "@/services/storage/pin";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import { Button } from "../ui/Button";
import { Type } from "../ui/Type";

export function PrivacyGate({ children }: { children: ReactNode }) {
  const hydrated = usePreferencesStore((state) => state.hydrated);
  const biometricEnabled = usePreferencesStore(
    (state) => state.biometricEnabled,
  );
  const pinHash = usePreferencesStore((state) => state.pinHash);
  const enabled = biometricEnabled || Boolean(pinHash);
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "background" && enabled) setAuthenticated(false);
    });
    return () => subscription.remove();
  }, [enabled]);

  const unlockBiometric = useCallback(async () => {
    if (!biometricEnabled || Platform.OS === "web") return;
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Mở InnerRoom",
      cancelLabel: "Dùng PIN",
      fallbackLabel: "Dùng PIN",
      disableDeviceFallback: Boolean(pinHash),
    });
    if (result.success) setAuthenticated(true);
  }, [biometricEnabled, pinHash]);
  if (!hydrated) return <View className="flex-1 bg-ink" />;
  if (!enabled || authenticated) return children;

  const submitPin = async () => {
    if (pinHash && (await verifyPin(pin, pinHash))) {
      setAuthenticated(true);
      setPin("");
      setError("");
    } else {
      setPin("");
      setError("PIN chưa đúng. Bạn có thể thử lại chậm rãi.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ink px-6">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center"
      >
        <View
          className="mb-14 h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: palette.inkSoft }}
        >
          <Type className="text-2xl">🌙</Type>
        </View>
        <Type variant="display">Căn phòng này đang được khóa.</Type>
        <Type muted className="mt-4">
          Chỉ bạn mới có thể mở những điều ở bên trong.
        </Type>
        {pinHash ? (
          <View className="mt-10">
            <TextInput
              autoFocus={!biometricEnabled}
              value={pin}
              onChangeText={(value) => {
                setPin(value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              onSubmitEditing={() => void submitPin()}
              secureTextEntry
              keyboardType="number-pad"
              placeholder="Nhập PIN"
              placeholderTextColor={palette.placeholder}
              className="h-16 rounded-[20px] border bg-ink-raised px-5 text-center font-semibold text-[22px] tracking-[8px] text-cream"
              style={{ borderColor: error ? palette.danger : palette.line }}
            />
            {error ? (
              <Type
                variant="small"
                className="mt-3"
                style={{ color: palette.danger }}
              >
                {error}
              </Type>
            ) : null}
            <Button
              className="mt-4"
              label="Mở bằng PIN"
              disabled={pin.length < 4}
              onPress={() => void submitPin()}
            />
          </View>
        ) : null}
        {biometricEnabled ? (
          <Button
            className="mt-3"
            tone="quiet"
            label="Thử sinh trắc học"
            onPress={() => void unlockBiometric()}
          />
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
