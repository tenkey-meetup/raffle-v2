import { Box, Button, Center, Container, Flex, Group, Popover, Stack, Title, Text } from '@mantine/core';
import { PiArrowLeftBold, PiArrowRightBold, PiArrowClockwiseBold, PiAppWindowBold, PiXBold, PiPencilBold } from 'react-icons/pi';
import { useLocation } from 'wouter';
import { MainView } from '../Handoff/Views/MainView';
import { TenkeyLogo } from '@/components/TenkeyLogo';
import { motion, useAnimate } from 'motion/react';
import { useEffect } from 'react';
import { sleep } from '@/util/util';
import { useWindowSize } from '@react-hook/window-size';
import { WINDOW_HEADER_COLOR } from '@/settings';
import { StylizedWindow } from '@/components/StylizedWindow';

// 抽選中断時にアニメーションを表示するだけのやつ
export function ExitRaffleTransition() {

	const [viewportWidth, viewportHeight] = useWindowSize()
	const [location, navigate] = useLocation();
	const [windowScope, windowAnimate] = useAnimate()
	const [backdropScope, backdropAnimate] = useAnimate()

	const originWidth = viewportWidth * 0.75
	const originHeight = viewportHeight * 0.9

	useEffect(() => {
		const animateWinner = async () => {


			await windowAnimate(windowScope.current, { width: `500px`, height: `400px` }, { duration: 0.7, type: "spring", bounce: 0 })
			navigate('~/')

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
						width={originWidth}
						height={originHeight}
						windowRef={windowScope}
					/>
				</Center>

			</div>
		</div >
		
	);
}

