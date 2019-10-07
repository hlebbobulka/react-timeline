import * as React from "react";
import { ItimelineOperationResult } from "./timeline-types";
export function zoomIn(
  t0: number,
  tn: number,
  tw: number,
  divider: number,
  dx: number
): ItimelineOperationResult {
  const twPart = tw / divider;
  const dxPercent = dx / tw;

  return {
    t0: t0 + twPart * dxPercent,
    tn: tn - twPart * (1 - dxPercent)
  };
}

export function zoomOut(
  t0: number,
  tn: number,
  tw: number,
  divider: number,
  dx: number
): ItimelineOperationResult {
  const twPart = tw / divider;
  const dxPercent = dx / tw;

  return {
    t0: t0 - twPart * dxPercent,
    tn: tn + twPart * (1 - dxPercent)
  };
}

export function goLeft(
  t0: number,
  tn: number,
  shift: number
): ItimelineOperationResult {
  return {
    t0: t0 - shift,
    tn: tn - shift
  };
}

export function goRight(
  t0: number,
  tn: number,
  shift: number
): ItimelineOperationResult {
  return {
    t0: t0 + shift,
    tn: tn + shift
  };
}
export const getHoverPosition = (
  outerDiv: HTMLDivElement | null,
  archiveLeftBound: number | undefined,
  archiveRightBound: number | undefined,
  event: React.MouseEvent<HTMLDivElement> | WheelEvent
): number | undefined => {
  if (
    !outerDiv ||
    typeof archiveLeftBound === "undefined" ||
    typeof archiveRightBound === "undefined"
  ) {
    return undefined;
  }
  const { left, width } = outerDiv.getBoundingClientRect();
  const shift = event.clientX - left;
  if (shift >= 0 && shift <= width && archiveLeftBound && archiveRightBound) {
    return Math.floor(
      archiveLeftBound +
        (shift * (archiveRightBound - archiveLeftBound)) / width
    );
  }
  return undefined;
};

export function getIntervalStyle(
  baseStyle: React.CSSProperties,
  from: number,
  to: number,
  start: number,
  end: number
): React.CSSProperties {
  const length = end - start;
  const width = to - from;
  const left = from - start;
  return {
    ...baseStyle,
    left: (100 * left) / length + "%",
    width: (100 * width) / length + "%"
  };
}
