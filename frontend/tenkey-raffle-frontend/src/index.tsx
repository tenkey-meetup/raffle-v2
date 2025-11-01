import { render } from 'preact';
import { LocationProvider, Router, Route } from 'preact-iso';

import { Landing } from './pages/Landing/index.jsx';
import { NotFound } from './pages/_404.jsx';

import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider } from '@mantine/core';
import { Editor } from './pages/Editor/index.js';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Handoff } from './pages/Handoff/index.js';

const queryClient = new QueryClient()

export function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<MantineProvider>
				<Notifications />
				<LocationProvider>
					<main>
						<Router>
							<Route path="/" component={Landing} />
							<Route path="/editor" component={Editor} />
							<Route path="/editor/*" component={Editor} />
							<Route path="/handoff" component={Handoff} />
							<Route default component={NotFound} />
						</Router>
					</main>
				</LocationProvider>
			</MantineProvider>
		</QueryClientProvider>
	);
}

render(<App />, document.getElementById('app'));
