import {BigFloat} from 'bigfloat.js';
import {getPower} from 'short-scale-units';
import * as SSU from 'short-scale-units';

export function intNumberWithExtension(number: number | BigFloat): string {
	if (getPower(number.toString()) < 6) return number.toString();

	return `${SSU.trimNumber(number.toString())} ${SSU.unitNameFromNumber(number.toString())}`;
}

export function floatNumberWithExtension(number: number | BigFloat, precision: number = 3): string {
	if (getPower(number.toString()) < 6) return number.toString();

	const multiplier = 10 ** precision;
	const multipliedNumber = number instanceof BigFloat ? number.times(multiplier) : number * multiplier;
	return `${Math.round(parseInt(multipliedNumber.toString().substr(0, precision + 1))) / multiplier} ${SSU.unitNameFromNumber(number.toString())}`;
}
