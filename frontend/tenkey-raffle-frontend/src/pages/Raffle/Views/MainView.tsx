import { Stack, Title } from "@mantine/core"
import { NameRaffleView } from "../../../components/NameRaffleView"
import { Mapping, Participant, Prize } from "../../../types/BackendTypes"


export const MainView: React.FC<{
  participants: Participant[],
  prizes: Prize[],
  mappings: Mapping[]
}> = ({
  participants,
  prizes,
  mappings
}) => {
    return (
      <Stack w="100%" h="100%" align="center">

        <Title size="4em">
          景品名
        </Title>
        <NameRaffleView
          namesList={participants.map(entry => entry.displayName)}
          fontSize={4}
        />
      </Stack>

    )
  }