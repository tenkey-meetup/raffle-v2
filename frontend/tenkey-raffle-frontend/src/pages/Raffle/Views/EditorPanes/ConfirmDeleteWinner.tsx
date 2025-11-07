import { Participant, Mapping, Prize } from "@/types/BackendTypes"
import { EditorData } from "../InRaffleEditMenu"
import { Stack, Paper, Select, ComboboxItem, Button, Text } from "@mantine/core"
import { useMemo, useState } from "react"

export const ConfirmDeleteWinner: React.FC<{
  participants: Participant[],
  prizes: Prize[],
  currentEditorData: EditorData,
  onConfirm: () => void,
}> = ({
  participants,
  prizes,
  currentEditorData,
  onConfirm
}) => {

    const prizeBeingEdited = prizes.find(prize => prize.id === currentEditorData.mapping.prizeId)

    const existingWinner = currentEditorData.mapping.winnerId 
      ? participants.find(participant => participant.registrationId === currentEditorData.mapping.winnerId) 
      : null

    return (
      <Stack align="center">
        以下の景品の当選者を削除します。
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
        <Button
          color="red"
          disabled={!existingWinner}
          onClick={() => onConfirm()}
        >
          当選者を変更
        </Button>
      </Stack>
    )
  }