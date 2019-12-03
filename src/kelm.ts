import { EventStream } from "./core";
import { Result, Ok } from "@rusts/std";
import { init_component } from "./state";
import { create_widget } from "./helpers";
import { Widget, WidgetContainer, WidgetConstructor } from "./widget";
import "./node";

export * from "./core";
export * from "./state";
export * from "./container";
export * from "./helpers";
export * from "./widget";

// Create a new kelm widget without adding it to an existing widget.
// This is usefule when a kelm widget is at the root of another kelm widget.
export function create_component<W extends Widget>(
  WidgetClass: WidgetConstructor<W>,
  model_param: W["Param"]
): W["IntoComp"] {
  let [component, widget, kelm] = create_widget(WidgetClass, model_param);
  init_component(component.stream(), widget, kelm);
  return component;
}

export function init<W extends Widget>(
  WidgetClass: WidgetConstructor<W>,
  model_param: W["Param"]
): Result<W["IntoComp"], undefined> {
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

export function add_widget<W extends Widget, R extends WidgetContainer<W["Root"]>>(
  container: R,
  WidgetClass: WidgetConstructor<W>,
  model_param: W["Param"]
): W["IntoComp"] {
  let [component, child, child_kelm] = create_widget(WidgetClass, model_param);
  let root = child.root();
  container.add(root);
  child.on_add(child_kelm, container);
  init_component(component.stream(), child, child_kelm);
  return component;
}
