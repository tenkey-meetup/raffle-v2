import { Box, Button, Center, Container, Flex, Group, Popover, Stack, Title, Text } from '@mantine/core';
import { PiArrowLeftBold, PiArrowRightBold, PiArrowClockwiseBold, PiAppWindowBold, PiXBold, PiPencilBold } from 'react-icons/pi';
import { useLocation } from 'wouter';
import { MainView } from '../Handoff/Views/MainView';
import { TenkeyLogo } from '@/components/TenkeyLogo';
import { AnimatePresence, motion, useAnimate } from 'motion/react';
import { useEffect, useState } from 'react';
import { sleep } from '@/util/util';
import { useWindowSize } from '@react-hook/window-size';
import { TRANSITION_OVERLAY_TEXT_COLOR, TRANSITION_PANE_COLOR, WINDOW_HEADER_COLOR } from '@/settings';
import { StylizedWindow } from '@/components/StylizedWindow';

// 抽選開始時にアニメーションを表示するだけのやつ
export function EnterRaffleTransition() {

	const [viewportWidth, viewportHeight] = useWindowSize()
	const [location, navigate] = useLocation();
	const [windowScope, windowAnimate] = useAnimate()
	const [backdropScope, backdropAnimate] = useAnimate()
	const [displayContents, setDisplayContents] = useState(true)

	useEffect(() => {
		const animateWinner = async () => {

			const targetWidth = viewportWidth * 0.75
			const targetHeight = viewportHeight * 0.9
			await windowAnimate(windowScope.current, { width: `${targetWidth}px`, height: `${targetHeight}px` }, { duration: 1.0, type: "spring", bounce: 0 })
			await sleep(1.1 * 1000)
			setDisplayContents(false)
			await sleep(0.8 * 1000)

			navigate('~/raffle')

		}
		animateWinner()

	}, [])

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
						windowRef={windowScope}
					>
						<AnimatePresence>
							{displayContents &&
								<motion.div
									layout
									initial={{ opacity: 0, }}
									animate={{ opacity: 1, }}
									exit={{ opacity: 0 }}
									transition={{
										type: "spring",
										stiffness: 700,
										damping: 100,
										mass: 1
									}}
									style={{
										width: "100%",
										height: "100%",
										backgroundColor: TRANSITION_PANE_COLOR
									}}
									ref={backdropScope}
								>
									<Center w="100%" h="100%">
										<motion.div
											layout
											initial={{ y: 50, opacity: 0 }}
											animate={{ y: 0, opacity: 1 }}
											transition={{
												type: "spring",
												bounce: 0,
												duration: 0.6,
												delay: 1.0
											}}
										>
											<Stack align="center">
												<Text component={motion.p} layout="position" size="48px" c={TRANSITION_OVERLAY_TEXT_COLOR}>Ready</Text>
												<Box h="48px" />
											</Stack>
										</motion.div>
									</Center>
								</motion.div>
							}
						</AnimatePresence>
					</StylizedWindow>
				</Center >

			</div >
		</div >
	);
}

