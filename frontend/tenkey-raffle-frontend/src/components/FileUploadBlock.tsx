import { Stack, Button, Text } from "@mantine/core";
import { CsvDropzone } from "./CsvDropzone";
import { useState } from "react";

export const FileUploadBlock: React.FC<{
  isLoading: boolean,
  isDisabled: boolean,
  errorMsg: string | null,
  warningText: string | null
  onSubmit: (file: File) => void,
}> = ({
  isLoading,
  isDisabled,
  errorMsg,
  warningText,
  onSubmit
}) => {
  
  const [file, setFile] = useState<File | null>(null)
  const [displayMissingFileError, setDisplayMissingFileError] = useState<boolean>(false)

  const onButtonClick = () => {
    if (file) {
      onSubmit(file)
    } else {
      setDisplayMissingFileError(true)
    }
  }

  const onFileDrop = (file: File | null | undefined) => {
    setDisplayMissingFileError(false)
    if (file) {
      setFile(file)
    } else {
      setFile(null)
    }
  }

  return (
    <Stack align="center">
      <CsvDropzone
        onDropFn={onFileDrop}
        loading={isLoading}
        disable={isDisabled}
      />
      {warningText && 
      <Text c="red">
        {warningText}
      </Text>
      }
      
      {file &&
        <Text size="xs">{file.name}</Text>
      }
      <Button bg={file ? "red" : ""} loading={isLoading} disabled={!file} onClick={onButtonClick}>
        アップロード（既存のデータを上書き）
      </Button>
      {errorMsg && 
        <Text c="red">アップロードに失敗しました：{errorMsg}</Text>
      }
      {displayMissingFileError && 
        <Text c="red">ファイルを選択してください。</Text>
      }
    </Stack>
  )
}