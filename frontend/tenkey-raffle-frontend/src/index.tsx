"use client"

import { Landing } from './pages/Landing/index.jsx';
import { NotFound } from './pages/_404.jsx';

import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';
import { Editor } from './pages/Editor/index.js';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Handoff } from './pages/Handoff/index.js';
import { Raffle } from './pages/Raffle/index.js';
import { Testing } from './pages/Testing/index.js';
import { Switch, Route } from 'wouter';
import ReactDOM from 'react-dom/client'
import React from 'react';

import '@fontsource-variable/murecho';

const queryClient = new QueryClient()


const theme = createTheme({
  fontFamily: 'Murecho Variable, sans-serif',
  // fontFamilyMonospace: 'Monaco, Courier, monospace',
  // headings: { fontFamily: 'Outfit, sans-serif' },
});

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<MantineProvider theme={theme}>
				<Notifications />
				<>
					<main>
						<Switch>
							<Route path="/" component={Landing} />
							<Route path="/editor" component={Editor} />
							<Route path="/editor/*" component={Editor} />
							<Route path="/handoff" component={Handoff} />
							<Route path="/raffle" component={Raffle} />
							<Route path="/testing" component={Testing} />
							<Route component={NotFound} />
						</Switch>
					</main>
				</>
			</MantineProvider>
		</QueryClientProvider>
	);
}

const rootElement = document.getElementById('app-root')

if (!rootElement) {
  throw new Error(
    "Root element not found. Check if it's in your index.html or if the id is correct."
  )
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
