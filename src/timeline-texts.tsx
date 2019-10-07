import { DateTime } from "luxon";

const locale = "ru";
const timeFormat = "d LLLL HH:mm:ss";

export function getTimeZoneOffset(): number {
	return DateTime.local().offset;
}

export function getTimeText(position: number, format?: string): string {
	return DateTime.fromMillis(position)
		.setLocale(locale)
		.toFormat(format || timeFormat);
}

export function getTimeLineText(
	position: number,
	prevPosition: number
): string {
	const pos = DateTime.fromMillis(position);
	const prevPos = DateTime.fromMillis(prevPosition);
	let format = "";
	if (prevPos.startOf("day") < pos.startOf("day")) {
		format += "dd LLL";
	}
	if (prevPos.hour !== pos.hour || prevPos.minute !== pos.minute) {
		format += " HH:mm";
	}
	if (prevPos.second !== pos.second) {
		format += ":ss";
	}
	return pos.setLocale(locale).toFormat(format);
}
