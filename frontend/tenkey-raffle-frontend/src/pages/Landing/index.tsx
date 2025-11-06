import { Button, Container, Stack, Title } from '@mantine/core';
import TestButton from '../../components/TestButton';
import { useLocation } from 'wouter';

export function Landing() {

	const [location, navigate] = useLocation();

	return (
		<Container>
			<Stack gap="md" justify="center" align="center" h="100vh">
				<Title order={1}>天キー抽選システム</Title>
				
				<Title order={3}>動作確認</Title>
				<Button onClick={() => navigate('/raffle')}>
					抽選開始
				</Button>
				<Button onClick={() => navigate('/editor/participants')}>
					データ編集
				</Button>
				<Button onClick={() => navigate('/handoff')}>
					景品受け渡し
				</Button>

			</Stack>
		</Container>
	);
}

