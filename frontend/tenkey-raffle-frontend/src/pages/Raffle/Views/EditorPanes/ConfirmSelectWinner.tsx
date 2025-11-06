import { Participant, Prize } from "@/types/BackendTypes";
import { EditorData } from "../InRaffleEditMenu";
import { Button, Paper, Stack, Text, } from "@mantine/core";
import { sanitizePrizeName } from "@/util/SanitizePrizeName";

export const ConfirmSelectWinner: React.FC<{
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
    if (!prizeBeingEdited) {
      // TODO: Error handling
      return
    }

    const existingWinner = currentEditorData.mapping.winnerId
      ? participants.find(participant => participant.registrationId === currentEditorData.mapping.winnerId)
      : null

    return (

      <Stack align="center">

        <Text>
          景品「{sanitizePrizeName(prizeBeingEdited.displayName)}」（ID: {prizeBeingEdited.id}）の当選者を以下に変更します。
        </Text>

        <Paper shadow="xs" p="xl" withBorder w={{ base: "100%", lg: "50%" }}>
          <Stack gap="xs" align="center">
            <Text size="xl">{currentEditorData.newWinner.displayName}</Text>
            <Text size="sm" c="dimmed">{currentEditorData.newWinner.username}</Text>
            <Text size="sm" c="dimmed">{currentEditorData.newWinner.registrationId}</Text>
          </Stack>
        </Paper>

        <Button
          onClick={() => onConfirm()}
        >
          確定
        </Button>

      </Stack>
    )

  }