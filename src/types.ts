interface JSONable {
	toJSON(): {[k: string]: string | number | boolean | object};
}
