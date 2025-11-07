import { Box, Button, Center, Container, Flex, Group, Popover, Stack, Title, Text } from '@mantine/core';
import { PiArrowLeftBold, PiArrowRightBold, PiArrowClockwiseBold, PiAppWindowBold, PiXBold, PiPencilBold } from 'react-icons/pi';
import { useLocation } from 'wouter';
import { MainView } from '../Handoff/Views/MainView';
import { TenkeyLogo } from '@/components/TenkeyLogo';
import { motion, useAnimate } from 'motion/react';
import { useEffect } from 'react';
import { sleep } from '@/util/util';
import { useWindowSize } from '@react-hook/window-size';
import { TRANSITION_PANE_COLOR, WINDOW_HEADER_COLOR } from '@/settings';

// 抽選開始時にアニメーションを表示するだけのやつ
export function EnterRaffleTransition() {

	const [viewportWidth, viewportHeight] = useWindowSize()
	const [location, navigate] = useLocation();
	const [windowScope, windowAnimate] = useAnimate()
	const [backdropScope, backdropAnimate] = useAnimate()

	useEffect(() => {
		const animateWinner = async () => {
			
			const targetWidth = viewportWidth * 0.75
			const targetHeight = viewportHeight * 0.9
			await windowAnimate(windowScope.current, { width: `${targetWidth}px`, height: `${targetHeight}px` }, { duration: 1.0, type: "spring", bounce: 0 })
			await sleep(1.1 * 1000)
			await backdropAnimate(backdropScope.current, { backgroundColor: "#ffffff" }, { duration: 0.6, type: "spring", bounce: 0 })
			navigate('~/raffle')

		}
		animateWinner()

	}, [])

	return (
		<>

			{/* 表示画面 */}
			<div style={{ width: "100vw", height: "100vh", position: "relative" }}>

				{/* 背景 */}
				<div style={{ width: "100vw", height: "100vh", position: "absolute", top: 0, left: 0, overflow: "hidden" }}>
					<img src="/bg.avif" width="100%" height="100%" style={{ overflow: "hidden", objectPosition: "center", objectFit: "cover" }} />

				</div>

				{/* メイン画面 */}
				<div style={{ width: "100vw", height: "100vh", position: "absolute", top: 0, left: 0 }}>

					<Center h="100%">
						<Flex direction="column" bg="white" ref={windowScope} bdrs="md" style={{ height: "400px", width: "500px", borderStyle: "solid", borderColor: "rgb(91, 69, 46)", borderWidth: "2px 6px 6px 2px", overflow: "hidden" }}>
							<Flex direction="row" align="center" w="100%" h="3em" style={{ backgroundColor: WINDOW_HEADER_COLOR, borderStyle: "solid", borderColor: "rgb(91, 69, 46)", borderWidth: "0px 0px 2.5px 0px" }}>
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
									<Center w="2em" h="1.5em" bdrs="0.3em" style={{ backgroundColor: "rgb(242, 214, 184)", borderStyle: "solid", borderColor: "rgb(91, 69, 46)", borderWidth: "1.5px" }}>
										<PiXBold size="1.5em" color="rgb(91, 69, 46)" />
									</Center>
								</Group>
							</Flex>
							<Box style={{ flexGrow: 1 }}>
								<motion.div
									layout
									initial={{ opacity: 0, }}
									animate={{ opacity: 1, }}
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
										{/* TODO */}
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
												<Text component={motion.p} layout="position" size="48px" c="white">Ready</Text>
												<Box h="48px" />
											</Stack>
										</motion.div>
									</Center>
								</motion.div>
							</Box>
						</Flex>
					</Center>

				</div>
			</div >
		</>
	);
}

