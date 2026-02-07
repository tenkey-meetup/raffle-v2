import { Button, Center, Group, Loader, Stack, Title, Text, Box } from "@mantine/core"
import { NameShuffler } from "../../../components/NameShuffler"
import { Mapping, Participant, Prize } from "../../../types/BackendTypes"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useMemo, useEffect } from "react"
import { modifyCancelsList } from "../../../requests/Participants"
import { generatePossibleWinnersPool } from "../../../util/GeneratePossibleWinnersPool"
import { useBudoux } from "../../../util/BudouxParse"
import { AnimatePresence, LayoutGroup, motion, useAnimate } from "motion/react"
import { AnimatedPrizeDisplay } from "../../../components/AnimatedPrizeDisplay"
import { TenkeyLogo } from "@components/TenkeyLogo"
import { submitRaffleWinner } from "@/requests/Raffle"
import { PiGift } from "react-icons/pi"
import { BUTTON_PRIMARY_BACKGROUND_COLOR, BUTTON_PRIMARY_BORDER_COLOR, TRANSITION_OVERLAY_TEXT_COLOR, TRANSITION_PANE_COLOR } from "@/settings"
import { DelayedDisplayLoader } from "@/components/DelayedDisplayLoader"
import { useHotkeys } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { useLocation } from "wouter"
import { sleep } from "@/util/util"


// 抽選のウィンドウ内部部分
export const MainView: React.FC<{
  participants: Participant[],
  prizes: Prize[],
  mappings: Mapping[],
  cancels: string[],
  anyFetching: boolean,
  editPaneOpen: boolean,
}> = ({
  participants,
  prizes,
  mappings,
  cancels,
  anyFetching,
  editPaneOpen, 
}) => {

    // シャッフルから選ばれた参加者
    const [potentialWinner, setPotentialWinner] = useState<Participant | null>(null)
    const [location, navigate] = useLocation();
    const queryClient = useQueryClient()

    // 抽選State
    enum RaffleStates {
      Initializing = 0,      // 初期化中
      PrizeIntroduction,     // 景品紹介中（大きく表示する画面）
      Rolling,               // 名前をシャッフル中
      PossibleWinnerChosen,  // 抽選されたけど、会場にいるかを確認中
      PendingWinnerDiscard,  // 再抽選中（バックエンドに当選者が不参加だと伝え中）
      PendingWinnerWrite,    // 当選者確定中（バックエンドに景品に対する当選者を送信中）
      PendingQueriesRefreshToRolling,           // データ変更後の情報更新待ち、次の画面はシャッフル（主に再抽選後）
      PendingQueriesRefreshToPrizeIntroduction, // データ変更後の情報更新待ち、次の画面は景品紹介（主に当選者確定後）
      EditMenuOpen,          // 管理用編集メニューを表示中
      PendingEditMutation,   // 管理用編集メニューから変更を送信中
      RafflingComplete,      // 抽選終了
    }
    const [raffleState, setRaffleState] = useState<RaffleStates>(RaffleStates.Initializing)


    // 参加者を再抽選する際、再度抽選されないように不参加としておく関数
    const discardUnavailableWinnerMutation = useMutation({
      mutationFn: modifyCancelsList,
      onMutate: (() => {
        setRaffleState(RaffleStates.PendingWinnerDiscard)
      }),
      onSuccess: (() => {
        queryClient.invalidateQueries({ queryKey: ['getCancels'] })
        //　誤作動防止のために少しDelayを挟む（Tanstack QueryのisPendingがTrueになる前に進んでしまう競合状態を避ける）
        setTimeout(() => {
          setRaffleState(RaffleStates.PendingQueriesRefreshToRolling)
        }, 20)
      }),
      onError: ((error: Error, params) => {
        console.error(error)
        notifications.show({
          color: "red",
          title: "エラー",
          message: "再抽選に失敗しました。5秒後にページをリロードします",
          autoClose: 5000,
        })
        setTimeout(() => {
          navigate('~/transition/enter')
        }, 5000)
      }),
      retry(failureCount, error) {
        return failureCount < 10
      },
      retryDelay: 500
    })


    // 当選者を確定させる関数
    const submitWinnerMutation = useMutation({
      mutationFn: submitRaffleWinner,
      onMutate: (() => {
        setRaffleState(RaffleStates.PendingWinnerWrite)
      }),
      onSuccess: (() => {
        queryClient.invalidateQueries({ queryKey: ['getMappings'] })
        //　誤作動防止のために少しDelayを挟む（Tanstack QueryのisPendingがTrueになる前に進んでしまう競合状態を避ける）
        setTimeout(() => {
          setRaffleState(RaffleStates.PendingQueriesRefreshToPrizeIntroduction)
        }, 20)
      }),
      onError: ((error: Error, params) => {
        console.error(error)
        notifications.show({
          color: "red",
          title: "エラー",
          message: "当選者指定に失敗しました。5秒後にページをリロードします",
          autoClose: 5000,
        })
        setTimeout(() => {
          navigate('~/transition/enter')
        }, 5000)
      }),
      retry(failureCount, error) {
        return failureCount < 10
      },
      retryDelay: 500
    })


    // 抽選可能プールを生成
    const rafflePool = useMemo(() => {
      return generatePossibleWinnersPool(participants, cancels, mappings)
    }, [participants, cancels, mappings, anyFetching])

    console.log(`Pool length: ${rafflePool.length}`)
    // console.log(rafflePool.map(entry => entry.displayName))


    // 当選者を選ぶ関数（確定ではなく表示用、その後確定Mutationなどで対応）
    const pickPotentialWinner = () => {
      setPotentialWinner(rafflePool[Math.floor(Math.random() * rafflePool.length)])
      setRaffleState(RaffleStates.PossibleWinnerChosen)
    }


    // 次の抽選景品を選ぶ関数
    // mappingsリストで最初に当選者がいないもの
    type NextPrizeDetailsType = {
      nextPrize: Prize | null,          // 次の景品（ない場合はNull）
      prizeIndex: number,               // 次の景品のIndex（+1で表示用）
      prizeGroup: Prize[] | null,       // 同一の名前の景品が複数ある場合、グループとして返す
      prizeIndexInGroup: number | null  // 現在の景品がグループ内でいくつ目かのIndex

    }
    const nextPrizeDetails: NextPrizeDetailsType = useMemo(() => {
      const nextMappingIndex = mappings.findIndex(entry => !entry.winnerId)
      if (nextMappingIndex === -1) {
        return {
          nextPrize: null,
          prizeIndex: -1,
          prizeGroup: null,
          prizeIndexInGroup: null
        }
      }
      const nextPrize = prizes.find(prize => prize.id === mappings[nextMappingIndex].prizeId)
      if (!nextPrize) {
        // 起こらないはず（別途対応済み）
        return undefined
      }
      const prizeGroup = prizes.filter(prize => prize.displayName === nextPrize.displayName && prize.provider === nextPrize.provider)
      if (prizeGroup.length > 1) {
        return {
          nextPrize: nextPrize,
          prizeIndex: nextMappingIndex,
          prizeGroup: prizeGroup,
          prizeIndexInGroup: prizeGroup.findIndex(entry => entry.id === nextPrize.id)
        }
      } else {
        return {
          nextPrize: nextPrize,
          prizeIndex: nextMappingIndex,
          prizeGroup: null,
          prizeIndexInGroup: null
        }
      }

    }, [mappings, prizes])


    // 次の景品が存在しない場合、抽選を終了させる
    // または終了していた後に次の景品が復活した場合（抽選完了後の当選者削除など）、Initializingに戻して対応する
    useEffect(() => {
      if (rafflePool.length === 0) {
        // プールが0人->会場にだれもいない状況
        console.error("Ending raffle due to pool of 0. Are you sure this is intended?")
        setRaffleState(RaffleStates.RafflingComplete)
      }
      else if (raffleState !== RaffleStates.RafflingComplete && !nextPrizeDetails.nextPrize) {
        setRaffleState(RaffleStates.RafflingComplete)
      }
      else if (raffleState === RaffleStates.RafflingComplete && nextPrizeDetails.nextPrize && rafflePool.length > 0) {
        setRaffleState(RaffleStates.Initializing)
      }

    }, [nextPrizeDetails, raffleState, rafflePool])


    // すべての制御ボタンをオフにする状況
    const allButtonsDisabled = (
      raffleState === RaffleStates.EditMenuOpen ||
      raffleState === RaffleStates.PendingEditMutation ||
      raffleState === RaffleStates.PendingWinnerDiscard ||
      raffleState === RaffleStates.PendingWinnerWrite ||
      raffleState === RaffleStates.PendingQueriesRefreshToRolling ||
      raffleState === RaffleStates.PendingQueriesRefreshToPrizeIntroduction
    )


    // データ更新後にStateを自動的に進める
    useEffect(() => {
      if (raffleState === RaffleStates.PendingQueriesRefreshToRolling) {
        if (!anyFetching) {
          setPotentialWinner(null)
          setRaffleState(RaffleStates.Rolling)
        }
      }
      else if (raffleState === RaffleStates.PendingQueriesRefreshToPrizeIntroduction) {
        if (!anyFetching) {
          setPotentialWinner(null)
          setRaffleState(RaffleStates.PrizeIntroduction)
        }
      }

    }, [anyFetching, raffleState])


    // ボタン・キーボード操作共有の操作関数
    const prizeIntroductionToRolling = () => {
      setRaffleState(RaffleStates.Rolling)
    }

    const rollingToPossibleWinnerChosen = () => {
      pickPotentialWinner()
    }

    const confirmPossibleWinner = () => {
      // もし再抽選と確定を同時に押してしまった場合のためにpotentialWinnerを確認する
      // おそらくは起こらないけど、テスト中にキースパムで起きたので
      if (!potentialWinner) { return }
      submitWinnerMutation.mutate({ prizeId: nextPrizeDetails.nextPrize.id, winnerId: potentialWinner.registrationId })
    }

    const discardPossibleWinnner = () => {
      // もし再抽選と確定を同時に押してしまった場合のためにpotentialWinnerを確認する
      // おそらくは起こらないけど、テスト中にキースパムで起きたので
      if (!potentialWinner) { return }
      discardUnavailableWinnerMutation.mutate({ action: "ADD", ids: [potentialWinner.registrationId] })
    }


    // キーボード操作
    useHotkeys([
      // N -> 次へ
      ['n', () => {
        // 編集メニューが開かれてる際は何もしない
        if (editPaneOpen) {
          return
        }
        // 景品表示時->シャッフル画面へ
        if (raffleState === RaffleStates.PrizeIntroduction) {
          prizeIntroductionToRolling()
        }
        else if (raffleState === RaffleStates.Rolling) {
          rollingToPossibleWinnerChosen()
        }
        else if (raffleState === RaffleStates.PossibleWinnerChosen) {
          confirmPossibleWinner()
        }
      }],
      // R -> 当選者を破棄
      ['r', () => {
        // 編集メニューが開かれてる際は何もしない
        if (editPaneOpen) {
          return
        }
        if (raffleState === RaffleStates.PossibleWinnerChosen) {
          discardPossibleWinnner()
        }
      }],
    ]);


    // State別レンダー
    // Initializing -> 最初に起動後、準備が完了するまで待つ
    // 現状は必要なし
    if (raffleState === RaffleStates.Initializing) {
      setRaffleState(RaffleStates.PrizeIntroduction)
      return (

        <Center w="100%" h="100%">
          <DelayedDisplayLoader />
        </Center>

      )
    }

    // 抽選完了時
    else if (raffleState === RaffleStates.RafflingComplete) {
      return (
        <motion.div
          layout
          initial={{ scale: 0, borderRadius: "90px" }}
          animate={{ scale: 1, borderRadius: "0px" }}
          transition={{
            type: "spring",
            stiffness: 700,
            damping: 100,
            mass: 1
          }}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: TRANSITION_PANE_COLOR
          }}
        >
          <Center w="100%" h="100%">
            <motion.div
              layout
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                type: "spring",
                bounce: 0,
                duration: 0.8,
                delay: 0.8
              }}
            >
              <Stack align="center" c={TRANSITION_OVERLAY_TEXT_COLOR}>
                <motion.div layout="position">
                  <PiGift size="128px" style={{ color: TRANSITION_OVERLAY_TEXT_COLOR }} />
                </motion.div>
                <Text component={motion.p} layout="position" size="48px" style={{ color: TRANSITION_OVERLAY_TEXT_COLOR }}>抽選終了!</Text>
                <Box h="48px" />
              </Stack>
            </motion.div>
          </Center>
        </motion.div>
      )
    }

    // その他は見た目が連続するように一つのRenderで対応する
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>

        {/* 景品と当選者関連 */}
        <Stack w="100%" h="100%" align="center" style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}>

          {/* 景品表示 */}
          <AnimatedPrizeDisplay
            focused={raffleState === RaffleStates.PrizeIntroduction}
            prize={nextPrizeDetails.nextPrize}
            prizeIndex={nextPrizeDetails.prizeIndex}
            prizeGroup={nextPrizeDetails.prizeGroup}
            prizeGroupIndex={nextPrizeDetails.prizeIndexInGroup}
          />

          {/* 当選者表示 */}
          <AnimatePresence mode="popLayout">
            {raffleState !== RaffleStates.PrizeIntroduction &&
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  bounce: 0
                }}
                style={{
                  width: "100%",
                  paddingTop: "24px"
                }}
              >
                <NameShuffler
                  participantsList={participants}
                  winner={potentialWinner}
                  overrideDisableRolling={raffleState !== RaffleStates.Rolling}
                />
              </motion.div>

            }
          </AnimatePresence>

        </Stack>

        {/* ロゴ */}
        <div style={{ position: "absolute", bottom: 10, right: 40, width: "150px", height: "150px", color: BUTTON_PRIMARY_BORDER_COLOR, opacity: 0.625 }}>
          <TenkeyLogo />

        </div>

        {/* 制御用ボタン */}
        <Group pb="36px" style={{ position: "absolute", bottom: 0, left: 0, right: 0, width: "100%" }} align="center" justify="center">

          {/* 景品紹介画面 */}
          {raffleState === RaffleStates.PrizeIntroduction &&
            <Button
              disabled={allButtonsDisabled}
              onClick={prizeIntroductionToRolling}
              w="616px"
              h="84px"
              size="28px"
              variant="outline"
              bg={BUTTON_PRIMARY_BACKGROUND_COLOR}
              c={BUTTON_PRIMARY_BORDER_COLOR}
              style={{
                borderColor: BUTTON_PRIMARY_BORDER_COLOR,
                borderWidth: "2px"
              }}
            >
              抽選開始
            </Button>
          }
          {/* シャッフル中 */}
          {raffleState === RaffleStates.Rolling &&
            <Button
              disabled={allButtonsDisabled}
              onClick={rollingToPossibleWinnerChosen}
              w="616px"
              h="84px"
              size="28px"
              bg={BUTTON_PRIMARY_BORDER_COLOR}
            >
              抽選
            </Button>
          }
          {/* 抽選後 */}
          {(
            raffleState === RaffleStates.PossibleWinnerChosen ||
            raffleState === RaffleStates.PendingWinnerDiscard ||
            raffleState === RaffleStates.PendingWinnerWrite ||
            raffleState === RaffleStates.PendingQueriesRefreshToRolling ||
            raffleState === RaffleStates.PendingQueriesRefreshToPrizeIntroduction
          ) &&
            <>
              <Button
                disabled={allButtonsDisabled}
                variant="outline"
                color="orange"
                w="300px"
                h="84px"
                size="28px"
                style={{ borderWidth: "2px" }}
                onClick={discardPossibleWinnner}
              >
                再抽選 (取り消し)
              </Button>
              <Button
                disabled={allButtonsDisabled}
                color="green"
                w="300px"
                h="84px"
                size="28px"
                onClick={confirmPossibleWinner}
              >
                確定
              </Button>
            </>
          }

        </Group>

      </div >

    )
  }