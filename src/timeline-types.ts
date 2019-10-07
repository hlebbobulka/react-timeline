export interface IArchiveInfo {
  readonly originalTimestamp?: number;
  readonly timestamp?: number;
  readonly start: number;
  readonly end: number;
}

export interface ItimelineOperationResult {
  t0: number;
  tn: number;
}

export interface ITimeLineState {
  secondsPerPixel?: number;
  archiveLeftBound?: number;
}

export interface ITimeLineGapsProps {
  readonly archiveInfo: IArchiveInfo;
  readonly gaps: [number, number][];
}

export interface ITimeLineBufferedProps {
  readonly archiveInfo: IArchiveInfo;
  readonly buffered: [number, number][];
}

export interface IPlayerTimeLineProps {
  readonly player: { liveMode: boolean; playbackPosition: number };
  readonly archiveInfo: IArchiveInfo;
}

export interface IGetTimelineActualState {
  archiveLeftBound?: number;
  archiveRightBound?: number;
  secondsPerPixel?: number;
  timeLineWidth?: number;
  archiveLeftMin?: number;
  archiveRightMax?: number;
}
