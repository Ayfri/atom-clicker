import {BigFloat} from 'bigfloat.js'
import {getPower, trimNumber, unitNameFromNumber} from 'short-scale-units'

export function intNumberWithExtension(number: number | BigFloat): string {
	if (getPower(number.toString()) < 6) return number.toString()

	return `${trimNumber(number.toString())} ${unitNameFromNumber(number.toString())}`
}

export function floatNumberWithExtension(number: number | BigFloat, precision: number = 3): string {
	if (getPower(number.toString()) < 6) return number.toString()

	const multiplier = 10 ** precision
	const multipliedNumber = number instanceof BigFloat ? number.times(multiplier) : number * multiplier
	return `${Math.round(parseInt(multipliedNumber.toString().substr(0, precision + 1))) / multiplier} ${unitNameFromNumber(number.toString())}`
}
