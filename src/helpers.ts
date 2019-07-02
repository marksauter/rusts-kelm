import konva from 'konva'
import { EventStream } from './core'
import { Kelm, Update } from './state'
import { Component } from './component'
import { Node } from './node'

type NodeEventMap = GlobalEventHandlersEventMap & {
  [index: string]: any
}

export type Msg<T, P> = { type: T; payload: P }

// Connect component's Konva node to event. Returns function that when called will disconnect the
// component from the event.
export function connect<
  NODE extends Node,
  K extends keyof NodeEventMap & ('keydown' | 'keypress' | 'keyup')
>(
  component: Component<NODE>,
  evtStr: K,
  msg: (e: NodeEventMap[K]) => NODE['_Msg'] | void
): () => void
export function connect<NODE extends Node, K extends keyof NodeEventMap>(
  component: Component<NODE>,
  evtStr: K,
  msg: (e: konva.KonvaEventObject<NodeEventMap[K]>) => NODE['_Msg'] | void
): () => void
export function connect<NODE extends Node, K extends keyof NodeEventMap>(
  component: Component<NODE>,
  evtStr: K,
  msg: NODE['_Msg']
): () => void
export function connect<NODE extends Node, K extends keyof NodeEventMap>(
  component: Component<NODE>,
  evtStr: K,
  msg: any
): () => void {
  return connect_to_stream(component.node(), evtStr, component.stream(), msg)
}

// Connect Konva node event to component. Returns function that when called will disconnect the
// component from the event.
export function connect_to_component<
  NODE extends Node,
  K extends keyof NodeEventMap & ('keydown' | 'keypress' | 'keyup')
>(
  node: konva.Node,
  evtStr: K,
  component: Component<NODE>,
  msg: (e: NodeEventMap[K]) => NODE['_Msg'] | void
): () => void
export function connect_to_component<NODE extends Node, K extends keyof NodeEventMap>(
  node: konva.Node,
  evtStr: K,
  component: Component<NODE>,
  msg: (e: konva.KonvaEventObject<NodeEventMap[K]>) => NODE['_Msg'] | void
): () => void
export function connect_to_component<NODE extends Node, K extends keyof NodeEventMap>(
  node: konva.Node,
  evtStr: K,
  component: Component<NODE>,
  msg: NODE['_Msg']
): () => void
export function connect_to_component<NODE extends Node, K extends keyof NodeEventMap>(
  node: konva.Node,
  evtStr: K,
  component: Component<NODE>,
  msg: any
): () => void {
  return connect_to_stream(node, evtStr, component.stream(), msg)
}
// Connect Konva node event to Kelm. Returns function that when called will disconnect the
// Kelm stream from the event.
export function connect_to_kelm<
  UPDATE extends Update,
  K extends keyof NodeEventMap & ('keydown' | 'keypress' | 'keyup')
>(
  node: konva.Node,
  evtStr: K,
  kelm: Kelm<UPDATE>,
  msg: (e: NodeEventMap[K]) => UPDATE['_Msg'] | void
): () => void
export function connect_to_kelm<UPDATE extends Update, K extends keyof NodeEventMap>(
  node: konva.Node,
  evtStr: K,
  kelm: Kelm<UPDATE>,
  msg: (e: konva.KonvaEventObject<NodeEventMap[K]>) => UPDATE['_Msg'] | void
): () => void
export function connect_to_kelm<UPDATE extends Update, K extends keyof NodeEventMap>(
  node: konva.Node,
  evtStr: K,
  kelm: Kelm<UPDATE>,
  msg: UPDATE['_Msg']
): () => void
export function connect_to_kelm<UPDATE extends Update, K extends keyof NodeEventMap>(
  node: konva.Node,
  evtStr: K,
  kelm: Kelm<UPDATE>,
  msg: any
): () => void {
  return connect_to_stream(node, evtStr, kelm.stream(), msg)
}

// Connect Konva node event to stream. Returns function that when called will disconnect the
// stream from the event.
export function connect_to_stream<
  UPDATE extends Update,
  K extends keyof NodeEventMap & ('keydown' | 'keypress' | 'keyup')
>(
  node: konva.Node,
  evtStr: K,
  stream: EventStream<UPDATE['_Msg']>,
  msg: (e: NodeEventMap[K]) => UPDATE['_Msg'] | void
): () => void
export function connect_to_stream<UPDATE extends Update, K extends keyof NodeEventMap>(
  node: konva.Node,
  evtStr: K,
  stream: EventStream<UPDATE['_Msg']>,
  msg: (e: konva.KonvaEventObject<NodeEventMap[K]>) => UPDATE['_Msg'] | void
): () => void
export function connect_to_stream<UPDATE extends Update, K extends keyof NodeEventMap>(
  node: konva.Node,
  evtStr: K,
  stream: EventStream<UPDATE['_Msg']>,
  msg: UPDATE['_Msg']
): () => void
export function connect_to_stream<UPDATE extends Update, K extends keyof NodeEventMap>(
  node: konva.Node,
  evtStr: K,
  stream: EventStream<UPDATE['_Msg']>,
  msg: any
): () => void {
  if (['keydown', 'keypress', 'keyup'].includes(evtStr as string)) {
    if (node instanceof konva.Stage) {
      let container = node.container()
      container.tabIndex = 1
      container.focus()
      let listener: EventListener = e => {
        let event = typeof msg === 'function' ? msg(e) : msg
        if (event) {
          stream.emit(event)
        }
      }
      container.addEventListener(evtStr as string, listener)
      return () => container.removeEventListener(evtStr as string, listener)
    } else if (window) {
      let listener: EventListener = e => {
        let event = typeof msg === 'function' ? msg(e) : msg
        if (event) {
          stream.emit(event)
        }
      }
      window.addEventListener(evtStr as string, listener)
      return () => window.removeEventListener(evtStr as string, listener)
    }
  } else {
    node.on(evtStr, e => {
      let event = typeof msg === 'function' ? msg(e) : msg
      if (event) {
        stream.emit(event)
      }
    })
    return () => {
      node.off(evtStr as string)
    }
  }
  return () => {}
}

// Connect Component message reception to other Component.
export function connect_components<SRCNODE extends Node, DSTNODE extends Node>(
  src_component: Component<SRCNODE>,
  message: SRCNODE['_Msg'] extends Msg<infer T, infer _P> ? T : SRCNODE['_Msg'],
  dst_component: Component<DSTNODE>,
  msg: DSTNODE['_Msg']
): () => void
export function connect_components<SRCNODE extends Node, DSTNODE extends Node>(
  src_component: Component<SRCNODE>,
  message: SRCNODE['_Msg'] extends Msg<infer T, infer _P> ? T : SRCNODE['_Msg'],
  dst_component: Component<DSTNODE>,
  msg: (m: SRCNODE['_Msg']) => DSTNODE['_Msg'] | void
): () => void
export function connect_components<SRCNODE extends Node, DSTNODE extends Node>(
  src_component: Component<SRCNODE>,
  message: SRCNODE['_Msg'] extends Msg<infer T, infer _P> ? T : SRCNODE['_Msg'],
  dst_component: Component<DSTNODE>,
  msg: any
): () => void {
  // The following function call errors with `message` not assignable to parameter, but I know for
  // sure that they are the same type.
  // See typescript issue: https://github.com/Microsoft/TypeScript/issues/21756
  // @ts-ignore
  return connect_streams(src_component.stream(), message, dst_component.stream(), msg)
}

export function connect_streams<SRC extends Update, DST extends Update>(
  src_stream: EventStream<SRC['_Msg']>,
  message: SRC['_Msg'] extends Msg<infer T, infer _P> ? T : SRC['_Msg'],
  dst_stream: EventStream<DST['_Msg']>,
  msg: (m: SRC['_Msg']) => DST['_Msg'] | void
): () => void
export function connect_streams<SRC extends Update, DST extends Update>(
  src_stream: EventStream<SRC['_Msg']>,
  message: SRC['_Msg'] extends Msg<infer T, infer _P> ? T : SRC['_Msg'],
  dst_stream: EventStream<DST['_Msg']>,
  msg: DST['_Msg']
): () => void
export function connect_streams<SRC extends Update, DST extends Update>(
  src_stream: EventStream<SRC['_Msg']>,
  message: SRC['_Msg'] extends Msg<infer T, infer _P> ? T : SRC['_Msg'],
  dst_stream: EventStream<DST['_Msg']>,
  msg: any
): () => void {
  let index = src_stream.observe(
    (m: SRC['_Msg'] extends Msg<infer T, infer P> ? Msg<T, P> : SRC['_Msg']) => {
      if (m.type === message || (m as SRC['_Msg']) === (message as SRC['_Msg'])) {
        let event = typeof msg === 'function' ? msg(m) : msg
        if (event) {
          dst_stream.emit(event)
        }
      }
    }
  )
  return () => {
    src_stream.ignore(index)
  }
}

export function create_node<NODE extends Node>(
  NodeClass: new () => NODE,
  model_param: NODE['_ModelParam']
): [Component<NODE>, NODE, Kelm<Update<NODE['_Model'], NODE['_ModelParam'], NODE['_Msg']>>] {
  let node = new NodeClass()
  let stream: EventStream<NODE['_Msg']> = new EventStream()

  let kelm = new Kelm<Update<NODE['_Model'], NODE['_ModelParam'], NODE['_Msg']>>(stream)
  let model = node.model(kelm, model_param)
  node.view(kelm, model)

  let root = node.root()
  let component = new Component<NODE>(stream, root)
  return [component, node, kelm]
}
