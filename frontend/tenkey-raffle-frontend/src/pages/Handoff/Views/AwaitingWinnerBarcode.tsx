import { useEffect, useRef, useState } from "react"
import { Mapping, Participant, Prize } from "../../../types/BackendTypes"
import { Stack, Title, Text, Group, Paper, } from "@mantine/core"
import { BarcodeReaderInput } from "../../../components/BarcodeReaderInput"
import { useFocusTrap } from "@mantine/hooks"



export const AwaitingWinnerBarcode: React.FC<{
  participants: Participant[],
  prizes: Prize[],
  mappings: Mapping[],
  setPendingPrizeDetails: (prizeId: string, participantId: string) => void
}> = ({
  participants,
  prizes,
  mappings,
  setPendingPrizeDetails
}) => {

    const [searchWarnings, setSearchWarnings] = useState<string[]>([])
    const [searchWarningTimeout, setSearchWarningTimeout] = useState<number>(0)
    const inputRef = useRef(null);

    const processParticipantIdInput = (id: string) => {
      const matchingMapping = mappings.find(mapping => mapping.participantId === id)

      if (!matchingMapping) {
        const warnings = []
        warnings.push(`参加者「${id}」に対応する当選結果が見つかりませんでした。`)
        if (!participants.some(participant => participant.registrationId === id)) {
          warnings.push(`また、受付番号「${id}」の参加者の情報が見つかりませんでした。`)
        }
        setSearchWarnings(warnings)
        setSearchWarningTimeout(warnings.length * 5)
      } 

      else {
        setPendingPrizeDetails(matchingMapping.prizeId, matchingMapping.participantId)
      }
    }

    useEffect(() => {
      if (searchWarningTimeout > 0) {
        const currentTimer = setTimeout(() => {
          setSearchWarningTimeout(searchWarningTimeout - 1)
        }, 1000)
        return (() => {
          console.log("Clearing timer")
          clearTimeout(currentTimer)
        })
      } else {
        console.log("Countdown complete")
        setSearchWarnings([])
      }
    }, [searchWarningTimeout])

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      } 
    }, [inputRef.current])
    


    return (
      <Stack w="100%" align="center">
        <Title order={1}>ステップ１</Title>
        <Text>当選者のバーコードをスキャンしてください</Text>

        <BarcodeReaderInput
          inputRef={inputRef}
          onSettled={v => processParticipantIdInput(v)}
          clearOnSettled
          label="受付番号"
          description="手入力の場合は入力後にエンターを押してください"
          placeholder="..."
        />

        {searchWarnings.map(warning => 
          <Text c="red">{warning}</Text>
        )}

      </Stack>
    )
  }