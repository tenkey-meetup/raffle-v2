import { TextInput, TextInputProps } from "@mantine/core";
import { ChangeEvent, KeyboardEvent, Ref, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";


interface BarcodeReaderTextInputProps extends TextInputProps {
  inputRef?: Ref<any> | undefined,
  settleTime?: number | undefined,
  onSettled: (output: string) => void,
  onClear?: (() => void) | undefined
  clearOnSettled?: boolean | undefined,
}

// バーコードリーダーに最適化された入力欄
export const BarcodeReaderInput: React.FC<BarcodeReaderTextInputProps> = ({ settleTime, onSettled, clearOnSettled, inputRef, onClear, ...rest }) => {

  const [currentText, setCurrentText] = useState<string>("")
  // const [debouncedText] = useDebounce(currentText, settleTime || 1000);

  const handleOnSettled = (text) => {
    if (text !== "") {
      onSettled(text)
      clearOnSettled && setCurrentText("")
    }
  }

  // 過去は文字の打ち込みが一定時間無かったら自動確定していた
  // 今は手動入力にも対応するために切っている
  // useEffect(() => {
  //   handleOnSettled(debouncedText)
  // }, [debouncedText])

  // Deleteが押された場合は欄を削除する
  // Enterが押された場合はonSettledを実行する
  const handleKeypress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Delete") {
      e.preventDefault()
      setCurrentText("")
    } else if (e.key === "Enter") {
      e.preventDefault()
      handleOnSettled(currentText)
    }
  }

  // 入力データが変更された場合
  // 0~1文字＋onClearが指定されている場合はonClearを呼ぶ
  const onChangeWrapper = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value.length <= 1) {
      onClear && onClear()
    }
    setCurrentText(e.currentTarget.value)
  }

  return (
    <TextInput
      ref={inputRef || null}
      value={currentText}
      onChange={e => onChangeWrapper(e)}
      onKeyDown={e => handleKeypress(e)}
      {...rest}
    />
  )
}
