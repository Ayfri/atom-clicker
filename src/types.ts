export type JSONObject = {[k: string]: string | number | boolean | JSONObject | Array<string | number | boolean | JSONObject>};

export interface JSONable {
	toJSON(): JSONObject | number;
}
