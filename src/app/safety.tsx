import { Phone, ShieldCheck } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Linking, TextInput, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { PressableScale } from "@/components/ui/PressableScale";
import { Screen } from "@/components/ui/Screen";
import { Type } from "@/components/ui/Type";
import { palette } from "@/constants/theme";
import { createId, listTrustedContacts, saveTrustedContact } from "@/database";
import type { TrustedContact } from "@/types";

export default function SafetyScreen() {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  useEffect(() => {
    void listTrustedContacts().then(setContacts);
  }, []);
  const add = async () => {
    if (!name.trim() || !phone.trim()) return;
    const contact = {
      id: createId("contact"),
      name: name.trim(),
      phone: phone.trim(),
    };
    await saveTrustedContact(contact);
    setContacts((current) => [...current, contact]);
    setName("");
    setPhone("");
    setAdding(false);
  };
  return (
    <Screen>
      <PageHeader back title="Bạn không cần ở một mình lúc này" />
      <Card style={{ borderColor: palette.dangerLine }}>
        <View className="flex-row items-center">
          <ShieldCheck color={palette.danger} size={22} />
          <Type variant="heading" className="ml-3">
            Ưu tiên giữ bạn an toàn
          </Type>
        </View>
        <Type className="mt-4">
          Hãy đến gần một người bạn tin, đặt xa những thứ có thể làm bạn bị
          thương, và cho họ biết rõ rằng bạn cần họ ở lại cùng mình ngay lúc
          này.
        </Type>
      </Card>
      <Type variant="eyebrow" muted className="mb-3 mt-8">
        NGƯỜI TÔI CÓ THỂ TÌM ĐẾN
      </Type>
      <View className="gap-3">
        {contacts.map((contact) => (
          <PressableScale
            key={contact.id}
            onPress={() => void Linking.openURL(`tel:${contact.phone}`)}
          >
            <Card className="flex-row items-center">
              <View className="flex-1">
                <Type variant="heading">{contact.name}</Type>
                <Type variant="small" muted>
                  {contact.phone}
                </Type>
              </View>
              <Phone color={palette.moss} size={20} />
            </Card>
          </PressableScale>
        ))}
      </View>
      {adding ? (
        <Card className="mt-3 gap-3">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Tên người bạn tin"
            placeholderTextColor={palette.placeholder}
            className="h-12 rounded-2xl bg-ink-soft px-4 font-sans text-cream"
          />
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Số điện thoại"
            placeholderTextColor={palette.placeholder}
            className="h-12 rounded-2xl bg-ink-soft px-4 font-sans text-cream"
          />
          <Button label="Lưu người liên hệ" onPress={() => void add()} />
        </Card>
      ) : (
        <Button
          tone="quiet"
          label="Thêm người tôi tin"
          onPress={() => setAdding(true)}
          className="mt-3"
        />
      )}
      <Type variant="eyebrow" muted className="mb-3 mt-8">
        HỖ TRỢ KHẨN CẤP TẠI VIỆT NAM
      </Type>
      <PressableScale onPress={() => void Linking.openURL("tel:115")}>
        <Card className="flex-row items-center">
          <View className="flex-1">
            <Type variant="heading">Gọi cấp cứu y tế · 115</Type>
            <Type variant="small" muted className="mt-1">
              Nếu nguy hiểm đang xảy ra hoặc bạn đã bị thương.
            </Type>
          </View>
          <Phone color={palette.danger} size={20} />
        </Card>
      </PressableScale>
      <Type variant="small" muted className="mt-4">
        Nếu bạn ở ngoài Việt Nam, hãy gọi số khẩn cấp tại nơi bạn đang ở.
        InnerRoom không tự động liên hệ bất kỳ ai; mọi cuộc gọi chỉ bắt đầu khi
        chính bạn chạm vào.
      </Type>
    </Screen>
  );
}
