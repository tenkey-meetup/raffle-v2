import { Text, Box } from "@mantine/core"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"
import { useEffect, useRef, useState } from "preact/hooks"

const SHUFFLE_DELAY_MS = 40
const ANIMATION_DURATION_MS = 200
const SIMULTANEOUS_TEXT_ELEMENTS = Math.ceil(ANIMATION_DURATION_MS / SHUFFLE_DELAY_MS)

export const NameRaffleView: React.FC<{
  namesList: string[],
  fontSize: number
}> = ({
  namesList,
  fontSize
}) => {

    const namesPool = useRef<string[]>([])
    const [nameIndex, setNameIndex] = useState<number>(0)
    const currentNames = useRef<string[]>([])

    useEffect(() => {

      if (namesList.length <= 0) {
        return
      }

      const timer = setTimeout(() => {

        // 名前プールが空の場合、再作成する
        if (namesPool.current.length <= 0) {
          console.log("Regenerating pool")
          namesPool.current = [
            ...namesList
              .map(entry => ({ name: entry, sortValue: Math.random() }))
              .sort((a, b) => a.sortValue - b.sortValue)
              .map(entry => entry.name)
          ]
          console.log(namesPool.current)
        }

        // 現在指定のIndexに新たな名前を書き込む
        currentNames.current[nameIndex] = namesPool.current.pop()

        // namesIndexを移動、Stateの更新によって際レンダー
        setNameIndex((nameIndex + 1) % SIMULTANEOUS_TEXT_ELEMENTS)

      }, SHUFFLE_DELAY_MS)

      return () => {
        clearTimeout(timer)
      }

    }, [nameIndex, namesList])

    return (


      <div style={{ position: "relative", height: `${fontSize * 2}em`, overflow: "hidden", width: "100%" }} >
        {/* シャッフル部分 */}
        <div style={{ position: "absolute", top: `-${fontSize / 3 * 2}em`, left: 0, right: 0 }}>
          <div style={{ position: "relative" }}>
            <AnimatePresence
              mode="popLayout"
            >
              {currentNames.current.map(name => (
                <motion.div
                  layoutRoot
                  style={{ position: "absolute", top: `-${fontSize}`, left: 0, right: 0, textAlign: "center" }}
                  key={`animated-text-${name}`}
                  initial={{ top: `-${fontSize * 2}em` }}
                  animate={{ top: `${fontSize * 2}em`, visibility: "hidden" }}
                  transition={{ duration: ANIMATION_DURATION_MS / 1000 }}
                >
                  <Text

                    size={`${fontSize}em`}
                  >
                    {name}
                  </Text>
                </motion.div>
              ))

              }
            </AnimatePresence>
          </div>
        </div>

        {/* フェード部分 */}
        <div style={{
          position: "absolute",
          paddingBottom: `${fontSize * 0.5}em`,
          top: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(180deg,rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)",
        }}/>
        <div style={{
          position: "absolute",
          paddingTop: `${fontSize * 0.5}em`,
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(0deg,rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)",
        }}/>
          

        
      </div>




    )

  }