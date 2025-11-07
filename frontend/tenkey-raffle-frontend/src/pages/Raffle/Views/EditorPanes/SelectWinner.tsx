import { Participant, Mapping, Prize } from "@/types/BackendTypes"
import { EditorData } from "../InRaffleEditMenu"
import { Stack, Paper, Select, ComboboxItem, Button, Text } from "@mantine/core"
import { useMemo, useState } from "react"
import { BUTTON_SECONDARY_BORDER_COLOR } from "@/settings"

export const SelectWinner: React.FC<{
  participants: Participant[],
  prizes: Prize[],
  currentEditorData: EditorData,
  onSelectWinner: (winner: Participant) => void,
}> = ({
  participants,
  prizes,
  currentEditorData,
  onSelectWinner
}) => {

    const [selectedValue, setSelectedValue] = useState<string>(null)
    const selectedParticipant: Participant | null = useMemo(() => {
      if (!selectedValue) { return null }
      return participants.find(participant => participant.registrationId === selectedValue)
    }, [selectedValue])

    const prizeBeingEdited = prizes.find(prize => prize.id === currentEditorData.mapping.prizeId)
    
    const existingWinner = currentEditorData.mapping.winnerId 
      ? participants.find(participant => participant.registrationId === currentEditorData.mapping.winnerId) 
      : null

    return (
      <Stack align="center">
        以下の景品の当選者を編集します。
        <Paper shadow="xs" p="xl" withBorder w={{base: "100%", lg: "50%"}}>

          <Stack gap="xs" align="center">
            <Text size="xl" dangerouslySetInnerHTML={{ __html: prizeBeingEdited.displayName }} />
            <Text size="sm" c="dimmed">{prizeBeingEdited.id}</Text>
            <Text size="sm" c="dimmed">{prizeBeingEdited.provider}</Text>
          </Stack>

        </Paper>
        {existingWinner ?
          <>
            <Text>
              現在の当選者は以下の参加者です。
            </Text>
            <Paper shadow="xs" p="xl" withBorder w={{base: "100%", lg: "50%"}}>
              <Stack gap="xs" align="center">
                <Text size="xl">{existingWinner.displayName}</Text>
                <Text size="sm" c="dimmed">{existingWinner.username}</Text>
                <Text size="sm" c="dimmed">{existingWinner.registrationId}</Text>
              </Stack>
            </Paper>
          </>
          :
          <Text>
            現在この景品に当選者はいません。
          </Text>
        }
        <Select
          mt={8}
          label="当選者の選択"
          description="検索時には最大20人まで表示されます。"
          placeholder="表示名、ユーザー名、または受付番号で検索"
          w={{base: "100%", lg: "50%"}}
          data={participants
            .filter(participant => participant.registrationId !== existingWinner?.registrationId)
            .map(participant => {
              return {
                value: participant.registrationId,
                label: `${participant.displayName}（${participant.username}、ID：${participant.registrationId}）`
              }
            })}
          searchable
          comboboxProps={{ withinPortal: false }}
          withScrollArea={false}
          styles={{ dropdown: { maxHeight: 200, overflowY: 'auto' } }}
          // limit={20}
          filter={({ options, search }) => {
            const filteredItems = (options as ComboboxItem[]).filter(option => option.label.toLowerCase().trim().includes(search.toLowerCase().trim()))
            // return filteredItems.slice(0, 20)
            return filteredItems
          }}
          onChange={setSelectedValue}
          value={selectedValue}
        />
        <Button
          disabled={!selectedParticipant}
          onClick={() => onSelectWinner(selectedParticipant)}
          bg={BUTTON_SECONDARY_BORDER_COLOR}
        >
          当選者を変更
        </Button>
      </Stack>
    )
  }