import flyd from 'flyd'

export class EventStream<MSG> {
  private callback?: flyd.Stream<any>
  private stream: flyd.Stream<MSG> = flyd.stream()
  private locked: boolean = false
  private observer_stream: flyd.Stream<any>
  private observers: ((event: MSG) => void)[] = []

  constructor() {
    this.observer_stream = flyd.chain((e: MSG) => {
      for (let observer of this.observers) {
        observer(e)
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
  // This callback will be called every time a message is emitted.
  observe(callback: (event: MSG) => void) {
    this.observers.push(callback)
  }

  // Remove an observer from the event stream.
  // The callback must be one used in a prior call to `observe`.
  ignore(callback: (event: MSG) => void) {
    let index = this.observers.indexOf(callback)
    if (index !== -1) {
      this.observers.splice(index, 1)
    }
  }

  // Remove all observers from the event stream.
  ignore_all() {
    this.observers = []
  }

  // Set the main callback for the event stream.
  set_callback(callback: (event: MSG) => void) {
    if (this.callback) {
      this.callback.end(true)
    }
    this.callback = flyd.chain((e: MSG) => flyd.stream(callback(e)), this.stream)
  }
}
