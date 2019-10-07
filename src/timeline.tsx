import * as React from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TimeLineMarks } from "./timeline-marks";
import { DateTime } from "luxon";
import {
	TimeLineOuter,
	TimelineWrapper,
	TimeLineInner,
	TimeLineHoverText,
	TimelinePointer
} from "./timeline-styles";
import {
	IPlayerTimeLineProps,
	ITimeLineBufferedProps,
	ITimeLineGapsProps,
	ItimelineOperationResult
} from "./timeline-types";
import {
	getIntervalStyle,
	getHoverPosition,
	zoomIn,
	zoomOut,
	goLeft,
	goRight
} from "./timeline-utils";

export function TimeLineBuffered({
	archiveInfo,
	buffered
}: ITimeLineBufferedProps): React.ReactElement<ITimeLineBufferedProps> {
	const gapStyle: React.CSSProperties = {
		position: "absolute",
		backgroundColor: "#0F0",
		top: 0,
		height: 5,
		zIndex: 10
	};
	const styleCb = (buffer: [number, number]) => {
		const style = getIntervalStyle(
			gapStyle,
			buffer[0],
			buffer[1],
			archiveInfo.start,
			archiveInfo.end
		);
		return <div key={buffer[1]} style={style} />;
	};
	return <>{buffered.map(styleCb)}</>;
}
export function TimeLineGaps({
	gaps,
	archiveInfo
}: ITimeLineGapsProps): React.ReactElement<ITimeLineGapsProps> {
	const gapStyle: React.CSSProperties = {
		position: "absolute",
		backgroundColor: "red",
		top: 0,
		bottom: 0,
		zIndex: 20
	};
	const styleCb = (buffer: [number, number]) => {
		const style = getIntervalStyle(
			gapStyle,
			buffer[0],
			buffer[1],
			archiveInfo.start,
			archiveInfo.end
		);
		return <div key={buffer[1]} style={style} />;
	};
	return <>{gaps.map(styleCb)}</>;
}

export const PlayerTimeLine = memo(function PlayerTimeLineFn({
	player,
	archiveInfo
}: IPlayerTimeLineProps): React.ReactElement<IPlayerTimeLineProps> | null {
	const playbackPosition = player.playbackPosition;
	// STATE
	const [hoverPosition, setHoverPosition] = useState<number>();
	const [state, setState] = useState<{
		t0?: number;
		tn?: number;
		zoomed?: boolean;
		attachedToLeft?: boolean;
		attachedToRight?: boolean;
	}>({});

	// REFS
	const outerDivRef = useRef<HTMLDivElement | null>(null);
	const hoverTextRef = useRef<HTMLDivElement | null>(null);
	const archiveInfoRef = useRef(archiveInfo);

	// COMPUTED VALUES
	const secondsPerPixel = useMemo(() => {
		if (outerDivRef.current && state.t0 && state.tn) {
			return (
				(state.tn - state.t0) / 1000 / outerDivRef.current.offsetWidth
			);
		}
	}, [state, outerDivRef.current]);

	const totalArchiveLenghInSeconds = useMemo(() => {
		if (state.t0 && state.tn) {
			return Math.floor((state.tn - state.t0) / 1000);
		}
	}, [state]);

	const pointerPosition = useMemo(() => {
		if (state.t0 && state.tn) {
			return (
				(100 * (playbackPosition - state.t0)) / (state.tn - state.t0)
			);
		}
	}, [state]);

	// HANDLERS
	const setPosition = (newPosition: number) => {
		player.liveMode = false;
		player.playbackPosition = newPosition;
	};
	const _onMouseMove = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			if (state.t0 && state.tn) {
				const newHoverPosition = getHoverPosition(
					outerDivRef.current,
					state.t0,
					state.tn,
					event
				);
				if (typeof newHoverPosition === "number") {
					setHoverPosition(newHoverPosition);
				}
			}
		},
		[state]
	);
	const _onMouseLeave = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			setHoverPosition(undefined);
		},
		[state]
	);

	const updateState = (opRes: ItimelineOperationResult) => {
		const attachedToLeft = opRes.t0 <= archiveInfo.start;
		const attachedToRight = opRes.tn >= archiveInfo.end;
		setState({
			attachedToLeft: !attachedToRight && attachedToLeft,
			attachedToRight: !attachedToLeft && attachedToRight,
			zoomed: !attachedToLeft || !attachedToRight,
			t0: Math.max(opRes.t0, archiveInfo.start),
			tn: Math.min(opRes.tn, archiveInfo.end)
		});
	};

	const _onMouseWheel = useCallback(
		(event: WheelEvent) => {
			if (outerDivRef.current) {
				if (event.deltaY <= 0) {
					if (outerDivRef.current.scrollTop <= 0) {
						event.preventDefault();
					}
				} else {
					if (
						outerDivRef.current.scrollTop +
							outerDivRef.current.clientHeight >=
						outerDivRef.current.scrollHeight
					) {
						event.preventDefault();
					}
				}
				event.stopImmediatePropagation();

				if (archiveInfo && outerDivRef.current) {
					const { t0, tn } = state;
					const newHoverPosition = getHoverPosition(
						outerDivRef.current,
						t0,
						tn,
						event
					);

					if (typeof newHoverPosition === "number") {
						setHoverPosition(newHoverPosition);
						if (event.deltaY > 0) {
							// zoom out

							if (event.ctrlKey || event.metaKey) {
								if (!state.attachedToLeft) {
									const goLefttRes = goLeft(
										t0,
										tn,
										totalArchiveLenghInSeconds * 10
									);
									updateState(goLefttRes);
								}
							} else {
								const zRes = zoomOut(
									t0,
									tn,
									tn - t0,
									10,
									newHoverPosition - t0
								);
								updateState(zRes);
							}
						} else {
							// zoom in
							if (event.ctrlKey || event.metaKey) {
								if (!state.attachedToRight) {
									const goRightRes = goRight(
										t0,
										tn,
										totalArchiveLenghInSeconds * 10
									);
									updateState(goRightRes);
								}
							} else {
								// 10 seconds for full timeline
								const isMaxZoom =
									10 / outerDivRef.current.offsetWidth >
									secondsPerPixel;
								if (!isMaxZoom) {
									const zRes = zoomIn(
										t0,
										tn,
										tn - t0,
										10,
										newHoverPosition - t0
									);
									updateState(zRes);
								}
							}
						}
					}
				}
			}
		},
		[state, updateState]
	);

	const _onClick = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			const newHoverPosition = getHoverPosition(
				outerDivRef.current,
				state.t0,
				state.tn,
				event
			);
			if (typeof newHoverPosition === "number") {
				setPosition(newHoverPosition);
			}
		},
		[state]
	);

	// EFFECTS
	useEffect(() => {
		//init
		if (archiveInfo && !state.t0 && !state.tn) {
			setState({
				...state,
				t0: archiveInfo.start,
				tn: archiveInfo.end
			});
		}

		// attached to left
		if (state.attachedToLeft) {
			setState({
				...state,
				t0: archiveInfo.start,
				tn: state.tn + (archiveInfo.end - archiveInfoRef.current.end)
			});
		}
		//attached to right
		if (state.attachedToRight) {
			setState({
				...state,
				t0:
					state.t0 +
					(archiveInfo.start - archiveInfoRef.current.start),
				tn: archiveInfo.end
			});
		}
		//not attached
		if (
			(archiveInfoRef.current.end !== archiveInfo.end ||
				archiveInfoRef.current.start !== archiveInfo.start) &&
			!state.zoomed
		) {
			setState({
				...state,
				t0: archiveInfo.start,
				tn: archiveInfo.end
			});
		}
		// if left bound was moved forvard by archive rotation
		if (state.zoomed && !state.attachedToLeft && !state.attachedToRight) {
			if (state.t0 <= archiveInfo.start) {
				setState({
					...state,
					attachedToLeft: state.t0 <= archiveInfo.start
				});
			}
		}
		archiveInfoRef.current = archiveInfo;
	}, [archiveInfo]);

	useEffect(() => {
		if (outerDivRef.current) {
			outerDivRef.current.addEventListener("wheel", _onMouseWheel, {
				passive: false
			});
		}
		return () => {
			if (outerDivRef.current) {
				outerDivRef.current.removeEventListener("wheel", _onMouseWheel);
			}
		};
	}, [outerDivRef.current, state]);

	// RENDER AND STYLES
	if (!archiveInfo || typeof playbackPosition === "undefined") {
		return null;
	}
	const innerStyle: React.CSSProperties = {};

	const timeLineOuterStyle: React.CSSProperties = {
		background: "rgba(255,255,255,0.4)"
	};
	let timeLinePointer = null;
	const hoverTextStyle: React.CSSProperties = {};
	let hoverText = "";
	innerStyle.width = player.liveMode
		? "100%"
		: state.t0 && state.tn
		? (100 * (playbackPosition - state.t0)) / (state.tn - state.t0) + "%"
		: 0;
	if (
		typeof hoverPosition === "number" &&
		typeof state.tn === "number" &&
		typeof state.t0 === "number"
	) {
		const timeFormat = `d LLLL HH:mm:ss`;
		hoverText = DateTime.fromMillis(hoverPosition)
			.setLocale("ru")
			.toFormat(timeFormat);
		const timeLinePosition =
			(100 * (hoverPosition - state.t0)) / (state.tn - state.t0);

		timeLineOuterStyle.background = `linear-gradient(90deg, rgba(255,255,255,0.7) ${timeLinePosition}%,
        rgba(255,255,255,0.4) ${timeLinePosition}%)`;
		if (hoverTextRef.current && outerDivRef.current && hoverPosition) {
			const hoverTextWidth = hoverTextRef.current.offsetWidth;
			const timeLineWidth = outerDivRef.current.offsetWidth;
			const pxPercentScale = timeLineWidth / 100;
			const timeLinePositionPx = pxPercentScale * timeLinePosition;
			const hoverTextWidthPercent = hoverTextWidth / 2 / pxPercentScale;
			if (timeLinePositionPx < hoverTextWidth / 2) {
				hoverTextStyle.left = 0;
			} else {
				if (timeLineWidth - timeLinePositionPx < hoverTextWidth / 2) {
					hoverTextStyle.right = 0;
				} else {
					hoverTextStyle.left =
						timeLinePosition - hoverTextWidthPercent + "%";
				}
			}
		}

		const timeLinePointerStyle: React.CSSProperties =
			pointerPosition > 100 || pointerPosition < 0
				? {
						display: "none"
				  }
				: {
						left: `calc(${pointerPosition}% - 6.5px)`
				  };
		timeLinePointer = (
			<TimelinePointer
				style={timeLinePointerStyle}
				hover={!!hoverPosition}
			/>
		);
	}
	const hoverTextComponent = hoverText ? (
		<TimeLineHoverText style={hoverTextStyle} ref={hoverTextRef}>
			{hoverText}
		</TimeLineHoverText>
	) : null;

	const debug = () => {
		const timeFormat = `d LLLL HH:mm:ss`;
		const archiveRightBoundText =
			state.tn &&
			DateTime.fromMillis(state.tn)
				.setLocale("ru")
				.toFormat(timeFormat);
		const archiveLeftBoundText =
			state.t0 &&
			DateTime.fromMillis(state.t0)
				.setLocale("ru")
				.toFormat(timeFormat);

		return (
			<div style={{ fontFamily: "sans-serif", color: "white" }}>
				<p>Левая граница: {archiveLeftBoundText}</p>
				<p>Правая граница: {archiveRightBoundText}</p>
				<p>Seconds per pixel: {secondsPerPixel}</p>
				<p>Общая длина архива: {totalArchiveLenghInSeconds}</p>
			</div>
		);
	};
	return (
		<>
			<TimeLineMarks
				secondsPerPixel={secondsPerPixel}
				t0={state.t0}
				tn={state.tn}
			/>
			<TimelineWrapper
				ref={outerDivRef}
				onMouseMove={_onMouseMove}
				onMouseLeave={_onMouseLeave}
				onClick={_onClick}>
				{hoverTextComponent}

				<TimeLineOuter
					hover={!!hoverPosition}
					style={timeLineOuterStyle}>
					<TimeLineBuffered buffered={[]} archiveInfo={archiveInfo} />
					<TimeLineGaps gaps={[]} archiveInfo={archiveInfo} />
					<TimeLineInner style={innerStyle} hover={!!hoverPosition} />
				</TimeLineOuter>
				{timeLinePointer}
			</TimelineWrapper>
			{debug()}
		</>
	);
});
