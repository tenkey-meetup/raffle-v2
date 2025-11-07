import { useEffect, useMemo, useRef, useState } from "react"
import { Mapping, Participant, Prize } from "../../../types/BackendTypes"
import { Stepper, Group, Button, Container, Stack, Title, Text, Paper, Space } from "@mantine/core"
import { BarcodeReaderInput } from "@/components/BarcodeReaderInput"
import { sanitizePrizeName } from "@/util/SanitizePrizeName"
import { WordWrapSpan } from "@/components/WordWrapSpan"
import { AnimatePresence } from "motion/react"
import { BUTTON_PRIMARY_BACKGROUND_COLOR, BUTTON_PRIMARY_BORDER_COLOR, BUTTON_SECONDARY_BACKGROUND_COLOR, BUTTON_SECONDARY_BORDER_COLOR, SECONDARY_CONTAINER_BACKGROUND_COLOR } from "@/settings"

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

    // 名前検索欄に自動的にフォーカス
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, [inputRef.current])

    // 検索IDが変更された場合、同じIDを持った参加者を探す
    const matchingParticipant: Participant | null = useMemo(() => {
      if (!currentLookupId) { return null }
      return participants.find(entry => entry.registrationId === currentLookupId)
    }, [currentLookupId])

    // 検索IDが変更された場合、IDが当選者欄に入ってる抽選記録を探す
    // 複数当選に対応するためにリストで返す
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

        <AnimatePresence>
          {currentLookupId &&
            <Group justify="center" align="stretch" grow pt="24px">

              {/* 参加者情報 */}
              {matchingParticipant ?
                <Paper shadow="xs" p="xl" withBorder bg={BUTTON_PRIMARY_BACKGROUND_COLOR}>
                  {/* 一般の場合 */}
                  <Stack align="center" ta="center" h="100%">
                    <Title order={3} c={BUTTON_PRIMARY_BORDER_COLOR}>参加者情報</Title>
                    <Title order={1} fw={650}>{matchingParticipant.displayName}</Title>
                    {duplicateNameExists ?
                      <>
                        <Space />
                        <Text c="orange.7" fw={550} size="lg">受付番号：{matchingParticipant.registrationId}</Text>
                        <Text c="orange.7" fw={550} size="lg">ユーザー名：{matchingParticipant.username}</Text>
                        <Space />
                        <Text>同じ表示名の参加者が複数存在します。</Text>
                        <Text>ユーザー名と受付番号も確認してください。</Text>
                      </>
                      :
                      <>
                        <Space />
                        <Text size="lg" fw={450} c={BUTTON_PRIMARY_BORDER_COLOR}>受付番号：{matchingParticipant.registrationId}</Text>
                        <Text size="lg" fw={450} c={BUTTON_PRIMARY_BORDER_COLOR}>ユーザー名：{matchingParticipant.username}</Text>
                      </>
                    }

                  </Stack>
                </Paper>
                :
                <Paper shadow="xs" p="xl" withBorder h="100%" bg={BUTTON_PRIMARY_BACKGROUND_COLOR}>
                  {/* 検索した参加者が存在しない場合 */}
                  <Stack align="center" ta="center">
                    <Title order={3} c="red">参加者情報</Title>
                    <Title order={1}  fw={650} c="red">ID: {currentLookupId}</Title>
                    <Text>読み込まれたIDに対応する参加者データが見つかりませんでした。</Text>
                  </Stack>
                </Paper>
              }

              {/* 当選した景品表示 */}
              {matchingMappings ? matchingMappings.map((mapping, index) => {
                const matchingPrize = prizes.find(prize => prize.id === mapping.prizeId)
                return (
                  <Paper shadow="xs" p="xl" withBorder h="100%" key={mapping.prizeId} bg={SECONDARY_CONTAINER_BACKGROUND_COLOR}>
                    {/* 当選している場合（万が一のために複数当選に対応） */}
                    <Stack align="center" ta="center">
                      <Title order={3} c={BUTTON_SECONDARY_BORDER_COLOR}>当選した景品{matchingMappings.length > 1 && `（その${index + 1}）`}</Title>
                      {matchingPrize ?
                        <>
                          <Title order={1} fw={650}><WordWrapSpan>{sanitizePrizeName(matchingPrize.displayName)}</WordWrapSpan></Title>
                          <Space />
                          <Title order={1} fw={400}>管理番号：<strong>{matchingPrize.id}</strong></Title>
                          <Text size="lg" c={BUTTON_SECONDARY_BORDER_COLOR} fw={450}>提供者：{matchingPrize.provider}</Text>
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
                )
              })
                :
                <Paper shadow="xs" p="xl" withBorder h="100%" bg={SECONDARY_CONTAINER_BACKGROUND_COLOR}>
                  {/* 当選結果が存在しない場合 */}
                  <Stack align="center" ta="center">
                    <Title order={3} c="red">当選した景品</Title>
                    <Title order={1} fw={650} c="red">なし</Title>
                    <Text>読み込まれた当選者に対応する当選記録が見つかりませんでした。</Text>
                  </Stack>
                </Paper>
              }
            </Group>
          }
        </AnimatePresence>

      </Stack>
    )
  }