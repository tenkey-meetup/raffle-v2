import { TextInput, TextInputProps } from "@mantine/core";
import { TargetedKeyboardEvent } from "preact";
import { MutableRef, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";


interface BarcodeReaderTextInputProps extends TextInputProps {
  inputRef?: MutableRef<any> | undefined,
  settleTime?: number | undefined,
  onSettled: (output: string) => void,
  clearOnSettled?: boolean | undefined,
}

export const BarcodeReaderInput: React.FC<BarcodeReaderTextInputProps> = ({ settleTime, onSettled, clearOnSettled, inputRef, ...rest }) => {

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

  const handleKeypress = (e: TargetedKeyboardEvent<HTMLInputElement>) => {
    console.log(e.key)
    if (e.key === "Delete") {
      e.preventDefault()
      setCurrentText("")
    } else if (e.key === "Enter") {
      e.preventDefault()
      handleOnSettled(currentText)
    }
  }

  return (
    <TextInput
      ref={inputRef}
      value={currentText}
      onChange={e => setCurrentText(e.currentTarget.value)}
      onKeyDown={e => handleKeypress(e)}
      {...rest}
    />
  )
}
