import { AppShell, Burger, Button, Container, Group, Loader, Stack, Title, UnstyledButton, Text, Center } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Route, Router, useLocation } from 'preact-iso';
import classes from '../../styles/MobileNavbar.module.css';
import { HomeView } from './Views/HomeView';
import { ParticipantsView } from './Views/ParticipantsView';
import { MappingsView } from './Views/MappingsView';
import { useQuery } from '@tanstack/react-query';
import { getAllMappings } from '../../requests/Mappings';
import { getAllParticipants } from '../../requests/Participants';
import { getAllPrizes } from '../../requests/Prizes';
import { useEffect } from 'preact/hooks';
import React from 'preact/compat';
import { PrizesView } from './Views/PrizesView';

export function Editor() {

  const location = useLocation()
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

  useEffect(() => {
    console.log("Mappings changed in parent")
  }, [getMappingsQuery.data])

  const anyLoading = getParticipantsQuery.isLoading || getPrizesQuery.isLoading || getMappingsQuery.isLoading
  const anyError = getParticipantsQuery.isError || getPrizesQuery.isError || getMappingsQuery.isError

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
            天キー抽選結果システム
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
        <Container>

          {anyLoading &&
            <Center>
              <Loader />
            </Center>
          }
          {anyError &&
            <>
              <Title>エラー</Title>
              {getParticipantsQuery.isError && <Text>{JSON.stringify(getParticipantsQuery.error)}</Text>}
              {getPrizesQuery.isError && <Text>{JSON.stringify(getPrizesQuery.error)}</Text>}
              {getMappingsQuery.isError && <Text>{JSON.stringify(getMappingsQuery.error)}</Text>}
            </>
          }
          {(!anyLoading && !anyError) &&
            <Router>
              <Route path="/" component={HomeView} />
              <Route path="/participants" component={ParticipantsView} participants={getParticipantsQuery.data} mappings={getMappingsQuery.data} />
              <Route path="/prizes" component={PrizesView} prizes={getPrizesQuery.data} mappings={getMappingsQuery.data} />
              <Route path="/cancels" component={HomeView} />
              <Route path="/mappings" component={MappingsView} participants={getParticipantsQuery.data} prizes={getPrizesQuery.data} mappings={getMappingsQuery.data} />
            </Router>
          }
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

function NavLinks() {

  const location = useLocation()

  return (
    <>
      <UnstyledButton className={classes.control} onClick={() => location.route('/editor/participants')}>参加者</UnstyledButton>
      <UnstyledButton className={classes.control} onClick={() => location.route('/editor/prizes')}>景品</UnstyledButton>
      <UnstyledButton className={classes.control} onClick={() => location.route('/editor/cancels')}>不参加リスト</UnstyledButton>
      <UnstyledButton className={classes.control} onClick={() => location.route('/editor/mappings')}>抽選結果</UnstyledButton>

      <UnstyledButton className={classes.control} onClick={() => location.route('/')}>メニューに戻る</UnstyledButton>
    </>
  )
}
