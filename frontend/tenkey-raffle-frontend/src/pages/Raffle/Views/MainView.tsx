import { Button, Center, Group, Loader, Stack, Title, Text } from "@mantine/core"
import { NameShuffler } from "../../../components/NameShuffler"
import { Mapping, NextRaffleDetails, Participant, Prize } from "../../../types/BackendTypes"
import { useMutation } from "@tanstack/react-query"
import { getNextRaffleDetails } from "../../../requests/Raffle"
import { useEffect, useState } from "preact/hooks"
import { modifyCancelsList } from "../../../requests/Participants"


export const MainView: React.FC<{
  participants: Participant[],
  prizes: Prize[],
  mappings: Mapping[]
}> = ({
  participants,
  prizes,
  mappings
}) => {


    const [nextRaffleDetails, setNextRaffleDetails] = useState<NextRaffleDetails | null>(null)
    const [potentialWinner, setPotentialWinner] = useState<Participant | null>(null)

    enum RaffleStates {
      Initializing = 0,
      PrizeIntroduction,
      Rolling,
      PossibleWinnerChosen,
      

      EditMenuOpen,

    }

    const fetchNextDetailsMutation = useMutation({
      mutationFn: getNextRaffleDetails,
      onSuccess: (response => {
        setNextRaffleDetails(response)
      }),
      onError: ((error: Error) => {
        // TODO: Better retry handling
        console.error(error)
        setTimeout(() => {
          fetchNextDetailsMutation.mutate()
        }, 200)
      })
    })

    const discardUnavailableWinnerMutation = useMutation({
      mutationFn: modifyCancelsList,
      onMutate: ((test) => {

      }),
      onSuccess: (response => {
        fetchNextDetailsMutation.mutate()
      }),
      onError: ((error: Error, params) => {
        // TODO: Better retry handling
        console.error(error)
        setTimeout(() => {
          discardUnavailableWinnerMutation.mutate(params)
        }, 200)
      })
    })

    const pickPotentialWinner = () => {
      if (!nextRaffleDetails) {
        // TODO: Better handling
        return;
      }
      
      // TODO: Handle case in which pool is empty 
      // TODO: Better handling of ID not in participannts list
      let correspondingParticipant: Participant | undefined
      while (!correspondingParticipant) {
        const possibleWinnerId = nextRaffleDetails.participantPoolIds[Math.floor(Math.random() * nextRaffleDetails.participantPoolIds.length)]
        correspondingParticipant = participants.find(entry => entry.registrationId === possibleWinnerId)
        if (!correspondingParticipant) {
          console.error("Could not find corresponding participant entry for ID")
          console.error(possibleWinnerId)
        }
      }
      setPotentialWinner(correspondingParticipant)
    }

    // Processing -> 表示は変えずにデータ変更を待つ
    const processing = discardUnavailableWinnerMutation.isPending || fetchNextDetailsMutation.isPending

    useEffect(() => {
      if (nextRaffleDetails === null && !fetchNextDetailsMutation.isPending)
        fetchNextDetailsMutation.mutate()
    }, [])

    if (!nextRaffleDetails) {
      return (
        <Center w="100%" h="100%">
          <Loader />
        </Center>
      )
    }

    return (
      <Stack w="100%" h="100%" align="center">

        <Title size="4em">
          景品名
        </Title>
        <NameShuffler
          participantsList={participants}
          winner={potentialWinner}
        />
        <Group>
          {potentialWinner ?
            <>
              <Button onClick={() => setPotentialWinner(null)}>
                取り消し・再抽選
              </Button>
              <Button>
                確定
              </Button>
            </>
            :
            <Button onClick={() => pickPotentialWinner()}>
              抽選
            </Button>
          }

        </Group>
      </Stack>

    )
  }