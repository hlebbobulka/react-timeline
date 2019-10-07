import styled from "styled-components";

export const TimeLineOuter = styled.div<{ hover?: boolean }>`
	width: 100%;
	height: ${p => (p.hover ? "5px" : "3px")};
	overflow: hidden;
	position: relative;
	cursor: pointer;
`;

export const TimeLineInner = styled.div<{ hover?: boolean }>`
	left: 0;
	top: 0;
	bottom: 0;
	z-index: 30;
	border-radius: 0 3px 3px 0;
	background-color: #f44;
	border: ${p => (p.hover ? "1px" : "0px")} solid #f44;
	position: absolute;
`;

export const TimeLineHoverText = styled.div`
	display: block;
	z-index: 50;
	position: absolute;
	top: -30px;
	white-space: nowrap;
	color: #fff;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 1rem;
	padding: 6px 16px;
	font-size: 13px;
	font-weight: 600;
	letter-spacing: 0;
	font-family: sans-serif;
`;

export const TimelinePointer = styled.div<{ hover: boolean }>`
	background: #f44;
	position: absolute;
	height: ${p => (p.hover ? "13px" : "3px")};
	width: ${p => (p.hover ? "13px" : "3px")};
	border-radius: 1rem;
	z-index: 9999;
	transition: 0.03s all;
`;

export const TimelineWrapper = styled.div`
	height: 5px;
	display: flex;
	align-items: center;
	cursor: pointer;
	position: relative;
`;
