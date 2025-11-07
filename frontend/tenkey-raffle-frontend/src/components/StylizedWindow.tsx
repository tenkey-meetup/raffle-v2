import { BUTTON_PRIMARY_BORDER_COLOR, WINDOW_HEADER_COLOR, BUTTON_PRIMARY_BACKGROUND_COLOR, FOREGROUND_TEXT_COLOR } from "@/settings"
import { Flex, Group, Box, Center, Stack, Title, Button, Text } from "@mantine/core"
import { motion } from "motion/react"
import { PiArrowLeftBold, PiArrowRightBold, PiArrowClockwiseBold, PiAppWindowBold, PiXBold } from "react-icons/pi"
import { navigate } from "wouter/use-browser-location"
import { TenkeyLogo } from "./TenkeyLogo"
import { Ref } from "react"

export const StylizedWindow: React.FC<{
  width: number,
  height: number,
  windowRef?: Ref<any>,
  children?: React.ReactNode
}> = ({
  width,
  height,
  windowRef,
  children
}) => {

    return (
      <Flex ref={windowRef || null} direction="column" bg="white" style={{ borderRadius: "11.5px", width: `${width}px`, height: `${height}px`, borderStyle: "solid", borderColor: BUTTON_PRIMARY_BORDER_COLOR, borderWidth: "3px 6px 6px 3px", overflow: "hidden" }}>
        <Flex direction="row" align="center" w="100%" h="51px" style={{ backgroundColor: WINDOW_HEADER_COLOR, borderStyle: "solid", borderColor: BUTTON_PRIMARY_BORDER_COLOR, borderWidth: "0px 0px 3px 0px" }}>
          <Group px="20px" gap="16px">
            <PiArrowLeftBold size="22px" color={BUTTON_PRIMARY_BORDER_COLOR} />
            <PiArrowRightBold size="22px" color={BUTTON_PRIMARY_BORDER_COLOR} />
            <PiArrowClockwiseBold size="22px" color={BUTTON_PRIMARY_BORDER_COLOR} />
          </Group>
          <Box style={{ flexGrow: 1 }} />
          <Group px="0.5em" gap="0.1em">
            <Center w="32px" h="24px" bdrs="5px" style={{ backgroundColor: BUTTON_PRIMARY_BACKGROUND_COLOR, borderStyle: "solid", borderColor: BUTTON_PRIMARY_BORDER_COLOR, borderWidth: "2px" }}>
              <Box style={{width: "18px", height: "15px", borderColor: BUTTON_PRIMARY_BORDER_COLOR, borderStyle: "solid", borderWidth: "0px 0px 2px 0px"}} />
            </Center>
            <Center w="32px" h="24px" bdrs="5px" style={{ backgroundColor: BUTTON_PRIMARY_BACKGROUND_COLOR, borderStyle: "solid", borderColor: BUTTON_PRIMARY_BORDER_COLOR, borderWidth: "2px" }}>
              <Box style={{width: "20px", height: "15px", backgroundColor: BUTTON_PRIMARY_BORDER_COLOR, position: "relative"}}>
                <Box style={{width: "16px", height: "9px", backgroundColor: BUTTON_PRIMARY_BACKGROUND_COLOR, position: "absolute", left: 2, bottom: 2}}></Box>
              </Box>
            </Center>
            <Center w="32px" h="24px" bdrs="5px" style={{ backgroundColor: BUTTON_PRIMARY_BACKGROUND_COLOR, borderStyle: "solid", borderColor: BUTTON_PRIMARY_BORDER_COLOR, borderWidth: "2px" }}>
              <PiXBold size="1.5em" color={BUTTON_PRIMARY_BORDER_COLOR} />
            </Center>
          </Group>
        </Flex>
        <Box w="100%" h="100%" style={{flexGrow: 1}}>
          {children}
        </Box>
      </Flex>
    )
  }