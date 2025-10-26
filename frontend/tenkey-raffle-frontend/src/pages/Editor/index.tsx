import { AppShell, Burger, Button, Container, Group, Stack, Title, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Route, Router, useLocation } from 'preact-iso';
import classes from './MobileNavbar.module.css';
import { HomeView } from './Views/HomeView';
import { ParticipantsView } from './Views/ParticipantsView';

export function Editor() {

  const location = useLocation()
  const [opened, { toggle }] = useDisclosure();

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
          <Router>
            <Route path="/" component={HomeView} />
            <Route path="/participants" component={ParticipantsView} />
            <Route path="/prizes" component={HomeView} />
            <Route path="/cancels" component={HomeView} />
            <Route path="/mappings" component={HomeView} />
          </Router>
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
