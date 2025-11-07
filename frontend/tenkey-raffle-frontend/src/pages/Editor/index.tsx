import { AppShell, Burger, Button, Container, Group, Loader, Stack, Title, UnstyledButton, Text, Center } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from '../../styles/MobileNavbar.module.css';
import { HomeView } from './Views/HomeView';
import { ParticipantsView } from './Views/ParticipantsView';
import { MappingsView } from './Views/MappingsView';
import { useQuery } from '@tanstack/react-query';
import { getAllMappings } from '../../requests/Mappings';
import { getAllCancels, getAllParticipants } from '../../requests/Participants';
import { getAllPrizes } from '../../requests/Prizes';
import { useEffect } from 'react';
import { PrizesView } from './Views/PrizesView';
import { CancelsView } from './Views/CancelsView';
import { useLocation, Switch, Route } from 'wouter';
import { motion } from 'motion/react';
import { notifications } from '@mantine/notifications';
import { DelayedDisplayLoader } from '@/components/DelayedDisplayLoader';

export function Editor() {

  const [location, navigate] = useLocation()
  const [opened, { toggle }] = useDisclosure();

  // 参加者リスト
  const getParticipantsQuery = useQuery(
    {
      queryKey: ['getParticipants'],
      queryFn: getAllParticipants
    }
  )

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

  // 不参加リスト
  const getCancelsQuery = useQuery(
    {
      queryKey: ['getCancels'],
      queryFn: getAllCancels
    }
  )

  const anyLoading = getParticipantsQuery.isLoading || getPrizesQuery.isLoading || getMappingsQuery.isLoading || getCancelsQuery.isLoading
  const anyError = getParticipantsQuery.isError || getPrizesQuery.isError || getMappingsQuery.isError || getCancelsQuery.isError


  // 取得データにミスマッチがある場合は警告する
  useEffect(() => {
    if (anyLoading) { return }

    let unknownMappingWinnerIds: string[] = []
    let unknownMappingPrizeIds: string[] = []
    let unknownCancelReferences: string[] = []

    for (const mapping of getMappingsQuery.data) {
      if (!getPrizesQuery.data.find(entry => entry.id === mapping.prizeId)) {
        unknownMappingPrizeIds.push(mapping.prizeId)
      }
      if (mapping.winnerId && !getParticipantsQuery.data.find(entry => entry.registrationId === mapping.winnerId)) {
        unknownMappingWinnerIds.push(mapping.winnerId)
      }
    }

    for (const cancelId of getCancelsQuery.data) {
      if (!getParticipantsQuery.data.find(entry => entry.registrationId === cancelId)) {
        unknownCancelReferences.push(cancelId)
      }
    }

    if (unknownMappingWinnerIds.length > 0) {
      notifications.show({
        color: "red",
        title: "エラー",
        message: `以下の抽選結果マッピングに利用されている当選者IDに対応する参加者データが存在しません：${unknownMappingWinnerIds.join('、')}`,
        autoClose: 7000,
      })
    }

    if (unknownMappingPrizeIds.length > 0) {
      notifications.show({
        color: "red",
        title: "エラー",
        message: `以下の抽選結果マッピングに利用されている景品IDに対応する景品データが存在しません：${unknownMappingPrizeIds.join('、')}`,
        autoClose: 7000,
      })
    }

    if (unknownCancelReferences.length > 0) {
      notifications.show({
        color: "red",
        title: "エラー",
        message: `以下の当日不参加リストに含まれている受付番号が参加者一覧に存在しません：${unknownCancelReferences.join('、')}`,
        autoClose: 7000,
      })
    }

  }, [anyLoading, getParticipantsQuery.data, getPrizesQuery.data, getMappingsQuery.data, getCancelsQuery.data])

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { desktop: true, mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Group justify="space-between" style={{ flex: 1 }}>
            天キー抽選システム
            <Group ml="xl" gap={0} visibleFrom="sm">
              <NavLinks disableLinks={anyLoading} />
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar py="md" px={4}>
        <NavLinks disableLinks={anyLoading} />
      </AppShell.Navbar>

      <AppShell.Main>
        {anyLoading &&
          <Center>
            <DelayedDisplayLoader />
          </Center>
        }
        {anyError &&
          <Container>
            <Title>エラー</Title>
            {getParticipantsQuery.isError && <Text>参加者データ：{JSON.stringify((getParticipantsQuery.error as Error).message)}</Text>}
            {getPrizesQuery.isError && <Text>景品データ：{JSON.stringify((getPrizesQuery.error as Error).message)}</Text>}
            {getMappingsQuery.isError && <Text>抽選結果データ：{JSON.stringify((getMappingsQuery.error as Error).message)}</Text>}
            {getCancelsQuery.isError && <Text>当日不参加データ：{JSON.stringify((getCancelsQuery.error as Error).message)}</Text>}
          </Container>
        }
        {(!anyLoading && !anyError) &&
          <Switch>
            <Route path="/" component={HomeView} />
            <Route path="/participants">
              <ParticipantsView participants={getParticipantsQuery.data} mappings={getMappingsQuery.data} cancels={getCancelsQuery.data} />
            </Route>
            <Route path="/prizes">
              <PrizesView prizes={getPrizesQuery.data} mappings={getMappingsQuery.data} />
            </Route>
            <Route path="/cancels">
              <CancelsView participants={getParticipantsQuery.data} cancels={getCancelsQuery.data} />
            </Route>
            <Route path="/mappings">
              <MappingsView participants={getParticipantsQuery.data} prizes={getPrizesQuery.data} mappings={getMappingsQuery.data} />
            </Route>
          </Switch>
        }
      </AppShell.Main>
    </AppShell>
  );
}

function NavLinks({ disableLinks }) {

  const [location, navigate] = useLocation()

  return (
    <>
      {!disableLinks &&
        <>
          <UnstyledButton className={classes.control} onClick={() => navigate('~/editor/participants')}>参加者</UnstyledButton>
          <UnstyledButton className={classes.control} onClick={() => navigate('~/editor/prizes')}>景品</UnstyledButton>
          <UnstyledButton className={classes.control} onClick={() => navigate('~/editor/cancels')}>不参加リスト</UnstyledButton>
          <UnstyledButton className={classes.control} onClick={() => navigate('~/editor/mappings')}>抽選結果</UnstyledButton>
        </>
      }

      <UnstyledButton className={classes.control} onClick={() => navigate('~/')}>メニューに戻る</UnstyledButton>
    </>
  )
}
