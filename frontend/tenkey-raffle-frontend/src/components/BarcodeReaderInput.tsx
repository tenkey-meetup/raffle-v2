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

export const BarcodeReaderInput: React.FC<BarcodeReaderTextInputProps> = ({ settleTime, onSettled, clearOnSettled, inputRef, onClear, ...rest }) => {

  const [currentText, setCurrentText] = useState<string>("")
  // const [debouncedText] = useDebounce(currentText, settleTime || 1000);


  const handleOnSettled = (text) => {
    if (text !== "") {
      onSettled(text)
      clearOnSettled && setCurrentText("")
    }
  }

  // useEffect(() => {
  //   handleOnSettled(debouncedText)
  // }, [debouncedText])

  const handleKeypress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Delete") {
      e.preventDefault()
      setCurrentText("")
    } else if (e.key === "Enter") {
      e.preventDefault()
      handleOnSettled(currentText)
    }
  }

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
