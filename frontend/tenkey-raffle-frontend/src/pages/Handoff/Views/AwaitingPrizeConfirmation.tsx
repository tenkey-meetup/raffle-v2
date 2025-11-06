import { Stack, Title, Text, Group, Paper, Container, Flex, Grid, SimpleGrid, Button } from "@mantine/core"
import { BarcodeReaderInput } from "../../../components/BarcodeReaderInput"
import { Participant, Prize, Mapping } from "../../../types/BackendTypes"
import { useFocusTrap } from "@mantine/hooks"
import { useRef, useEffect } from "react"
import { PiGift, PiUser, PiUserLight } from "react-icons/pi";


export const AwaitingPrizeConfirmation: React.FC<{
  participants: Participant[],
  prizes: Prize[],
  pendingPrizeId: string,
  pendingParticipantId: string,
}> = ({
  participants,
  prizes,
  pendingPrizeId,
  pendingParticipantId
}) => {

    const pendingPrize: Prize | null = prizes.find(prize => prize.id === pendingPrizeId) || null
    const pendingParticipant: Participant | null = participants.find(participant => participant.registrationId === pendingParticipantId) || null
    const inputRef = useRef(null);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, [inputRef.current])


    return (
      <Stack w="100%" align="center">
        <Title order={1}>ステップ２</Title>
        <Text>景品を見つけ、確認用にバーコードをスキャンしてください</Text>

        
          <SimpleGrid cols={{base: 1, md: 2}} spacing="lg">
            

              <Paper shadow="xs" p="xl" withBorder>
                <Group gap="4" pb="lg">
                  <PiUser size="1.2em" />
                  <Text size="lg">当選者</Text>
                </Group>
                {pendingParticipant ?
                  <Stack gap="xs">
                    <Title order={2}>{pendingParticipant.displayName}</Title>
                    <Text size="xl" c="dimmed">{pendingParticipant.username}</Text>
                    <Text size="xl" c="dimmed">{pendingParticipant.registrationId}</Text>
                  </Stack>
                  :
                  <>
                  </>
                }
              </Paper>
            

            
              <Paper shadow="xs" p="xl" withBorder>
                <Group gap="4" pb="lg">
                  <PiGift size="1.2em" />
                  <Text size="lg">景品</Text>
                </Group>
                {pendingPrize ?
                  <Stack gap="xs">
                    <Title order={2} dangerouslySetInnerHTML={{ __html: pendingPrize.displayName }} />
                    <Text size="xl" c="dimmed">{pendingPrize.id}</Text>
                    <Text size="xl" c="dimmed">{pendingPrize.provider}</Text>
                  </Stack>
                  :
                  <>
                  </>
                }
              </Paper>
            

          </SimpleGrid>
        

        <BarcodeReaderInput
          inputRef={inputRef}
          onSettled={v => console.log(v)}
          clearOnSettled
          label="景品バーコード"
          description="手入力の場合は入力後にエンターを押してください"
          placeholder="..."
        />

        <Button color="orange" variant="outline">
          バーコード確認なしで受け渡しに進む
        </Button>

      </Stack>
    )
  }