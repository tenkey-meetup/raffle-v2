import { useEffect, useMemo, useRef, useState } from "react"
import { Mapping, Participant, Prize } from "../../../types/BackendTypes"
import { Stepper, Group, Button, Container, Stack, Title, Text, Paper, Space } from "@mantine/core"
import { BarcodeReaderInput } from "@/components/BarcodeReaderInput"
import { sanitizePrizeName } from "@/util/SanitizePrizeName"
import { WordWrapSpan } from "@/components/WordWrapSpan"

export const MainView: React.FC<{
  participants: Participant[],
  prizes: Prize[],
  mappings: Mapping[]
}> = ({
  participants,
  prizes,
  mappings
}) => {

    const [currentLookupId, setCurrentLookupId] = useState<string | null>(null)
    const inputRef = useRef(null);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, [inputRef.current])


    const matchingParticipant: Participant | null = useMemo(() => {
      if (!currentLookupId) { return null }
      return participants.find(entry => entry.registrationId === currentLookupId)
    }, [currentLookupId])

    const matchingMapping: Mapping | null = useMemo(() => {
      if (!currentLookupId) { return null }
      return mappings.find(entry => entry.winnerId === currentLookupId)
    }, [currentLookupId])

    const matchingPrize: Prize | null = useMemo(() => {
      if (!matchingMapping) { return null }
      return prizes.find(entry => entry.id === matchingMapping.prizeId)
    }, [matchingMapping])


    return (
      <Stack w="100%" align="center">
        <Title order={1}>受け渡し</Title>
        <Text>当選者のバーコードをスキャンしてください。</Text>

        <BarcodeReaderInput
          inputRef={inputRef}
          onSettled={setCurrentLookupId}
          onClear={() => setCurrentLookupId(null)}
          clearOnSettled
          label="受付番号"
          description="手入力の場合は入力後にエンターを押してください"
          placeholder="..."
        />

        {/* 検索した参加者が存在しない場合 */}
        {currentLookupId &&
          <Group justify="center" align="stretch" grow>
            {matchingParticipant ?
              <Paper shadow="xs" p="xl" withBorder>
                <Stack align="center" ta="center" h="100%">
                  <Title>参加者</Title>
                  <Space />
                  <Text size="xl" fw={650}>{matchingParticipant.displayName}</Text>
                  <Text>受付番号：{matchingParticipant.registrationId}</Text>
                  <Text c="dimmed">ユーザー名：{matchingParticipant.username}</Text>
                </Stack>
              </Paper>
              :
              <Paper shadow="xs" p="xl" withBorder h="100%">
                <Stack align="center" ta="center">
                  <Title c="red">参加者</Title>
                  <Space />
                  <Text c="red" fw="bold">ID: {currentLookupId}</Text>
                  <Text>読み込まれたIDに対応する参加者データが見つかりませんでした。</Text>
                </Stack>
              </Paper>
            }
            {matchingMapping ?
              <Paper shadow="xs" p="xl" withBorder h="100%">
                <Stack align="center" ta="center">
                  <Title>当選した景品</Title>
                  <Space />
                  {matchingPrize ?
                    <>
                      <Text size="xl" fw={650}><WordWrapSpan>{sanitizePrizeName(matchingPrize.displayName)}</WordWrapSpan></Text>
                      <Text>提供者：{matchingPrize.provider}</Text>
                      <Text>管理番号：{matchingPrize.id}</Text>
                    </>
                    :
                    <>
                      <Text c="red" fw="bold">ID: {matchingMapping.prizeId}</Text>
                      <Text>対応する景品データが見つかりませんでした。</Text>
                      <Text>お手数ですが、景品の管理番号から景品を探してください。</Text>
                    </>
                  }

                </Stack>
              </Paper>
              :
              <Paper shadow="xs" p="xl" withBorder h="100%">
                <Stack align="center" ta="center">
                  <Title c="red">当選した景品</Title>
                  <Text c="red" fw="bold">なし</Text>
                  <Text>読み込まれた当選者に対応する当選記録が見つかりませんでした。</Text>
                </Stack>
              </Paper>
            }
          </Group>
        }

      </Stack>
    )
  }