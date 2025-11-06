import { Button, Center, Group, Loader, Stack, Title, Text } from "@mantine/core"
import { NameShuffler } from "../../../components/NameShuffler"
import { Mapping, NextRaffleDetails, Participant, Prize } from "../../../types/BackendTypes"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useMemo, useEffect } from "react"
import { modifyCancelsList } from "../../../requests/Participants"
import { generatePossibleWinnersPool } from "../../../util/GeneratePossibleWinnersPool"
import { useBudoux } from "../../../util/BudouxParse"
import { AnimatePresence, LayoutGroup, motion, useAnimate } from "motion/react"
import { AnimatedPrizeDisplay } from "../../../components/AnimatedPrizeDisplay"


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

    const { budouxParser } = useBudoux()
    const [potentialWinner, setPotentialWinner] = useState<Participant | null>(null)
    const queryClient = useQueryClient()

    enum RaffleStates {
      Initializing = 0,
      PrizeIntroduction,
      Rolling,
      PossibleWinnerChosen,
      PendingWinnerDiscard,
      PendingWinnerWrite,
      PendingQueriesRefresh,
      EditMenuOpen,
      PendingEditMutation,
      RafflingComplete,
    }

    const [raffleState, setRaffleState] = useState<RaffleStates>(RaffleStates.Initializing)

    const discardUnavailableWinnerMutation = useMutation({
      mutationFn: modifyCancelsList,
      onMutate: ((test) => {

      }),
      onSuccess: (() => {
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
      prizeIndex: number
    }

    const nextPrizeDetails: NextPrizeDetailsType = useMemo(() => {
      const nextMappingIndex = mappings.findIndex(entry => !entry.winnerId)
      if (nextMappingIndex === -1) {
        return {
          nextPrize: null,
          prizeGroup: null,
          prizeIndex: -1
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
          prizeGroup: prizeGroup,
          prizeIndex: nextMappingIndex
        }
      } else {
        return {
          nextPrize: nextPrize,
          prizeGroup: null,
          prizeIndex: nextMappingIndex
        }
      }

    }, [mappings, prizes])


    // 次の景品が存在しない場合、raffleStateを終了に変更
    // または完了後に次の景品が復活した場合（当選者削除など）、Initializingに戻して対応する
    useEffect(() => {
      if (raffleState !== RaffleStates.RafflingComplete && !nextPrizeDetails.nextPrize) {
        setRaffleState(RaffleStates.RafflingComplete)
      }
      else if (raffleState === RaffleStates.RafflingComplete && nextPrizeDetails.nextPrize) {
        setRaffleState(RaffleStates.Initializing)
      }

    }, [nextPrizeDetails])


    // State別レンダー
    // Initializing -> 最初に起動後、準備が完了するまで待つ
    // 現状は必要なし
    if (raffleState === RaffleStates.Initializing) {
      setRaffleState(RaffleStates.PrizeIntroduction)
      return (
        <Center w="100%" h="100%">
          <Loader />
        </Center>
      )
    }

    else if (raffleState === RaffleStates.RafflingComplete) {
      return (
        <Center w="100%" h="100%">
          {/* TODO */}
          <Text>終了</Text>
        </Center>
      )
    }

    console.log("rerender")

    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <Stack w="100%" h="100%" align="center" style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}>

          <AnimatedPrizeDisplay
            prize={nextPrizeDetails.nextPrize}
            focused={!!potentialWinner}
          />

          {/* <NameShuffler
            participantsList={participants}
            winner={potentialWinner}
          /> */}
          <AnimatePresence mode="popLayout">
            {!potentialWinner &&
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  bounce: 0
                }}
              >
                <Text py="120px" size="120px">
                  名前部分
                </Text>
              </motion.div>

            }
          </AnimatePresence>
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
      </div >

    )
  }