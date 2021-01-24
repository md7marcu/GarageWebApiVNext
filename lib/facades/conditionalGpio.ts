// tslint:disable:no-empty
export const gpio = (process.env.NODE_ENV === "windows" || process.env.NODE_ENV === "test")
  ? {
      setup() {},
      setupOutputPin() {},
      setupInput() {},
      setFallingInterrupqt() {},
      pinMode() {},
      pullUpDnControl() {},
      wiringPiISR() {},
      digitalRead() {return 32; },
      digitalWrite() {},
      piBoardId() {return "Short information."; },
    }
  : "node-wiring-pi";