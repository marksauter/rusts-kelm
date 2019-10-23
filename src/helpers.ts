import konva from "konva";
import { Self, Option, isNil, Debug, format, ImplPartialEq, eq } from "@rusts/std";
import { EventStream } from "./core";
import { Kelm, Update } from "./state";
import { Component } from "./component";
import { Container, ContainerComponent, ContainerConstructor } from "./container";
import { Widget, WidgetConstructor, WidgetRoot, NodeEventMap } from "./widget";
import { Parameter } from "./types";

// Connect Konva node event to component. Returns function that when called will disconnect the
// component from the event.
export function connect_to_component<
  R extends WidgetRoot,
  W extends Widget,
  C extends Container,
  K extends keyof NodeEventMap
>(
  root: R,
  evt_str: K,
  component: Component<W> | ContainerComponent<C>,
  msg: (e: NodeEventMap[K]) => Option<W["Msg"]>
): void;
export function connect_to_component<
  R extends WidgetRoot,
  W extends Widget,
  C extends Container,
  K extends keyof NodeEventMap
>(
  root: R,
  evt_str: K,
  component: Component<W> | ContainerComponent<C>,
  msg: (e: konva.KonvaEventObject<NodeEventMap[K]>) => Option<W["Msg"]>
): void;
export function connect_to_component<
  R extends WidgetRoot,
  W extends Widget,
  C extends Container,
  K extends keyof NodeEventMap
>(root: R, evt_str: K, component: Component<W> | ContainerComponent<C>, msg: any): void {
  return connect_to_stream(root, evt_str, component.stream(), msg);
}

// Connect Konva Node event to Kelm message
export function connect_to_kelm<
  R extends WidgetRoot,
  U extends Update,
  K extends keyof NodeEventMap
>(root: R, evt_str: K, kelm: Kelm<U["Msg"]>, msg: (e: NodeEventMap[K]) => Option<U["Msg"]>): void;
export function connect_to_kelm<
  R extends WidgetRoot,
  U extends Update,
  K extends keyof NodeEventMap
>(
  root: R,
  evt_str: K,
  kelm: Kelm<U["Msg"]>,
  msg: (e: konva.KonvaEventObject<NodeEventMap[K]>) => Option<U["Msg"]>
): void;
export function connect_to_kelm<
  R extends WidgetRoot,
  U extends Update,
  K extends keyof NodeEventMap
>(root: R, evt_str: K, kelm: Kelm<U["Msg"]>, msg: any): void {
  return connect_to_stream(root, evt_str, kelm.stream(), msg);
}

// Connect Konva node event to stream. Returns function that when called will disconnect the
// stream from the event.
export function connect_to_stream<
  R extends WidgetRoot,
  U extends Update,
  K extends keyof NodeEventMap
>(
  root: R,
  evt_str: K,
  stream: EventStream<U["Msg"]>,
  msg: (e: NodeEventMap[K]) => Option<U["Msg"]>
): void;
export function connect_to_stream<
  R extends WidgetRoot,
  U extends Update,
  K extends keyof NodeEventMap
>(
  root: R,
  evt_str: K,
  stream: EventStream<U["Msg"]>,
  msg: (e: konva.KonvaEventObject<NodeEventMap[K]>) => Option<U["Msg"]>
): void;
export function connect_to_stream<
  R extends WidgetRoot,
  U extends Update,
  K extends keyof NodeEventMap
>(root: R, evt_str: K, stream: EventStream<U["Msg"]>, msg: any): void {
  root.on(evt_str, (e: Parameter<typeof msg>) => {
    let event = msg(e);
    if (event.is_some()) {
      stream.emit(event.unwrap());
    }
  });
}

// Connect Kelm Component message to Kelm message
export function connect_component<W extends Container | Widget, U extends Update>(
  component: W extends Container ? ContainerComponent<W> : Component<W>,
  msg_str: string,
  kelm: Kelm<U["Msg"]>,
  msg: (m: W["Msg"]) => Option<U["Msg"]>
): void {
  return connect_streams(component.stream(), msg_str, kelm.stream(), msg);
}

// Connect Component message reception to other Component.
export function connect_components<Src extends Container | Widget, Dst extends Container | Widget>(
  src_component: Src extends Container ? ContainerComponent<Src> : Component<Src>,
  msg_str: string,
  dst_component: Dst extends Container ? ContainerComponent<Dst> : Component<Dst>,
  msg: (m: Src["Msg"]) => Option<Dst["Msg"]>
): void {
  return connect_streams(src_component.stream(), msg_str, dst_component.stream(), msg);
}

// Connect Kelm message reception to other Kelm.
export function connect_kelms<Src extends Update, Dst extends Update>(
  src_kelm: Kelm<Src["Msg"]>,
  msg_str: string,
  dst_kelm: Kelm<Dst["Msg"]>,
  msg: (m: Src["Msg"]) => Option<Dst["Msg"]>
): void {
  return connect_streams(src_kelm.stream(), msg_str, dst_kelm.stream(), msg);
}

export function connect_streams<Src extends Update, Dst extends Update>(
  src_stream: EventStream<Src["Msg"]>,
  msg_str: string,
  dst_stream: EventStream<Dst["Msg"]>,
  msg: (m: Src["Msg"]) => Option<Dst["Msg"]>
): void {
  const callback = (m: Src["Msg"]) => {
    let event = msg(m);
    if (event.is_some()) {
      dst_stream.emit(event.unwrap());
    }
  };
  src_stream.observe(msg_str, callback);
}

// Create a new kelm widget with `model_param` as initialization value.
export function create_widget<W extends Widget>(
  WidgetClass: WidgetConstructor<W>,
  model_param: W["Param"]
): [Component<W>, W, Kelm<W["Msg"]>] {
  let stream: EventStream<W["Msg"]> = new EventStream();
  let kelm = new Kelm<W["Msg"]>(stream);
  let widget = new WidgetClass(kelm, model_param);

  let root = widget.root();
  let component = new Component<W>(stream, root);
  return [component, widget, kelm];
}

export function create_container<R extends Container>(
  ContainerClass: ContainerConstructor<R>,
  model_param: R["Param"]
): [Component<R>, R, Kelm<R["Msg"]>] {
  return create_widget(ContainerClass, model_param);
}
