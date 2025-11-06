import { AnimationOptions, motion, useAnimate } from "motion/react"
import { useState, useEffect, useRef } from "react"
import { Prize } from "../types/BackendTypes"
import { Title, Text } from "@mantine/core"
import { useBudoux } from "../util/BudouxParse"
import { p } from "motion/react-client"
import { WordWrapSpan } from "./WordWrapSpan"
import { sanitizePrizeName } from "@/util/SanitizePrizeName"


const COLOR_TITLE_FOCUSED = "#000000"
const COLOR_TITLE_DIMMED = "#495057"

const COLOR_PROVIDER_FOCUSED = "#495057"
const COLOR_PROVIDER_DIMMED = "#868e96"

const COLOR_BG_FOCUSED = "#FFFFFF"
const COLOR_BG_DIMMED = "#e9ecef"

const COLOR_TRANSITION_TIME = 0.6
const TEXT_MOTION_TIME = 0.4



export const AnimatedPrizeDisplay: React.FC<{
  prize: Prize | null,
  focused: boolean
}> = ({
  prize,
  focused
}) => {
    p
    const { budouxParser } = useBudoux()
    const [titleScope, titleAnimate] = useAnimate()
    const [providerScope, providerAnimate] = useAnimate()
    const [bgScope, bgAnimate] = useAnimate()

    const DEFAULT_TRANSITIONS: AnimationOptions = {
      type: "spring",
      bounce: 0
    }


    useEffect(() => {
      if (!titleScope.current || !providerScope.current) return
      if (!prize) return

      if (focused) {
        titleAnimate(titleScope.current, { color: COLOR_TITLE_FOCUSED }, { duration: COLOR_TRANSITION_TIME, ...DEFAULT_TRANSITIONS })
        titleAnimate(titleScope.current, { fontSize: "100px", fontWeight: 600 }, { duration: TEXT_MOTION_TIME, ...DEFAULT_TRANSITIONS })

        providerAnimate(providerScope.current, { color: COLOR_PROVIDER_FOCUSED }, { duration: COLOR_TRANSITION_TIME, ...DEFAULT_TRANSITIONS })
        providerAnimate(providerScope.current, { fontSize: "50px", fontWeight: 350 }, { duration: TEXT_MOTION_TIME, ...DEFAULT_TRANSITIONS })

        bgAnimate(bgScope.current, { backgroundColor: COLOR_BG_FOCUSED }, { duration: TEXT_MOTION_TIME, ...DEFAULT_TRANSITIONS })

      } else {
        titleAnimate(titleScope.current, { color: COLOR_TITLE_DIMMED }, { duration: COLOR_TRANSITION_TIME, ...DEFAULT_TRANSITIONS })
        titleAnimate(titleScope.current, { fontSize: "48px", fontWeight: 650 }, { duration: TEXT_MOTION_TIME, ...DEFAULT_TRANSITIONS })

        providerAnimate(providerScope.current, { color: COLOR_PROVIDER_DIMMED }, { duration: COLOR_TRANSITION_TIME, ...DEFAULT_TRANSITIONS })
        providerAnimate(providerScope.current, { fontSize: "30px", fontWeight: 500 }, { duration: TEXT_MOTION_TIME, ...DEFAULT_TRANSITIONS })

        bgAnimate(bgScope.current, { backgroundColor: COLOR_BG_DIMMED }, { duration: TEXT_MOTION_TIME, ...DEFAULT_TRANSITIONS })
      }
    }, [focused])

    if (!prize) { return null }

    return (
      <motion.div layout layoutRoot
        ref={bgScope}
        style={{
          display: "flex",
          width: "100%",
          flexDirection: focused ? "column" : "row",
          alignItems: focused ? "center" : "center",
          gap: focused ? "32px" : "0em",
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingTop: focused ? "36px" : "12px",
          paddingBottom: focused ? "24px" : "24px",
          backgroundColor: COLOR_BG_FOCUSED
        }}
      >
        <motion.div
          layout="position"
          style={{
            flexGrow: focused ? "0" : "1",
          }}
          transition={{
            type: "spring",
            bounce: 0,
            duration: TEXT_MOTION_TIME
          }}
        >
          <Text
            component={motion.p}
            ref={titleScope}
            id="giveawayTitle"
            pt={0}
            style={{
              textAlign: focused ? "center" : "start",
              display: "block",
              fontSize: focused ? "5em" : "2.5em",
            }}
          >
            {/* {budouxParser(prize.displayName.replace(/<\/?[^>]+(>|$)/g, "　​"))} */}
            <WordWrapSpan>
              {sanitizePrizeName(prize.displayName)}
            </WordWrapSpan>
          </Text>
        </motion.div>
        <motion.div
          layout="position"
          transition={{
            type: "spring",
            bounce: 0,
            duration: TEXT_MOTION_TIME
          }}
        >
          <Text
            component={motion.p}
            ref={providerScope}
            id="giveawayProvider"
            style={{
              display: "block"
            }}
          >
            {/* by {budouxParser(prize.provider.replace(/<\/?[^>]+(>|$)/g, "　​"))} */}
            <WordWrapSpan>
              by {sanitizePrizeName(prize.provider)}
            </WordWrapSpan>
          </Text>
        </motion.div>
      </motion.div>
    )
  }