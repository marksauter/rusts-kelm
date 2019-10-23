import { EventStream } from "./core";
import { Result, Ok, Err } from "@rusts/std";
import { Kelm, init_component } from "./state";
import { Component } from "./component";
import { Container, ContainerConstructor, ContainerComponent, WidgetContainer } from "./container";
import { create_container, create_widget } from "./helpers";
import { Widget, WidgetConstructor } from "./widget";
import "./node";

export * from "./core";
export * from "./state";
export * from "./component";
export * from "./container";
export * from "./helpers";
export * from "./widget";

// Create a new kelm widget without adding it to an existing widget.
// This is usefule when a kelm widget is at the root of another kelm widget.
export function create_component<W extends Widget>(
  WidgetClass: WidgetConstructor<W>,
  model_param: W["Param"]
): Component<W> {
  let [component, widget, kelm] = create_widget(WidgetClass, model_param);
  init_component(component.stream(), widget, kelm);
  return component;
}

// Create a new kelm container widget without adding it to an existing widget.
// This is useful when a kelm widget is at the root of another kelm widget.
export function create_container_component<R extends Container>(
  ContainerClass: ContainerConstructor<R>,
  model_param: R["Param"]
): ContainerComponent<R> {
  let [component, widget, kelm] = create_container(ContainerClass, model_param);
  let container = widget.container();
  init_component(component.stream(), widget, kelm);
  return new ContainerComponent(component, container);
}

export function init<W extends Widget>(
  WidgetClass: WidgetConstructor<W>,
  model_param: W["Param"]
): Result<Component<W>, undefined> {
  let [component, widget, kelm] = create_widget(WidgetClass, model_param);
  init_component(component.stream(), widget, kelm);
  return Ok(component);
}

export function run<W extends Widget>(
  WidgetClass: WidgetConstructor<W>,
  model_param: W["Param"]
): Result<undefined, undefined> {
  let _component = init(WidgetClass, model_param);
  return Ok(undefined);
}

export function interval<Msg>(stream: EventStream<Msg>, duration: number, msg: () => Msg) {
  setInterval(() => {
    let m = msg();
    stream.emit(m);
  }, duration);
}

export function timeout<Msg>(stream: EventStream<Msg>, duration: number, msg: () => Msg) {
  setTimeout(() => {
    let m = msg();
    stream.emit(m);
  }, duration);
}

export function add_container<R extends Container>(
  container: WidgetContainer<R["Root"]>,
  ContainerClass: ContainerConstructor<R>,
  model_param: R["Param"]
): ContainerComponent<R> {
  let [component, child, child_kelm] = create_widget(ContainerClass, model_param);
  let child_container = child.container();
  let root = child.root();
  container.add(root);
  child.on_add(child_kelm, container);
  init_component(component.stream(), child, child_kelm);
  return new ContainerComponent<R>(component, child_container);
}

export function add_widget<W extends Widget>(
  container: W["Parent"],
  WidgetClass: WidgetConstructor<W>,
  model_param: W["Param"]
): Component<W> {
  let [component, child, child_kelm] = create_widget(WidgetClass, model_param);
  let root = child.root();
  container.add(root);
  child.on_add(child_kelm, container);
  init_component(component.stream(), child, child_kelm);
  return component;
}
