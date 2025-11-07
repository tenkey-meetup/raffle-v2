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

    const matchingMappings: Mapping[] | null = useMemo(() => {
      if (!currentLookupId) { return null }
      const matchingMappings = mappings.filter(entry => entry.winnerId === currentLookupId)
      if (matchingMappings.length === 0) {
        return null
      } else {
        return matchingMappings
      }
    }, [currentLookupId])

    // もし同一の名前の参加者が存在する場合、注意喚起をする
    const duplicateNameExists: boolean = useMemo(() => {
      if (!matchingParticipant) { return false }

      return (participants.filter(entry => entry.displayName === matchingParticipant.displayName).length > 1)

    }, [matchingParticipant])


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
          <Group justify="center" align="stretch" grow pt="24px">
            {matchingParticipant ?
              <Paper shadow="xs" p="xl" withBorder>
                <Stack align="center" ta="center" h="100%">
                  <Title order={3} c="dimmed">参加者情報</Title>
                  <Title order={1} fw={650}>{matchingParticipant.displayName}</Title>
                  {duplicateNameExists ?
                    <>
                      <Text c="orange.7" fw={550} size="lg">受付番号：{matchingParticipant.registrationId}</Text>
                      <Text c="orange.7" fw={550} size="lg">ユーザー名：{matchingParticipant.username}</Text>
                      <Text>同じ表示名の参加者が複数存在します。</Text>
                      <Text>ユーザー名と受付番号も確認してください。</Text>
                    </>
                    :
                    <>
                      <Text size="lg">受付番号：{matchingParticipant.registrationId}</Text>
                      <Text size="lg" c="dimmed">ユーザー名：{matchingParticipant.username}</Text>
                    </>
                  }

                </Stack>
              </Paper>
              :
              <Paper shadow="xs" p="xl" withBorder h="100%">
                <Stack align="center" ta="center">
                  <Title order={3} c="red">参加者</Title>
                  <Title order={1} c="red" fw="bold">ID: {currentLookupId}</Title>
                  <Text>読み込まれたIDに対応する参加者データが見つかりませんでした。</Text>
                </Stack>
              </Paper>
            }
            {matchingMappings ? matchingMappings.map((mapping, index) => { 
              const matchingPrize = prizes.find(prize => prize.id === mapping.prizeId)
              return (
              <Paper shadow="xs" p="xl" withBorder h="100%" key={mapping.prizeId}>
                <Stack align="center" ta="center">
                  <Title order={3} c="dimmed">当選した景品{matchingMappings.length > 1 && `（その${index + 1}）`}</Title>
                  {matchingPrize ?
                    <>
                      <Title order={1} fw={650}><WordWrapSpan>{sanitizePrizeName(matchingPrize.displayName)}</WordWrapSpan></Title>
                      <Text size="lg" fw={450}>提供者：{matchingPrize.provider}</Text>
                      <Text size="xl" fw={400}>管理番号：<strong>{matchingPrize.id}</strong></Text>
                    </>
                    :
                    <>
                      <Title order={1} fw={650} c="red">ID: {mapping.prizeId}</Title>
                      <Text>対応する景品データが見つかりませんでした。</Text>
                      <Text>お手数ですが、景品の管理番号から景品を探してください。</Text>
                    </>
                  }

                </Stack>
              </Paper>
            )})

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