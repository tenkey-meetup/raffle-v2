import { TextInput, TextInputProps } from "@mantine/core";
import { TargetedKeyboardEvent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useDebounce } from "use-debounce";


interface BarcodeReaderTextInputProps extends TextInputProps {
  settleTime?: number | undefined,
  onSettled: (output: string) => void,
  clearOnSettled?: boolean | undefined,
}

export const BarcodeReaderInput: React.FC<BarcodeReaderTextInputProps> = ({ settleTime, onSettled, clearOnSettled, ...rest }) => {

  const [currentText, setCurrentText] = useState<string>("")
  const [debouncedText] = useDebounce(currentText, settleTime || 250);

  useEffect(() => {
    if (debouncedText !== "") {
      onSettled(debouncedText)
      clearOnSettled && setCurrentText("")
    } 
  }, [debouncedText])

  const handleKeypress = (e: TargetedKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Delete") {
      e.preventDefault()
      setCurrentText("")
    }
  }

  return (
    <TextInput
      value={currentText}
      onChange={e => setCurrentText(e.currentTarget.value)}
      onKeyDown={e => handleKeypress(e)}
      {...rest}
    />
  )
}
