import konva from 'konva'
import flyd from 'flyd'
import { Kelm, Update } from './state'
import { Component } from './component'
import { Node } from './node'

type NodeEventMap = GlobalEventHandlersEventMap & {
  [index: string]: any
}

type MsgExpr<UPDATE extends Update, K extends keyof NodeEventMap> = (
  e: konva.KonvaEventObject<NodeEventMap[K]>
) => UPDATE['_Msg'] | UPDATE['_Msg']

// Connect component Konva node to event
export function connect<NODE extends Node, K extends keyof NodeEventMap>(
  evtStr: K,
  component: Component<NODE>,
  msg: MsgExpr<NODE['_Update'], K>
): void {
  connect_to_stream(component.node(), evtStr, component.stream(), msg)
}

// Connect Konva node event to component.
export function connect_to_component<NODE extends Node, K extends keyof NodeEventMap>(
  node: konva.Node,
  evtStr: K,
  component: Component<NODE>,
  msg: MsgExpr<NODE['_Update'], K>
): void {
  connect_to_stream(node, evtStr, component.stream(), msg)
}
// Connect Konva node event to Kelm.
export function connect_to_kelm<UPDATE extends Update, K extends keyof NodeEventMap>(
  node: konva.Node,
  evtStr: K,
  kelm: Kelm<UPDATE>,
  msg: MsgExpr<UPDATE, K>
): void {
  connect_to_stream(node, evtStr, kelm.stream(), msg)
}
// Connect Component message reception to other Component.
export function connect_components<
  SRCNODE extends Node,
  K extends keyof NodeEventMap,
  DSTNODE extends Node
>(
  src_component: Component<SRCNODE>,
  message: SRCNODE['_Msg'],
  dst_component: Component<DSTNODE>,
  msg: MsgExpr<DSTNODE['_Update'], K>
): void {
  connect_streams(src_component.stream(), message, dst_component.stream(), msg)
}

export function connect_to_stream<UPDATE extends Update, K extends keyof NodeEventMap>(
  node: konva.Node,
  evtStr: K,
  stream: flyd.Stream<UPDATE['_Msg']>,
  msg: MsgExpr<UPDATE, K>
): void {
  node.on(evtStr, e => {
    let event = typeof msg === 'function' ? msg(e) : msg
    stream(event)
  })
}
export function connect_streams<
  SRC extends Update,
  DST extends Update,
  K extends keyof NodeEventMap
>(
  src_stream: flyd.Stream<SRC['_Msg']>,
  message: SRC['_Msg'],
  dst_stream: flyd.Stream<DST['_Msg']>,
  msg: MsgExpr<DST, K>
): void {
  flyd.chain(m => {
    if (m === message) {
      return dst_stream(msg)
    }
    return dst_stream
  }, src_stream)
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
