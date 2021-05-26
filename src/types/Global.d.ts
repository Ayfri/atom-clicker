declare namespace Intl {
	type LocaleHourCycleKey = 'h12' | 'h23' | 'h11' | 'h24'
	type LocaleCollationCaseFirst = 'upper' | 'lower' | 'false'

	interface LocaleOptions {
		baseName?: string
		calendar?: string
		caseFirst?: LocaleCollationCaseFirst
		collation?: string
		hourCycle?: LocaleHourCycleKey
		language?: string
		numberingSystem?: string
		numeric?: boolean
		region?: string
		script?: string
	}

	interface Locale extends LocaleOptions {
		/** Gets the most likely values for the language, script, and region of the locale based on existing values. */
		maximize(): Locale

		/** Attempts to remove information about the locale that would be added by calling `Locale.maximize()`. */
		minimize(): Locale

		/** Returns the locale's full locale identifier string. */
		toString(): string
	}

	/**
	 * Constructor creates [Intl.Locale](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale)
	 * objects
	 *
	 * @param tag - A string with a [BCP 47 language tag](http://tools.ietf.org/html/rfc5646).
	 *  For the general form and interpretation of the locales argument,
	 *  see the [`Intl` page](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation).
	 *
	 * @param options - An [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/Locale#Parameters)
	 *  with some or all of options of the locale.
	 *  An object with some or all of the following properties:
	 *  - `baseName` - A string containing the language, and the script and region if available.
	 *    Possible values are valid BCP47 language tags
	 *  - `calendar` - The part of the Locale that indicates the locale's calendar era.
	 *    Possible values are valid BCP47 calendar keys
	 *  - `caseFirst` - Flag that defines whether case is taken into account for the locale's collation rules.
	 *    Possible values are valid BCP47 collation case levels
	 *  - `collation` - The collation type used for sorting
	 *    Possible values are valid BCP47 collation keys
	 *  - `hourCycle` - The time keeping format convention used by the locale.
	 *    Possible values are valid BCP47 hour cycle keys
	 *  - `language` - The primary language subtag associated with the locale.
	 *    Possible values are valid BCP47 primary language subtags
	 *  - `numberingSystem` - The numeral system used by the locale.
	 *    Possible values are valid BCP47 numbering system keys
	 *  - `numeric` - Flag that defines whether the locale has special collation handling for numeric characters.
	 *    Possible values are booleans
	 *  - `region` - The region of the world (usually a country) associated with the locale.
	 *    Possible values are region codes as defined by ISO 3166-1
	 *  - `script` - The script used for writing the particular language used in the locale.
	 *    Possible values are script codes as defined by ISO 15924
	 *
	 * @returns [Intl.Locale](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale) object.
	 *
	 * [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale).
	 *
	 * [Specification](https://tc39.es/ecma402/#sec-intl-locale-constructor).
	 */
	const Locale: {
		new (tag?: string, options?: LocaleOptions): Locale
	}
}
