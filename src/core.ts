import flyd from "flyd";
import { Option, None, Some } from "@rusts/std";

export class EventStream<Msg> {
  public Callback!: (event: Msg) => void;

  private callback: Option<this["Callback"]>;
  private callback_stream: Option<flyd.Stream<any>>;
  private stream: flyd.Stream<Msg>;
  private locked: boolean;
  private observer_stream: flyd.Stream<any>;
  private observers: {
    [index: string]: Array<{ name: string; handler: (event: Msg) => void }>;
  };

  public constructor() {
    this.callback = None();
    this.callback_stream = None();
    this.stream = flyd.stream();
    this.locked = false;
    this.observers = {};
    this.observer_stream = flyd.chain((m: Msg) => {
      for (let t in this.observers) {
        for (let o of this.observers[t]) {
          o.handler(m);
        }
      }
      return flyd.stream();
    }, this.stream);
  }

  // Close the event stream, i.e. stop processing messages
  public close() {
    this.stream.end(true);
  }

  // Send the `event` message to the stream and the observers.
  public emit(event: Msg) {
    if (!this.locked) {
      this.stream(event);
    }
  }

  // Locks the stream (doesn't emit messages) until a subsequent call to `unlock` is made.
  public lock() {
    this.locked = true;
  }

  // Unlocks the stream (emit messages) after a call to `lock` was made.
  public unlock() {
    this.locked = false;
  }

  // Add an observer to the event stream.
  // This callback will be called every time `message` is emitted.
  public observe(msg_str: string, callback: this["Callback"]) {
    let messages = (msg_str as string).split(" "),
      len = messages.length,
      n,
      message,
      parts,
      base_msg,
      name;

    // loop through types and attach message listeners to each one. eg. 'Msg1 Msg2.namespace
    // Msg3' will create three message bindings
    for (n = 0; n < len; n++) {
      message = messages[n];
      parts = message.split(".");
      base_msg = parts[0];
      name = parts[1] || "";

      // create messages array if it doesn't exist
      if (!(base_msg in this.observers)) {
        this.observers[base_msg] = [];
      }

      this.observers[base_msg].push({ name, handler: callback });
    }
  }

  // Remove an observer from the event stream.
  public ignore(msg_str: string, callback?: this["Callback"]) {
    let messages = (msg_str as string).split(" ");
    let len = messages.length;
    let o;
    let message;
    let parts;
    let base_msg;
    let name;

    if (msg_str === "") {
      // remove all messages
      for (o in this.observers) {
        this._ignore(o);
      }
    }
    for (let n = 0; n < len; n++) {
      message = messages[n];
      parts = message.split(".");
      base_msg = parts[0];
      name = parts[1];

      if (base_msg) {
        if (this.observers[base_msg]) {
          this._ignore(base_msg, name, callback);
        }
      } else {
        for (o in this.observers) {
          this._ignore(o, name, callback);
        }
      }
    }
  }

  private _ignore(msg_type: string, name?: string, callback?: this["Callback"]) {
    let observers = this.observers[msg_type];
    let i;
    let msg_name;
    let handler;

    for (i = 0; i < observers.length; i++) {
      msg_name = observers[i].name;
      handler = observers[i].handler;
      if ((!name || msg_name === name) && (!callback || callback === handler)) {
        observers.splice(i, 1);
        if (observers.length === 0) {
          delete this.observers[msg_type];
          break;
        }
        i--;
      }
    }
  }

  // Get the main callback for the event stream.
  public get_callback(): Option<this["Callback"]> {
    return this.callback;
  }

  // Set the main callback for the event stream.
  public set_callback(callback: this["Callback"]) {
    if (this.callback_stream.is_some()) {
      this.callback_stream.unwrap().end(true);
    }
    this.callback = Some(callback);
    this.callback_stream = Some(flyd.chain((e: Msg) => flyd.stream(callback(e)), this.stream));
  }
}
