import * as React from "react";
import { useEffect, useState } from "react";

import { render } from "react-dom";
import styled from "styled-components";
import { ErrorBoundary } from "./error-boundary";
import { PlayerTimeLine } from "./timeline";
import "./styles.css";

const player = {
	liveMode: true,
	playbackPosition: 1570215312000
};

const AppWrapper = styled.div`
	position: relative;
	margin-top: 100px;
`;
function App() {
	const [archiveInfo, setArchiveInfo] = useState({
		start: 1569956112000,
		end: 1570215312000
	});

	useEffect(() => {
		const tick = setTimeout(() => {
			setArchiveInfo({
				start: archiveInfo.start + 1000,
				end: archiveInfo.end + 1000
			});
		}, 1000);
		return () => clearTimeout(tick);
	}, [archiveInfo]);

	return (
		<ErrorBoundary>
			<AppWrapper>
				<PlayerTimeLine player={player} archiveInfo={archiveInfo} />
			</AppWrapper>
		</ErrorBoundary>
	);
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
