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


export function App() {
	return (
		<MantineProvider>
			<Notifications />
			<LocationProvider>
				<main>
					<Router>
						<Route path="/" component={Landing} />
						<Route path="/editor" component={Editor} />
						<Route path="/editor/*" component={Editor} />
						<Route default component={NotFound} />
					</Router>
				</main>
			</LocationProvider>
		</MantineProvider>
	);
}

render(<App />, document.getElementById('app'));
