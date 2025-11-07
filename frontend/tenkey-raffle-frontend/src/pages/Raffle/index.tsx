import { AppShell, Burger, Button, Container, Group, Loader, Stack, Title, UnstyledButton, Text, Center, ActionIcon, Popover, Box, Flex, Drawer } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import classes from '../../styles/MobileNavbar.module.css';
import { useQuery } from '@tanstack/react-query';
import { getAllMappings } from '../../requests/Mappings';
import { getAllCancels, getAllParticipants } from '../../requests/Participants';
import { getAllPrizes } from '../../requests/Prizes';
import { useEffect, useMemo, useState } from 'react';
import { PiAppWindowBold, PiArrowClockwise, PiArrowClockwiseBold, PiArrowLeft, PiArrowLeftBold, PiArrowRight, PiArrowRightBold, PiList, PiPenBold, PiPencil, PiPencilBold, PiX, PiXBold } from 'react-icons/pi';
import { motion } from "motion/react"
import { MainView } from './Views/MainView';
import { useLocation } from 'wouter';
import { InRaffleEditMenu } from './Views/InRaffleEditMenu';
import { BUTTON_SECONDARY_BACKGROUND_COLOR, BUTTON_SECONDARY_BORDER_COLOR, FOREGROUND_TEXT_COLOR, WINDOW_HEADER_COLOR } from '@/settings';
import { DelayedDisplayLoader } from '@/components/DelayedDisplayLoader';
import { useWindowSize } from '@react-hook/window-size';
import { StylizedWindow } from '@/components/StylizedWindow';

export function Raffle() {

  const [location, navigate] = useLocation()
  const [controlPopoverOpened, setControlPopoverOpened] = useState(false)
  const [editPaneOpened, { open: openEditPane, close: closeEditPane }] = useDisclosure(false);
  const drawerFullWidth = useMediaQuery(`(max-width: 1000px)`);
  const [viewportWidth, viewportHeight] = useWindowSize()
  const windowWidth = viewportWidth * 0.75
  const windowHeight = viewportHeight * 0.9

  // 参加者リスト
  const getParticipantsQuery = useQuery(
    {
      queryKey: ['getParticipants'],
      queryFn: getAllParticipants
    }
  )

  // 景品リスト
  const getPrizesQuery = useQuery(
    {
      queryKey: ['getPrizes'],
      queryFn: getAllPrizes
    }
  )

  // 抽選結果リスト
  const getMappingsQuery = useQuery(
    {
      queryKey: ['getMappings'],
      queryFn: getAllMappings
    }
  )

  // 当日不参加リスト
  const getCancelsQuery = useQuery(
    {
      queryKey: ['getCancels'],
      queryFn: getAllCancels
    }
  )

  const anyLoading = getParticipantsQuery.isLoading || getPrizesQuery.isLoading || getMappingsQuery.isLoading || getCancelsQuery.isLoading
  const anyFetching = getParticipantsQuery.isFetching || getPrizesQuery.isFetching || getMappingsQuery.isFetching || getCancelsQuery.isFetching
  const anyError = getParticipantsQuery.isError || getPrizesQuery.isError || getMappingsQuery.isError


  // すべてのMappingsに利用されている景品IDと参加者IDが景品・参加者リストに存在することを確認
  const mappingsSanityCheckRejects = useMemo(() => {
    if (anyLoading) { return [] }

    const rejects = []

    for (const mapping of getMappingsQuery.data) {
      if (!getPrizesQuery.data.find(entry => entry.id === mapping.prizeId)) {
        rejects.push(mapping)
      }
      else if (mapping.winnerId && !getParticipantsQuery.data.find(entry => entry.registrationId === mapping.winnerId)) {
        rejects.push(mapping)
      }
    }

    return rejects

  }, [anyLoading])

  if (mappingsSanityCheckRejects.length > 0) {
    console.error("Mappings mismatch to prize/participants data!")
    console.error(mappingsSanityCheckRejects)
    return null
  }

  return (
    <>
      {/* 編集用メニュー表示 */}
      <Drawer
        opened={editPaneOpened}
        onClose={closeEditPane}
        position="right"
        size={drawerFullWidth ? "100%" : "66.7%"}
        title="抽選状況の編集"
      >
        <InRaffleEditMenu
          participants={getParticipantsQuery.data}
          prizes={getPrizesQuery.data}
          mappings={getMappingsQuery.data}
          closeMenu={closeEditPane}
        />
      </Drawer>


      {/* 表示画面 */}
      <div style={{ width: "100vw", height: "100vh", position: "relative" }}>

        {/* 背景 */}
        <div style={{ width: "100vw", height: "100vh", position: "absolute", top: 0, left: 0, overflow: "hidden" }}>
          <img src="/bg.avif" width="100%" height="100%" style={{ overflow: "hidden", objectPosition: "center", objectFit: "cover" }} />

        </div>

        {/* メイン画面 */}
        <div style={{ width: "100vw", height: "100vh", position: "absolute", top: 0, left: 0 }}>


          <Center h="100%">
            <StylizedWindow
              width={windowWidth}
              height={windowHeight}
            >
              <>
                {anyLoading &&
                  <Center h="100vh">
                    <DelayedDisplayLoader />
                  </Center>
                }
                {anyError &&
                  <Container>
                    <Title>エラー</Title>
                    {getParticipantsQuery.isError && <Text>参加者データ：{JSON.stringify((getParticipantsQuery.error as Error).message)}</Text>}
                    {getPrizesQuery.isError && <Text>景品データ：{JSON.stringify((getPrizesQuery.error as Error).message)}</Text>}
                    {getMappingsQuery.isError && <Text>抽選結果データ：{JSON.stringify((getMappingsQuery.error as Error).message)}</Text>}
                  </Container>
                }
                {(!anyLoading && !anyError) &&
                  <MainView
                    participants={getParticipantsQuery.data}
                    prizes={getPrizesQuery.data}
                    mappings={getMappingsQuery.data}
                    cancels={getCancelsQuery.data}
                    anyFetching={anyFetching}
                  />
                }
              </>
            </StylizedWindow>
          </Center>

        </div>

        {/* 編集メニュー */}

        <div style={{ position: "absolute", right: 32, bottom: 32 }}>
          <Popover width={200} position="top" withArrow shadow="md" opened={controlPopoverOpened} onDismiss={() => setControlPopoverOpened(false)}>
            <Popover.Target>
              <ActionIcon variant="filled" color={BUTTON_SECONDARY_BORDER_COLOR} size="3em" bdrs="100%" onClick={() => setControlPopoverOpened(!controlPopoverOpened)}>
                <PiList size="1.5em" />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack>
                <Button
                  leftSection={<PiPencilBold size="1em" />}
                  onClick={() => { setControlPopoverOpened(false); openEditPane() }}
                  bg={BUTTON_SECONDARY_BACKGROUND_COLOR}
                  c={BUTTON_SECONDARY_BORDER_COLOR}
                  style={{
                    outlineColor: BUTTON_SECONDARY_BORDER_COLOR,
                    outlineWidth: "2px",
                    outlineStyle: "solid"
                  }}
                >
                  当選者の編集
                </Button>
                <Button
                  leftSection={<PiXBold size="1em" />}
                  onClick={() => navigate("~/transition/exit")}
                  bg={BUTTON_SECONDARY_BACKGROUND_COLOR}
                  c={BUTTON_SECONDARY_BORDER_COLOR}
                  style={{
                    outlineColor: BUTTON_SECONDARY_BORDER_COLOR,
                    outlineWidth: "2px",
                    outlineStyle: "solid"
                  }}
                >
                  抽選を中断
                </Button>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </div>
      </div >
    </>
  );
}