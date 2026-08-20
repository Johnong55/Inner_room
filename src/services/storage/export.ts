import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { exportAllData } from '@/database';

export async function exportJournalArchive() {
  const payload = JSON.stringify(await exportAllData(), null, 2);
  if (Platform.OS === 'web') {
    const blob = new Blob([payload], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `innerroom-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    return;
  }
  const file = new File(Paths.cache, `innerroom-export-${new Date().toISOString().slice(0, 10)}.json`);
  file.create({ overwrite: true, intermediates: true });
  file.write(payload);
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Xuất dữ liệu InnerRoom' });
}
