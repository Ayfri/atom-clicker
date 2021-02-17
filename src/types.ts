export type JSONObject = {[k: string]: string | number | boolean | JSONObject | JSONObject[]};

export interface JSONable {
	toJSON(): JSONObject;
}
