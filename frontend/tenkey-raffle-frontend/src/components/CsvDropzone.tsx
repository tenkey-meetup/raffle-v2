import { Group, Text } from '@mantine/core';
import { PiUploadLight, PiTableLight, PiXCircleLight } from 'react-icons/pi';
import { Dropzone, DropzoneProps, FileWithPath, MIME_TYPES } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';


// CSV用のアップロード欄
export const CsvDropzone: React.FC<{
  onDropFn: (file: File) => void,
  disable: boolean,
  loading: boolean,
}> = ({
  onDropFn,
  disable,
  loading,
}) => {

    const parseCsvs = (files: FileWithPath[]) => {
      if (files.length === 0) {
        return
      } else if (files.length > 1) {
        notifications.show({
          color: "red",
          title: "エラー",
          message: "アップロードするCSVは1枚にしてください。",
          autoClose: 7000,
        })
      } else {
        onDropFn(files[0])
      }
    }

    return (
      <Dropzone
        multiple={false}
        onDrop={parseCsvs}
        onReject={(files) => console.log('rejected files', files)}
        maxSize={10 * 1024 ** 2} // 10MB
        disabled={disable && !loading}
        loading={loading}
        accept={[MIME_TYPES.csv]}
      >
        <Group justify="center" gap="lg" mih={220} style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <PiUploadLight size={52} color="var(--mantine-color-blue-6)" />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <PiXCircleLight size={52} color="var(--mantine-color-red-6)" />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <PiTableLight size={52} color="var(--mantine-color-dimmed)" />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              CSVをドラッグ・アンド・ドロップ
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              クリックでファイル選択メニューを表示
            </Text>
          </div>
        </Group>
      </Dropzone>
    );
  }