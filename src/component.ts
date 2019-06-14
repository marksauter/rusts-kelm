import konva from 'konva'
import flyd from 'flyd'
import { Node } from './node'

export class Component<NODE extends Node> {
  private _stream: flyd.Stream<NODE['_Msg']>
  private _node: NODE['_Root']

  constructor(stream: flyd.Stream<NODE['_Msg']>, node: NODE['_Root']) {
    this._stream = stream
    this._node = node
  }

  emit(msg: NODE['_Msg']) {
    this._stream(msg)
  }

  stream(): flyd.Stream<NODE['_Msg']> {
    return this._stream
  }

  node(): NODE['_Root'] {
    return this._node
  }

  remove_node(): NODE['_Root'] {
    return this.node().remove()
  }
}
