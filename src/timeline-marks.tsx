import * as React from "react";
import styled from "styled-components";
import { getTimeLineText, getTimeZoneOffset } from "./timeline-texts";
import { memo } from "react";

interface IUnit {
	readonly unit: number;
	readonly smallerUnit: number;
}

interface IMark {
	readonly timestamp: number;
	readonly text?: string;
}

function getUnit(secondsPerPixel: number): IUnit {
	if (secondsPerPixel < 0.2) {
		return {
			unit: 10,
			smallerUnit: 1
		};
	}
	if (secondsPerPixel < 1) {
		return {
			unit: 60,
			smallerUnit: 10
		};
	}
	if (secondsPerPixel < 2.5) {
		return {
			unit: 60 * 5,
			smallerUnit: 60
		};
	}
	if (secondsPerPixel < 5) {
		return {
			unit: 60 * 10,
			smallerUnit: 60
		};
	}
	if (secondsPerPixel < 12.5) {
		return {
			unit: 60 * 30,
			smallerUnit: 60 * 5
		};
	}
	if (secondsPerPixel < 25) {
		return {
			unit: 60 * 60,
			smallerUnit: 60 * 10
		};
	}
	if (secondsPerPixel < 50) {
		return {
			unit: 60 * 60 * 2,
			smallerUnit: 60 * 20
		};
	}
	if (secondsPerPixel < 75) {
		return {
			unit: 60 * 60 * 3,
			smallerUnit: 60 * 30
		};
	}
	if (secondsPerPixel < 150) {
		return {
			unit: 60 * 60 * 6,
			smallerUnit: 60 * 60
		};
	}
	if (secondsPerPixel < 300) {
		return {
			unit: 60 * 60 * 12,
			smallerUnit: 60 * 60 * 2
		};
	}
	if (secondsPerPixel < 600) {
		return {
			unit: 60 * 60 * 24,
			smallerUnit: 60 * 60 * 6
		};
	}
	if (secondsPerPixel < 1200) {
		return {
			unit: 60 * 60 * 24 * 2,
			smallerUnit: 60 * 60 * 12
		};
	}
	if (secondsPerPixel < 2400) {
		return {
			unit: 60 * 60 * 24 * 4,
			smallerUnit: 60 * 60 * 24
		};
	}
	if (secondsPerPixel < 5000) {
		return {
			unit: 60 * 60 * 24 * 7,
			smallerUnit: 60 * 60 * 24
		};
	}
	if (secondsPerPixel < 10000) {
		return {
			unit: 60 * 60 * 24 * 14,
			smallerUnit: 60 * 60 * 24 * 3
		};
	}
	if (secondsPerPixel < 20000) {
		return {
			unit: 60 * 60 * 24 * 28,
			smallerUnit: 60 * 60 * 24 * 4
		};
	}
	if (secondsPerPixel < 40000) {
		return {
			unit: 60 * 60 * 24 * 28 * 2,
			smallerUnit: 60 * 60 * 24 * 7
		};
	}
	return {
		unit: 60 * 60 * 24 * 28 * 100000,
		smallerUnit: 60 * 60 * 24 * 10000
	};
}

function getMarks(
	archiveLeftBound: number,
	archiveRightBound: number,
	{ unit, smallerUnit }: IUnit
): ReadonlyArray<IMark> {
	const offset = getTimeZoneOffset() * 60;
	const min = Math.ceil((archiveLeftBound + offset) / smallerUnit);
	const max = Math.floor((archiveRightBound + offset) / smallerUnit);
	const res = [];
	let prevTs: number = -offset;
	for (let i = min; i <= max; i++) {
		let timestamp = i * smallerUnit;
		const isLarge = timestamp % unit < unit / 10;
		timestamp -= offset;
		res.push({
			timestamp: timestamp,
			text: isLarge
				? getTimeLineText(timestamp * 1000, prevTs * 1000)
				: undefined
		});
		if (isLarge) {
			prevTs = timestamp;
		}
	}
	return res;
}

const SmallMark = styled.div`
	position: absolute;
	width: 1px;
	height: 8px;
	color: #cccccc;
	background-color: #cccccc;
	bottom: 100%;
	box-shadow: #000 1px 0 5px;
`;

const LargeMark = styled.div`
	position: absolute;
	width: 1px;
	height: 16px;
	background-color: white;
	bottom: 100%;
	box-shadow: #000 1px 0 5px;
`;

const MarkText = styled.div`
	position: absolute;
	font-size: 11px;
	font-family: sans-serif;
	color: white;
	text-shadow: -1px -1px 2px #000, 1px -1px 2px #000, -1px 1px 2px #000,
		1px 1px 2px #000;
	left: 4px;
	bottom: 8px;
`;

const TimeLineMarksOuter = styled.div`
	color: white;
	display: block;
	bottom: 7px;
	left: 0;
	overflow: hidden;
`;

const renderMark = (archiveLeftBound: number, secondsPerPixel: number) => ({
	text,
	timestamp
}: IMark): React.ReactNode => {
	const style = {
		left: (timestamp * 1000 - archiveLeftBound) / secondsPerPixel / 1000
	};
	if (text) {
		return (
			<LargeMark key={timestamp} style={style}>
				<MarkText>{text}</MarkText>
			</LargeMark>
		);
	}
	return <SmallMark key={timestamp} style={style} />;
};

export const TimeLineMarks = memo(props => {
	const { t0, tn, secondsPerPixel } = props;
	const unit = getUnit(secondsPerPixel);
	const range = getMarks(t0 / 1000, tn / 1000, unit);
	return (
		<TimeLineMarksOuter>
			{range.map(renderMark(t0, secondsPerPixel))}
		</TimeLineMarksOuter>
	);
});
