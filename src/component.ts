import konva from 'konva'
import { EventStream } from './core'
import { Node } from './node'

export class Component<NODE extends Node> {
  private _stream: EventStream<NODE['_Msg']>
  private _node: NODE['_Root']

  constructor(stream: EventStream<NODE['_Msg']>, node: NODE['_Root']) {
    this._stream = stream
    this._node = node
  }

  emit(msg: NODE['_Msg']) {
    this._stream.emit(msg)
  }

  stream(): EventStream<NODE['_Msg']> {
    return this._stream
  }

  node(): NODE['_Root'] {
    return this._node
  }

  remove_node(): NODE['_Root'] {
    return this.node().remove()
  }
}
