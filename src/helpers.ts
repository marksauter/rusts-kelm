import konva from 'konva'
import flyd from 'flyd'
import { Kelm, Update } from './state'
import { Component } from './component'
import { Node } from './node'

export function connect<UPDATE extends Update>(
  kelm: Kelm<UPDATE>,
  node: konva.Node,
  evtStr: string,
  msg: UPDATE['_Msg']
) {
  node.on(evtStr, () => kelm.stream()(msg))
}

export function create_node<NODE extends Node>(
  NodeClass: new () => NODE,
  model_param: NODE['_ModelParam']
): [Component<NODE>, NODE, Kelm<Update<NODE['_Model'], NODE['_ModelParam'], NODE['_Msg']>>] {
  let node = new NodeClass()
  let stream: flyd.Stream<NODE['_Msg']> = flyd.stream()

  let kelm = new Kelm<Update<NODE['_Model'], NODE['_ModelParam'], NODE['_Msg']>>(stream)
  let model = node.model(kelm, model_param)
  node.view(kelm, model)

  let root = node.root()
  let component = new Component<NODE>(stream, root)
  return [component, node, kelm]
}
