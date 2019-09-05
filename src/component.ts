import { EventStream } from './core'
import { Widget } from './widget'

export class Component<WIDGET extends Widget> {
  private _stream: EventStream<WIDGET['_Msg']>
  private _widget: WIDGET['_Root']

  constructor(stream: EventStream<WIDGET['_Msg']>, widget: WIDGET['_Root']) {
    this._stream = stream
    this._widget = widget
  }

  emit(msg: WIDGET['_Msg']) {
    this._stream.emit(msg)
  }

  stream(): EventStream<WIDGET['_Msg']> {
    return this._stream
  }

  root(): WIDGET['_Root'] {
    return this._widget
  }
}
