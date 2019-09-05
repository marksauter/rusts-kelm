import konva from 'konva'
import { EventStream } from './core'
import { Kelm, Update } from './state'
import { Component } from './component'
import { Container, ContainerBase, ContainerComponent } from './container'
import { Widget, WidgetBase, WidgetRoot, NodeEventMap } from './widget'

export type Msg<T, P> = { type: T; payload: P }
export function isMsg(m: any): m is Msg<any, any> {
  return 'type' in m && 'payload' in m
}

export type MsgFn<T, P> = (payload: P) => Msg<T, P> | void

class EchoMsg<T, P> {
  private f: MsgFn<T, P>
  constructor(f: MsgFn<T, P>) {
    this.f = f
  }
  call(payload: P): ReturnType<MsgFn<T, P>> {
    return this.f(payload)
  }
}

export function echo<T, P>(f: MsgFn<T, P>) {
  return new EchoMsg<T, P>(f)
}

// Connect Konva node event to component. Returns function that when called will disconnect the
// component from the event.
export function connect_to_component<
  NODE extends WidgetRoot,
  WIDGET extends Widget,
  CONTAINER extends Container,
  K extends keyof NodeEventMap
>(
  node: NODE,
  evt_str: K,
  component: Component<WIDGET> | ContainerComponent<CONTAINER>,
  msg: (e: NodeEventMap[K]) => WIDGET['_Msg'] | void
): void
export function connect_to_component<
  NODE extends WidgetRoot,
  WIDGET extends Widget,
  CONTAINER extends Container,
  K extends keyof NodeEventMap
>(
  node: NODE,
  evt_str: K,
  component: Component<WIDGET> | ContainerComponent<CONTAINER>,
  msg: (e: konva.KonvaEventObject<NodeEventMap[K]>) => WIDGET['_Msg'] | void
): void
export function connect_to_component<
  NODE extends WidgetRoot,
  WIDGET extends Widget,
  CONTAINER extends Container,
  K extends keyof NodeEventMap
>(
  node: NODE,
  evt_str: K,
  component: Component<WIDGET> | ContainerComponent<CONTAINER>,
  msg: () => WIDGET['_Msg']
): void
export function connect_to_component<
  NODE extends WidgetRoot,
  WIDGET extends Widget,
  CONTAINER extends Container,
  K extends keyof NodeEventMap
>(
  node: NODE,
  evt_str: K,
  component: Component<WIDGET> | ContainerComponent<CONTAINER>,
  msg: WIDGET['_Msg']
): void
export function connect_to_component<
  NODE extends WidgetRoot,
  WIDGET extends Widget,
  CONTAINER extends Container,
  K extends keyof NodeEventMap
>(
  node: NODE,
  evt_str: K,
  component: Component<WIDGET> | ContainerComponent<CONTAINER>,
  msg: any
): void {
  return connect_to_stream(node, evt_str, component.stream(), msg)
}

// Connect Konva Node event to Kelm message
export function connect_to_kelm<
  NODE extends WidgetRoot,
  UPDATE extends Update,
  K extends keyof NodeEventMap
>(
  node: NODE,
  evt_str: K,
  kelm: Kelm<UPDATE['_Msg']>,
  msg: (e: NodeEventMap[K]) => UPDATE['_Msg'] | void
): void
export function connect_to_kelm<
  NODE extends WidgetRoot,
  UPDATE extends Update,
  K extends keyof NodeEventMap
>(
  node: NODE,
  evt_str: K,
  kelm: Kelm<UPDATE['_Msg']>,
  msg: (e: konva.KonvaEventObject<NodeEventMap[K]>) => UPDATE['_Msg'] | void
): void
export function connect_to_kelm<
  NODE extends WidgetRoot,
  UPDATE extends Update,
  K extends keyof NodeEventMap
>(node: NODE, evt_str: K, kelm: Kelm<UPDATE['_Msg']>, msg: () => UPDATE['_Msg']): void
export function connect_to_kelm<
  NODE extends WidgetRoot,
  UPDATE extends Update,
  K extends keyof NodeEventMap
>(node: NODE, evt_str: K, kelm: Kelm<UPDATE['_Msg']>, msg: UPDATE['_Msg']): void
export function connect_to_kelm<
  NODE extends WidgetRoot,
  UPDATE extends Update,
  K extends keyof NodeEventMap
>(node: NODE, evt_str: K, kelm: Kelm<UPDATE['_Msg']>, msg: any): void {
  return connect_to_stream(node, evt_str, kelm.stream(), msg)
}

// Connect Konva node event to stream. Returns function that when called will disconnect the
// stream from the event.
export function connect_to_stream<
  NODE extends WidgetRoot,
  UPDATE extends Update,
  K extends keyof NodeEventMap
>(
  node: NODE,
  evt_str: K,
  stream: EventStream<UPDATE['_Msg']>,
  msg: (e: NodeEventMap[K]) => UPDATE['_Msg'] | void
): void
export function connect_to_stream<
  NODE extends WidgetRoot,
  UPDATE extends Update,
  K extends keyof NodeEventMap
>(
  node: NODE,
  evt_str: K,
  stream: EventStream<UPDATE['_Msg']>,
  msg: (e: konva.KonvaEventObject<NodeEventMap[K]>) => UPDATE['_Msg'] | void
): void
export function connect_to_stream<
  NODE extends WidgetRoot,
  UPDATE extends Update,
  K extends keyof NodeEventMap
>(node: NODE, evt_str: K, stream: EventStream<UPDATE['_Msg']>, msg: () => UPDATE['_Msg']): void
export function connect_to_stream<
  NODE extends WidgetRoot,
  UPDATE extends Update,
  K extends keyof NodeEventMap
>(node: NODE, evt_str: K, stream: EventStream<UPDATE['_Msg']>, msg: UPDATE['_Msg']): void
export function connect_to_stream<
  NODE extends WidgetRoot,
  UPDATE extends Update,
  K extends keyof NodeEventMap
>(node: NODE, evt_str: K, stream: EventStream<UPDATE['_Msg']>, msg: any): void {
  node.on(evt_str, (e: (typeof msg) extends ((e: infer E) => UPDATE['_Msg'] | void) ? E : any) => {
    let event = typeof msg === 'function' ? msg(e) : msg
    if (event) {
      stream.emit(event)
    }
  })
}

// Connect Kelm Component message to Kelm message
export function connect_component<WIDGET extends Container | Widget, UPDATE extends Update>(
  component: WIDGET extends Container ? ContainerComponent<WIDGET> : Component<WIDGET>,
  msg_str: string,
  kelm: Kelm<UPDATE['_Msg']>,
  msg: UPDATE['_Msg'] extends Msg<infer T, infer P> ? EchoMsg<T, P> : never
): void
export function connect_component<WIDGET extends Container | Widget, UPDATE extends Update>(
  component: WIDGET extends Container ? ContainerComponent<WIDGET> : Component<WIDGET>,
  msg_str: string,
  kelm: Kelm<UPDATE['_Msg']>,
  msg: (m: WIDGET['_Msg']) => UPDATE['_Msg'] | void
): void
export function connect_component<WIDGET extends Container | Widget, UPDATE extends Update>(
  component: WIDGET extends Container ? ContainerComponent<WIDGET> : Component<WIDGET>,
  msg_str: string,
  kelm: Kelm<UPDATE['_Msg']>,
  msg: () => UPDATE['_Msg']
): void
export function connect_component<WIDGET extends Container | Widget, UPDATE extends Update>(
  component: WIDGET extends Container ? ContainerComponent<WIDGET> : Component<WIDGET>,
  msg_str: string,
  kelm: Kelm<UPDATE['_Msg']>,
  msg: UPDATE['_Msg']
): void
export function connect_component<WIDGET extends Container | Widget, UPDATE extends Update>(
  component: WIDGET extends Container ? ContainerComponent<WIDGET> : Component<WIDGET>,
  msg_str: string,
  kelm: Kelm<UPDATE['_Msg']>,
  msg: any
): void {
  return connect_streams(component.stream(), msg_str, kelm.stream(), msg)
}

// Connect Component message reception to other Component.
export function connect_components<
  SRCWIDGET extends Container | Widget,
  DSTWIDGET extends Container | Widget
>(
  src_component: SRCWIDGET extends Container ? ContainerComponent<SRCWIDGET> : Component<SRCWIDGET>,
  msg_str: string,
  dst_component: DSTWIDGET extends Container ? ContainerComponent<DSTWIDGET> : Component<DSTWIDGET>,
  msg: DSTWIDGET['_Msg'] extends Msg<infer T, infer P> ? EchoMsg<T, P> : never
): void
export function connect_components<
  SRCWIDGET extends Container | Widget,
  DSTWIDGET extends Container | Widget
>(
  src_component: SRCWIDGET extends Container ? ContainerComponent<SRCWIDGET> : Component<SRCWIDGET>,
  msg_str: string,
  dst_component: DSTWIDGET extends Container ? ContainerComponent<DSTWIDGET> : Component<DSTWIDGET>,
  msg: (m: SRCWIDGET['_Msg']) => DSTWIDGET['_Msg'] | void
): void
export function connect_components<
  SRCWIDGET extends Container | Widget,
  DSTWIDGET extends Container | Widget
>(
  src_component: SRCWIDGET extends Container ? ContainerComponent<SRCWIDGET> : Component<SRCWIDGET>,
  msg_str: string,
  dst_component: DSTWIDGET extends Container ? ContainerComponent<DSTWIDGET> : Component<DSTWIDGET>,
  msg: () => DSTWIDGET['_Msg']
): void
export function connect_components<
  SRCWIDGET extends Container | Widget,
  DSTWIDGET extends Container | Widget
>(
  src_component: SRCWIDGET extends Container ? ContainerComponent<SRCWIDGET> : Component<SRCWIDGET>,
  msg_str: string,
  dst_component: DSTWIDGET extends Container ? ContainerComponent<DSTWIDGET> : Component<DSTWIDGET>,
  msg: DSTWIDGET['_Msg']
): void
export function connect_components<
  SRCWIDGET extends Container | Widget,
  DSTWIDGET extends Container | Widget
>(
  src_component: SRCWIDGET extends Container ? ContainerComponent<SRCWIDGET> : Component<SRCWIDGET>,
  msg_str: string,
  dst_component: DSTWIDGET extends Container ? ContainerComponent<DSTWIDGET> : Component<DSTWIDGET>,
  msg: any
): void {
  return connect_streams(src_component.stream(), msg_str, dst_component.stream(), msg)
}

// Connect Kelm message reception to other Kelm.
export function connect_kelms<SRC extends Update, DST extends Update>(
  src_kelm: Kelm<SRC['_Msg']>,
  msg_str: string,
  dst_kelm: Kelm<DST['_Msg']>,
  msg: DST['_Msg'] extends Msg<infer T, infer P> ? EchoMsg<T, P> : never
): void
export function connect_kelms<SRC extends Update, DST extends Update>(
  src_kelm: Kelm<SRC['_Msg']>,
  msg_str: string,
  dst_kelm: Kelm<DST['_Msg']>,
  msg: (m: SRC['_Msg']) => DST['_Msg'] | void
): void
export function connect_kelms<SRC extends Update, DST extends Update>(
  src_kelm: Kelm<SRC['_Msg']>,
  msg_str: string,
  dst_kelm: Kelm<DST['_Msg']>,
  msg: () => DST['_Msg']
): void
export function connect_kelms<SRC extends Update, DST extends Update>(
  src_kelm: Kelm<SRC['_Msg']>,
  msg_str: string,
  dst_kelm: Kelm<DST['_Msg']>,
  msg: DST['_Msg']
): void
export function connect_kelms<SRC extends Update, DST extends Update>(
  src_kelm: Kelm<SRC['_Msg']>,
  msg_str: string,
  dst_kelm: Kelm<DST['_Msg']>,
  msg: any
): void {
  return connect_streams(src_kelm.stream(), msg_str, dst_kelm.stream(), msg)
}

export function connect_streams<SRC extends Update, DST extends Update>(
  src_stream: EventStream<SRC['_Msg']>,
  msg_str: string,
  dst_stream: EventStream<DST['_Msg']>,
  msg: DST['_Msg'] extends Msg<infer T, infer P> ? EchoMsg<T, P> : never
): void
export function connect_streams<SRC extends Update, DST extends Update>(
  src_stream: EventStream<SRC['_Msg']>,
  msg_str: string,
  dst_stream: EventStream<DST['_Msg']>,
  msg: (m: SRC['_Msg']) => DST['_Msg'] | void
): void
export function connect_streams<SRC extends Update, DST extends Update>(
  src_stream: EventStream<SRC['_Msg']>,
  msg_str: string,
  dst_stream: EventStream<DST['_Msg']>,
  msg: () => DST['_Msg']
): void
export function connect_streams<SRC extends Update, DST extends Update>(
  src_stream: EventStream<SRC['_Msg']>,
  msg_str: string,
  dst_stream: EventStream<DST['_Msg']>,
  msg: DST['_Msg']
): void
export function connect_streams<SRC extends Update, DST extends Update>(
  src_stream: EventStream<SRC['_Msg']>,
  msg_str: string,
  dst_stream: EventStream<DST['_Msg']>,
  msg: any
): void {
  let messages = (msg_str as string).split(' '),
    len = messages.length,
    n,
    message,
    parts,
    base_msgs: string[] = []

  for (n = 0; n < len; n++) {
    message = messages[n]
    parts = message.split('.')
    base_msgs.push(parts[0])
  }
  const callback = (m: SRC['_Msg'] extends Msg<infer T, infer P> ? Msg<T, P> : SRC['_Msg']) => {
    let msg_type = isMsg(m) ? m.type : m
    if (base_msgs.includes(msg_type)) {
      let event =
        isMsg(m) && msg instanceof EchoMsg
          ? msg.call(m.payload)
          : typeof msg === 'function'
          ? msg(m)
          : msg
      if (event) {
        dst_stream.emit(event)
      }
    }
  }
  src_stream.observe(msg_str, callback)
}

// Create a new kelm widget with `model_param` as initialization value.
export function create_widget<WIDGET extends Widget>(
  WidgetClass: new () => WIDGET,
  model_param: WIDGET['_ModelParam']
): [Component<WIDGET>, WIDGET, Kelm<WIDGET['_Msg']>] {
  let widget = new WidgetClass()
  let stream: EventStream<WIDGET['_Msg']> = new EventStream()

  let kelm = new Kelm<WIDGET['_Msg']>(stream)
  let model = widget.model(kelm, model_param)
  widget.view(kelm, model)

  let root = widget.root()
  let component = new Component<WIDGET>(stream, root)
  return [component, widget, kelm]
}

export function create_widget_base<WIDGET extends Widget, WIDGETBASE extends WidgetBase>(
  widget: WIDGET,
  kelm: Kelm<WIDGET['_Msg']>,
  WidgetBaseClass: new () => WIDGETBASE,
  model_param: WIDGETBASE['_ModelParam']
): WIDGETBASE {
  let base = new WidgetBaseClass()

  let model = base.model(kelm, model_param)
  base.view(widget, kelm, model)

  return base
}

export function create_container<CONTAINER extends Container>(
  ContainerClass: new () => CONTAINER,
  model_param: CONTAINER['_ModelParam']
): [Component<CONTAINER>, CONTAINER, Kelm<CONTAINER['_Msg']>] {
  return create_widget(ContainerClass, model_param)
}

export function create_container_base<
  CONTAINER extends Container,
  CONTAINERBASE extends ContainerBase
>(
  container: CONTAINER,
  kelm: Kelm<CONTAINER['_Msg']>,
  ContainerBaseClass: new () => CONTAINERBASE,
  model_param: CONTAINERBASE['_ModelParam']
): CONTAINERBASE {
  return create_widget_base(container, kelm, ContainerBaseClass, model_param)
}
