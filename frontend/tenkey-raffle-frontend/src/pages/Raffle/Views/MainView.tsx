import { Button, Center, Group, Loader, Stack, Title, Text } from "@mantine/core"
import { NameShuffler } from "../../../components/NameShuffler"
import { Mapping, NextRaffleDetails, Participant, Prize } from "../../../types/BackendTypes"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "preact/hooks"
import { modifyCancelsList } from "../../../requests/Participants"
import { generatePossibleWinnersPool } from "../../../util/GeneratePossibleWinnersPool"


export const MainView: React.FC<{
  participants: Participant[],
  prizes: Prize[],
  mappings: Mapping[],
  cancels: string[]
}> = ({
  participants,
  prizes,
  mappings,
  cancels
}) => {

    const [potentialWinner, setPotentialWinner] = useState<Participant | null>(null)
    const queryClient = useQueryClient()

    enum RaffleStates {
      Initializing = 0,
      PrizeIntroduction,
      Rolling,
      PossibleWinnerChosen,


      EditMenuOpen,

    }

    const discardUnavailableWinnerMutation = useMutation({
      mutationFn: modifyCancelsList,
      onMutate: ((test) => {

      }),
      onSuccess: (response => {
        queryClient.invalidateQueries({ queryKey: ['getCancels'] })
      }),
      onError: ((error: Error, params) => {
        // TODO: Better retry handling
        console.error(error)
        setTimeout(() => {
          discardUnavailableWinnerMutation.mutate(params)
        }, 200)
      })
    })


    // 抽選可能プールを生成
    const rafflePool = useMemo(() => {
      return generatePossibleWinnersPool(participants, cancels, mappings)
    }, [participants, cancels, mappings])


    // 当選者を選ぶ関数（確定ではなく表示用）
    const pickPotentialWinner = () => {
      setPotentialWinner(rafflePool[Math.floor(Math.random() * rafflePool.length)])
    }


    // 次の抽選景品を選ぶ
    // mappingsリストで最初に当選者がいないもの

    type NextPrizeDetailsType = {
      nextPrize: Prize | null,
      prizeGroup: Prize[] | null
    }

    const nextPrizeDetails: NextPrizeDetailsType = useMemo(() => {
      const nextMappingIndex = mappings.findIndex(entry => !entry.winnerId)
      if (nextMappingIndex === -1) {
        return {
          nextPrize: null,
          prizeGroup: null
        }
      }
      const nextPrize = prizes.find(prize => prize.id === mappings[nextMappingIndex].prizeId)
      if (!nextPrize) {
        // TODO: Handle error
        throw new Error("Invalid prize")
      }
      const prizeGroup = prizes.filter(prize => prize.displayName === nextPrize.displayName && prize.provider === nextPrize.provider)
      if (prizeGroup.length > 1) {
        return {
          nextPrize: nextPrize,
          prizeGroup: prizeGroup
        }
      } else {
        return {
          nextPrize: nextPrize,
          prizeGroup: null
        }
      }

    }, [mappings, prizes])




    // Processing -> 表示は変えずにデータ変更を待つ
    const processing = discardUnavailableWinnerMutation.isPending


    if (!nextPrizeDetails) {
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