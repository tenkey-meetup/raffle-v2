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

  useEffect(() => {
    console.log("Mappings changed in parent")
  }, [getMappingsQuery.data])

  const anyLoading = getParticipantsQuery.isLoading || getPrizesQuery.isLoading || getMappingsQuery.isLoading || getCancelsQuery.isLoading
  const anyError = getParticipantsQuery.isError || getPrizesQuery.isError || getMappingsQuery.isError || getCancelsQuery.isError

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
              <NavLinks />
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar py="md" px={4}>
        <NavLinks />
      </AppShell.Navbar>

      <AppShell.Main>
        {anyLoading &&
          <Center>
            <Loader />
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

function NavLinks() {

  const [location, navigate] = useLocation()

  return (
    <>
      <UnstyledButton className={classes.control} onClick={() => navigate('~/editor/participants')}>参加者</UnstyledButton>
      <UnstyledButton className={classes.control} onClick={() => navigate('~/editor/prizes')}>景品</UnstyledButton>
      <UnstyledButton className={classes.control} onClick={() => navigate('~/editor/cancels')}>不参加リスト</UnstyledButton>
      <UnstyledButton className={classes.control} onClick={() => navigate('~/editor/mappings')}>抽選結果</UnstyledButton>

      <UnstyledButton className={classes.control} onClick={() => navigate('~/')}>メニューに戻る</UnstyledButton>
    </>
  )
}
