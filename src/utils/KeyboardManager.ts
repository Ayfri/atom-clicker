import EventEmitter from './EventEmitter';

export type Key = string;

epxort class KeyboardManager extends EventEmitter {

    private static _instance:KeyboardManager = new KeyboardManager();

    private _pressed:Set<Key>;
    
    constructor() {
        if(KeyboardManager._instance){
            throw new Error("Error: Instantiation failed: Use KeyboardManager.getInstance() instead of new.");
        }
        KeyboardManager._instance = this;
        window.onkeydown = this.onKeyDown;
        window.onkeyup   = this.onKeyUp;
    }

    public static getInstance(): KeyboardManager
    {
        return KeyboardManager._instance;
    }
    
    private onKeyDown(e: KeyboardEvent) {
      if(!this.isPressed(e.key)) {
        this.emit(e.key);
      }
      this._pressed.add(e.key);

    }
    
    private onKeyUp(e: KeyboardEvent) {
      if(this.isPressed(e.key)) {
        this.emit(e.key);
      }
      this.emit('keyDown', e);
    }
    
    public isPressed(key: string): boolean {
      return this._pressed.has(key);
    }
}
