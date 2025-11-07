import { Box, Button, Center, Container, Flex, Group, Popover, Stack, Title, Text } from '@mantine/core';
import { PiArrowLeftBold, PiArrowRightBold, PiArrowClockwiseBold, PiAppWindowBold, PiXBold, PiPencilBold } from 'react-icons/pi';
import { useLocation } from 'wouter';
import { MainView } from '../Handoff/Views/MainView';
import { TenkeyLogo } from '@/components/TenkeyLogo';
import { motion } from 'motion/react';
import { BUTTON_PRIMARY_BACKGROUND_COLOR, BUTTON_PRIMARY_BORDER_COLOR, FOREGROUND_TEXT_COLOR, WINDOW_HEADER_COLOR } from '@/settings';
import { StylizedWindow } from '@/components/StylizedWindow';
import { useHotkeys } from '@mantine/hooks';

export function Landing() {

	const [location, navigate] = useLocation();

	useHotkeys([
		// N -> 抽選開始ボタン
		['n', () => {
			navigate('~/transition/enter')
		}]
	])

	return (

		<div style={{ width: "100vw", height: "100vh", position: "relative" }}>

			{/* 背景 */}
			<div style={{ width: "100vw", height: "100vh", position: "absolute", top: 0, left: 0, overflow: "hidden" }}>
				<img src="/bg.avif" width="100%" height="100%" style={{ overflow: "hidden", objectPosition: "center", objectFit: "cover" }} />

			</div>

			{/* メイン画面 */}
			<div style={{ width: "100vw", height: "100vh", position: "absolute", top: 0, left: 0 }}>

				<Center h="100%">
					<StylizedWindow
						width={500}
						height={400}
					>
						<motion.div style={{ width: "100%", height: "100%" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: "spring", bounce: 0, duration: 0.8 }}>
							<Center px="24px" py="24px" h="100%">
								<Stack gap="24px" justify="center" align="center">
									<Group c={FOREGROUND_TEXT_COLOR} pb="12px">
										<Center h="115px" w="150px">
											<TenkeyLogo />
										</Center>
										<Title order={3}>抽選システム</Title>
									</Group>
									<Button size="xl" onClick={() => navigate('~/transition/enter')} color={BUTTON_PRIMARY_BACKGROUND_COLOR} bd={`solid 2px ${BUTTON_PRIMARY_BORDER_COLOR}`} c={BUTTON_PRIMARY_BORDER_COLOR}>
										抽選開始
									</Button>
									<Group>
										<Button variant="outline" color="green" onClick={() => navigate('~/editor/participants')}>
											データ編集
										</Button>
										<Button variant="outline" color="cyan" onClick={() => navigate('~/handoff')}>
											景品受け渡し
										</Button>
									</Group>
								</Stack>
							</Center>
						</motion.div>
					</StylizedWindow>
				</Center>

			</div>
		</div >

	);
}

