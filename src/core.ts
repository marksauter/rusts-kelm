import flyd from 'flyd'

export class EventStream<MSG> {
  private callback: ((event: MSG) => void) | null = null
  private callback_stream: flyd.Stream<any> | null = null
  private stream: flyd.Stream<MSG> = flyd.stream()
  private locked: boolean = false
  private observer_stream: flyd.Stream<any>
  private observers: {
    [index: string]: Array<{ name: string; handler: (event: MSG) => void }>
  } = {}

  constructor() {
    this.observer_stream = flyd.chain((m: MSG) => {
      for (let t in this.observers) {
        for (let o of this.observers[t]) {
          o.handler(m)
        }
      }
      return flyd.stream()
    }, this.stream)
  }

  // Close the event stream, i.e. stop processing messages
  close() {
    this.stream.end(true)
  }

  // Send the `event` message to the stream and the observers.
  emit(event: MSG) {
    if (!this.locked) {
      this.stream(event)
    }
  }

  // Locks the stream (doesn't emit messages) until a subsequent call to `unlock` is made.
  lock() {
    this.locked = true
  }

  // Unlocks the stream (emit messages) after a call to `lock` was made.
  unlock() {
    this.locked = false
  }

  // Add an observer to the event stream.
  // This callback will be called every time `message` is emitted.
  observe(msg_str: string, callback: (event: MSG) => void) {
    let messages = (msg_str as string).split(' '),
      len = messages.length,
      n,
      message,
      parts,
      base_msg,
      name

    // loop through types and attach message listeners to each one. eg. 'Msg1 Msg2.namespace
    // Msg3' will create three message bindings
    for (n = 0; n < len; n++) {
      message = messages[n]
      parts = message.split('.')
      base_msg = parts[0]
      name = parts[1] || ''

      // create messages array if it doesn't exist
      if (!this.observers[base_msg]) {
        this.observers[base_msg] = []
      }

      this.observers[base_msg].push({ name, handler: callback })
    }
  }

  // Remove an observer from the event stream.
  ignore(msg_str: string, callback?: (event: MSG) => void) {
    let messages = (msg_str as string).split(' '),
      len = messages.length,
      n,
      o,
      message,
      parts,
      base_msg,
      name

    if (!msg_str) {
      // remove all messages
      for (o in this.observers) {
        this._ignore(o)
      }
    }
    for (let n = 0; n < len; n++) {
      message = messages[n]
      parts = message.split('.')
      base_msg = parts[0]
      name = parts[1]

      if (base_msg) {
        if (this.observers[base_msg]) {
          this._ignore(base_msg, name, callback)
        }
      } else {
        for (o in this.observers) {
          this._ignore(o, name, callback)
        }
      }
    }
  }

  _ignore(msg_type: string, name?: string, callback?: (event: MSG) => void) {
    let observers = this.observers[msg_type],
      i,
      msg_name,
      handler

    for (i = 0; i < observers.length; i++) {
      msg_name = observers[i].name
      handler = observers[i].handler
      if ((!name || msg_name === name) && (!callback || callback === handler)) {
        observers.splice(i, 1)
        if (observers.length === 0) {
          delete this.observers[msg_type]
          break
        }
        i--
      }
    }
  }

  // Get the main callback for the event stream.
  get_callback() {
    return this.callback
  }

  // Set the main callback for the event stream.
  set_callback(callback: (event: MSG) => void) {
    if (this.callback_stream) {
      this.callback_stream.end(true)
    }
    this.callback = callback
    this.callback_stream = flyd.chain((e: MSG) => flyd.stream(callback(e)), this.stream)
  }
}
