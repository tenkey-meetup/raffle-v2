import { Button, Container, Stack, Title } from '@mantine/core';
import { useLocation } from 'preact-iso';

export function Landing() {

	const location = useLocation()

	return (
		<Container>
			<Stack gap="md" justify="center" align="center" h="100vh">
				<Title order={1}>天キー抽選システム</Title>
				<Title order={3}>動作確認</Title>
				<Button onClick={() => location.route('/raffle')}>
					抽選開始
				</Button>
				<Button onClick={() => location.route('/editor/participants')}>
					データ編集
				</Button>
				<Button onClick={() => location.route('/editor')}>
					抽選結果
				</Button>

			</Stack>
		</Container>
	);
}

