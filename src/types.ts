export type JSONValue = string | number | boolean | JSONObject
export type JSONObject = {[k: string]: JSONValue | Array<JSONValue>}

export interface JSONable {
	toJSON(): JSONObject
}
