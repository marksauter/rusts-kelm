import flyd from 'flyd'

type _EventStream<MSG> = {
  events: flyd.Stream<MSG>
  locked: boolean
  observers: flyd.Stream<any>[]
}

export class EventStream<MSG> {
  private callback?: flyd.Stream<any>
  private stream: _EventStream<MSG>

  constructor() {
    this.stream = {
      events: flyd.stream(),
      locked: false,
      observers: []
    }
  }

  private get_stream(): flyd.Stream<MSG> {
    return this.stream.events
  }

  // Close the event stream, i.e. stop processing messages
  close() {
    this.get_stream().end(true)
  }

  // Send the `event` message to the stream and the observers.
  emit(event: MSG) {
    if (!this.stream.locked) {
      this.get_stream()(event)
    }
  }

  // Locks the stream (doesn't emit messages) until a subsequent call to `unlock` is made.
  lock() {
    this.stream.locked = true
  }

  // Unlocks the stream (emit messages) after a call to `lock` was made.
  unlock() {
    this.stream.locked = false
  }

  // Add an observer to the event stream.
  // This callback will be called every time a message is emitted.
  // Returns the index of the observer within the observers array, which can be
  // used as the parameters to ignore() to remove the observer from the stream.
  observe(callback: (event: MSG) => void): number {
    return (
      this.stream.observers.push(
        flyd.chain((e: MSG) => flyd.stream(callback(e)), this.get_stream())
      ) - 1
    )
  }

  // Remove an observer from the event stream at `index` into observers array.
  // See `observe` method above.
  ignore(index: number) {
    let len = this.stream.observers.length
    if (len > 0 && index >= 0 && index < len) {
      this.stream.observers[index].end(true)
      this.stream.observers.splice(index, 1)
    }
  }

  // Set the main callback for the event stream.
  set_callback(callback: (event: MSG) => void) {
    if (this.callback) {
      this.callback.end(true)
    }
    this.callback = flyd.chain((e: MSG) => flyd.stream(callback(e)), this.get_stream())
  }
}
