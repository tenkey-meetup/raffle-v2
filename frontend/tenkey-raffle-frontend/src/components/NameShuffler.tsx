import { Text, Box, Center, Stack, Group } from "@mantine/core"
import { AnimatePresence, LayoutGroup, motion, useAnimate } from "motion/react"
import { useEffect, useMemo, useRef, useState } from "preact/hooks"
import { Participant } from "../types/BackendTypes"
import { sleep } from "../util/util"
import { PiInfoBold, PiWarningBold } from "react-icons/pi"

const SHUFFLE_DELAY_MS = 20
const SHUFFLE_ANIMATION_DURATION_MS = 125
const SETTLE_ANIMATION_DURATION_MS = 150
const SIMULTANEOUS_TEXT_ELEMENTS = Math.ceil(SHUFFLE_ANIMATION_DURATION_MS / SHUFFLE_DELAY_MS)
const FONT_SIZE = 120 // Framer-Motionが正しくAbsolute・Relativeを考慮しないため、フォントサイズを変更すると壊れます

export const NameShuffler: React.FC<{
  participantsList: Participant[],
  winner: Participant | null
}> = ({
  participantsList,
  winner
}) => {



    const participantsPool = useRef<Participant[]>([])
    const [nameIndex, setNameIndex] = useState<number>(0)
    const currentNames = useRef<string[]>([])

    // アニメーション・表示用
    const [winnerScope, winnerAnimate] = useAnimate()
    const outerDivRef = useRef(null)
    const winnerTextRef = useRef(null)


    // 表示の自動制御（当選者表示、シャッフル等）
    // TODO: Deal with race condition between winner and nameIndex leading to duplicate calls 
    // Maybe separate into two useEffects?
    useEffect(() => {
      if (participantsList.length <= 0) {
        return
      }

      // 当選者が指定された場合はそれを表示
      if (winner) {
        // 表示リストを削除してシャッフルを停止
        currentNames.current = []
        console.log(winner.displayName)
        if (!winnerScope.current) {
          return
        }
        const animateWinner = async () => {
          // 名前が中央に移動するまで待つ
          await winnerAnimate(winnerScope.current, { top: `${FONT_SIZE * 0.5}px` }, { duration: SHUFFLE_ANIMATION_DURATION_MS / 1000 })
          await sleep(SETTLE_ANIMATION_DURATION_MS / 3)

          // 名前が外枠に収まってるかを確認
          let winnerTextWidth = winnerTextRef.current?.getBoundingClientRect().width
          let outerDivWidth = outerDivRef.current?.getBoundingClientRect().width

          // 収まってない場合は縮小する
          if (winnerTextWidth && outerDivWidth && winnerTextWidth > outerDivWidth) {
            await winnerAnimate(winnerScope.current, { scale: Math.abs(outerDivWidth / winnerTextWidth) - 0.01 }, { duration: SETTLE_ANIMATION_DURATION_MS / 1000 })
          }

          // 収まっている場合は大きさのアニメーションを行う
          else {
            await winnerAnimate(winnerScope.current, { scale: 1.125 }, { duration: SETTLE_ANIMATION_DURATION_MS / 1000 / 1.5 })
            await winnerAnimate(winnerScope.current, { scale: 1 }, { duration: SETTLE_ANIMATION_DURATION_MS / 1000 / 1.5 })
          }

        }
        animateWinner()
      }

      // 当選者が指定されてない場合はシャッフル
      else {
        const timer = setTimeout(() => {

          // 名前プールが空の場合、再作成する
          if (participantsPool.current.length <= 0) {
            // console.log("Regenerating pool")
            participantsPool.current = [
              ...participantsList
                .map(entry => ({ participant: entry, sortValue: Math.random() }))
                .sort((a, b) => a.sortValue - b.sortValue)
                .map(entry => entry.participant)
            ]
            // console.log(namesPool.current)
          }

          // 現在指定のIndexに新たな名前を書き込む
          currentNames.current[nameIndex] = participantsPool.current.pop().displayName

          // namesIndexを移動、Stateの更新によって際レンダー
          setNameIndex((nameIndex + 1) % SIMULTANEOUS_TEXT_ELEMENTS)
        }, SHUFFLE_DELAY_MS)
        return () => {
          clearTimeout(timer)
        }
      }
    }, [nameIndex, winner])

    // 重複する表示名の参加者が存在する場合、ユーザー名とIDをオレンジに表示する

    const duplicateWinnerNames = useMemo(() => {
      if (!winner) {
        return
      }
      const usersWithSameName = participantsList.filter(entry => entry.displayName === winner.displayName)
      return usersWithSameName.length > 1 ? true : false
    }, [winner])

    return (
      <div style={{ position: "relative", height: `${FONT_SIZE * 2}px`, overflow: "hidden", width: "100%" }} ref={outerDivRef} >
        {/* 名前部分 */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, height: "100%" }}>

          {/* 名前コンテナ */}
          <div style={{ position: "relative", top: 0, bottom: 0, left: 0, right: 0, width: "100%", height: "100%" }}>


            <AnimatePresence
              mode="popLayout"
            >

              {/* シャッフル */}
              {!winner && currentNames.current.map((name, index) => (
                <motion.div
                  style={{ position: "absolute", left: 0, right: 0, height: 0, textAlign: "center" }}
                  key={`animated-text-${name}-${index}`}
                  initial={{ top: `-${FONT_SIZE * 1}px` }}
                  animate={{ top: `${FONT_SIZE * 2}px`, visibility: "hidden" }}
                  transition={{ duration: SHUFFLE_ANIMATION_DURATION_MS / 1000 }}
                >

                  <Text
                    size={`${FONT_SIZE}px`}
                    style={{ height: 0 }}
                  >
                    {name}
                  </Text>

                </motion.div>
              ))}

              {/* 当選者表示 */}
              {winner &&
                <motion.div
                  ref={winnerScope}
                  style={{ position: "absolute", top: "50%", left: 0, right: 0, textAlign: "center" }}
                  key={`animated-text-winner`}
                  initial={{ top: `calc(-100% - 1em)` }}
                // animate={{ top: `-${FONT_SIZE * 0.25}em`}}
                // transition={{ duration: SHUFFLE_ANIMATION_DURATION_MS / 1000 }}
                >
                  <Center>
                    <Text
                      size={`${FONT_SIZE}px`}
                      style={{ whiteSpace: "nowrap", width: "fit-content" }}
                      ref={winnerTextRef}
                    >
                      {winner.displayName}
                    </Text>
                  </Center>
                </motion.div>
              }
            </AnimatePresence>
          </div>
        </div>

        {/* フェード部分 */}
        <div style={{
          position: "absolute",
          paddingBottom: `${FONT_SIZE * 0.5}px`,
          top: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(180deg,rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)",
        }} />
        <div style={{
          position: "absolute",
          paddingTop: `${FONT_SIZE * 0.5}px`,
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(0deg,rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)",
        }} />

        {/* 当選者詳細 */}
        {winner &&
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: SETTLE_ANIMATION_DURATION_MS / 1000, delay: SHUFFLE_ANIMATION_DURATION_MS / 1000 * 2 }}
            >
              <Group gap="lg" align="center" justify="center">
                {duplicateWinnerNames && <PiInfoBold size="1.5em" color="var(--mantine-color-orange-filled)" /> }
                <Text size="xl" c={duplicateWinnerNames ? "orange" : "dimmed"}>ユーザー名: {winner.username}</Text>
                <Text size="xl" c={duplicateWinnerNames ? "orange" : "dimmed"}>ID: {winner.registrationId}</Text>
              </Group>
            </motion.div>
          </div>
        }

      </div>




    )

  }