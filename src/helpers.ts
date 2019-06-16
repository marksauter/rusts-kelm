import konva from 'konva'
import flyd from 'flyd'
import { Kelm, Update } from './state'
import { Component } from './component'
import { Node } from './node'

type NodeEventMap = GlobalEventHandlersEventMap & {
  [index: string]: any
}

export function connect<UPDATE extends Update, K extends keyof NodeEventMap>(
  stream: flyd.Stream<UPDATE['_Msg']>,
  node: konva.Node,
  evtStr: K,
  msg: UPDATE['_Msg']
): void
export function connect<UPDATE extends Update, K extends keyof NodeEventMap>(
  stream: flyd.Stream<UPDATE['_Msg']>,
  node: konva.Node,
  evtStr: K,
  msg: (e: konva.KonvaEventObject<NodeEventMap[K]>) => UPDATE['_Msg']
): void
export function connect<UPDATE extends Update, K extends keyof NodeEventMap>(
  kelm: Kelm<UPDATE>,
  node: konva.Node,
  evtStr: K,
  msg: UPDATE['_Msg']
): void
export function connect<UPDATE extends Update, K extends keyof NodeEventMap>(
  kelm: Kelm<UPDATE>,
  node: konva.Node,
  evtStr: string,
  msg: (e: konva.KonvaEventObject<NodeEventMap[K]>) => UPDATE['_Msg']
): void
export function connect<UPDATE extends Update, K extends keyof NodeEventMap>(
  kelmOrStream: flyd.Stream<UPDATE['_Msg']> | Kelm<UPDATE>,
  node: konva.Node,
  evtStr: K,
  msg: (e: konva.KonvaEventObject<NodeEventMap[K]>) => UPDATE['_Msg'] | UPDATE['_Msg']
): void {
  let stream = kelmOrStream instanceof Kelm ? kelmOrStream.stream() : kelmOrStream
  node.on(evtStr, e => {
    let event = typeof msg === 'function' ? msg(e) : msg
    stream(event)
  })
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
