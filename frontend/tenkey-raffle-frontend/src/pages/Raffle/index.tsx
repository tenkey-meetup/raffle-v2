import { AppShell, Burger, Button, Container, Group, Loader, Stack, Title, UnstyledButton, Text, Center, ActionIcon, Popover, Box, Flex, Drawer } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import classes from '../../styles/MobileNavbar.module.css';
import { useQuery } from '@tanstack/react-query';
import { getAllMappings } from '../../requests/Mappings';
import { getAllCancels, getAllParticipants } from '../../requests/Participants';
import { getAllPrizes } from '../../requests/Prizes';
import { useEffect, useState } from 'react';
import { PiAppWindowBold, PiArrowClockwise, PiArrowClockwiseBold, PiArrowLeft, PiArrowLeftBold, PiArrowRight, PiArrowRightBold, PiList, PiPenBold, PiPencil, PiPencilBold, PiX, PiXBold } from 'react-icons/pi';
import { motion } from "motion/react"
import { MainView } from './Views/MainView';
import { useLocation } from 'wouter';
import { InRaffleEditMenu } from './Views/InRaffleEditMenu';

export function Raffle() {

  const [location, navigate] = useLocation()
  const [controlPopoverOpened, setControlPopoverOpened] = useState(false)
  const [editPaneOpened, { open: openEditPane, close: closeEditPane }] = useDisclosure(false);

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

  const drawerFullWidth = useMediaQuery(`(max-width: 1000px)`);

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
          {anyLoading &&
            <Center h="100vh">
              <Loader />
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
            <Center h="100%">
              <Flex direction="column" bg="white" h="90%" w="75%" bdrs="md" style={{ borderStyle: "solid", borderColor: "rgb(91, 69, 46)", borderWidth: "2px 6px 6px 2px", overflow: "hidden" }}>
                <Flex direction="row" align="center" w="100%" h="3em" style={{ backgroundColor: "rgb(216, 42, 77)", borderStyle: "solid", borderColor: "rgb(91, 69, 46)", borderWidth: "0px 0px 2.5px 0px" }}>
                  <Group px="1em" gap="0.75em">
                    <PiArrowLeftBold size="1.6em" color="rgb(91, 69, 46)" />
                    <PiArrowRightBold size="1.6em" color="rgb(91, 69, 46)" />
                    <PiArrowClockwiseBold size="1.6em" color="rgb(91, 69, 46)" />
                  </Group>
                  <Box style={{ flexGrow: 1 }} />
                  <Group px="0.5em" gap="0.1em">
                    <Center w="2em" h="1.5em" bdrs="0.3em" style={{ backgroundColor: "rgb(242, 214, 184)", borderStyle: "solid", borderColor: "rgb(91, 69, 46)", borderWidth: "1.5px" }}>
                      <Text size="2em" color="rgb(91, 69, 46)" pb="0.6em">_</Text>
                    </Center>
                    <Center w="2em" h="1.5em" bdrs="0.3em" style={{ backgroundColor: "rgb(242, 214, 184)", borderStyle: "solid", borderColor: "rgb(91, 69, 46)", borderWidth: "1.5px" }}>
                      <PiAppWindowBold size="1.5em" color="rgb(91, 69, 46)" />
                    </Center>
                    <Popover width={200} position="bottom" withArrow shadow="md">
                      <Popover.Target>
                        <Center w="2em" h="1.5em" bdrs="0.3em" style={{ backgroundColor: "rgb(242, 214, 184)", borderStyle: "solid", borderColor: "rgb(91, 69, 46)", borderWidth: "1.5px", cursor: "pointer" }}>
                          <PiXBold size="1.5em" color="rgb(91, 69, 46)" />
                        </Center>
                      </Popover.Target>
                      <Popover.Dropdown>
                        <Stack>
                          <Button leftSection={<PiPencilBold size="1em" />} onClick={() => { setControlPopoverOpened(false); openEditPane() }}>
                            当選者の編集
                          </Button>
                          <Button leftSection={<PiXBold size="1em" />} onClick={() => navigate("~/")}>
                            抽選を中断
                          </Button>
                        </Stack>
                      </Popover.Dropdown>
                    </Popover>
                  </Group>
                </Flex>
                <Box style={{ flexGrow: 1 }}>
                  <MainView
                    participants={getParticipantsQuery.data}
                    prizes={getPrizesQuery.data}
                    mappings={getMappingsQuery.data}
                    cancels={getCancelsQuery.data}
                    anyFetching={anyFetching}
                  />
                </Box>
              </Flex>
            </Center>
          }
        </div>

        {/* 編集メニュー */}

        <div style={{ position: "absolute", right: 32, bottom: 32 }}>
          <Popover width={200} position="top" withArrow shadow="md" opened={controlPopoverOpened} onDismiss={() => setControlPopoverOpened(false)}>
            <Popover.Target>
              <ActionIcon variant="filled" color="rgb(216, 42, 77)" size="3em" bdrs="100%" onClick={() => setControlPopoverOpened(!controlPopoverOpened)}>
                <PiList size="1.5em" />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack>
                <Button leftSection={<PiPencilBold size="1em" />} onClick={() => { setControlPopoverOpened(false); openEditPane() }}>
                  当選者の編集
                </Button>
                <Button leftSection={<PiXBold size="1em" />} onClick={() => navigate("~/")}>
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