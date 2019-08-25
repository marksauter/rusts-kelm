// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
import { EventStream } from './core'
import { Kelm, init_component, init_component_base } from './state'
import { Component } from './component'
import { Container, ContainerBase, ContainerComponent, WidgetContainer } from './container'
import { create_widget, create_widget_base } from './helpers'
import { Widget, WidgetBase } from './widget'
import './node'

export * from './core'
export * from './state'
export * from './component'
export * from './container'
export * from './helpers'
export * from './widget'

export const OK = 'Ok'
export const ERR = 'Err'

export type Ok<T> = ['Ok', T]
export type Err<E> = ['Err', E]
export type Result<T, E> = Ok<T> | Err<E>

export const Ok = <T>(value: T): Ok<T> => [OK, value]
export const Err = <E>(value: E): Err<E> => [ERR, value]

// Create a new kelm widget without adding it to an existing widget.
// This is usefule when a kelm widget is at the root of another kelm widget.
export function create_component<WIDGET extends Widget>(
  WidgetClass: new () => WIDGET,
  model_param: WIDGET['_ModelParam']
): Component<WIDGET> {
  let [component, widget, kelm] = create_widget(WidgetClass, model_param)
  init_component(component.stream(), widget, kelm)
  return component
}

// Create a new kelm container widget without adding it to an existing widget.
// This is useful when a kelm widget is at the root of another kelm widget.
export function create_container<CONTAINER extends Container>(
  ContainerClass: new () => CONTAINER,
  model_param: CONTAINER['_ModelParam']
): ContainerComponent<CONTAINER> {
  let [component, widget, kelm] = create_widget(ContainerClass, model_param)
  let container = widget.container()
  init_component(component.stream(), widget, kelm)
  return new ContainerComponent(component, container)
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

export function init<WIDGET extends Widget>(
  WidgetClass: new () => WIDGET,
  model_param: WIDGET['_ModelParam']
): Result<Component<WIDGET>, never> {
  let [component, widget, kelm] = create_widget(WidgetClass, model_param)
  init_component(component.stream(), widget, kelm)
  return Ok(component)
}

export function init_base<WIDGET extends Widget, WIDGETBASE extends WidgetBase>(
  widget: WIDGET,
  kelm: Kelm<WIDGET['_Msg']>,
  WidgetBaseClass: new () => WIDGETBASE,
  model_param: WIDGETBASE['_ModelParam']
): Result<null, null> {
  let base = create_widget_base(widget, kelm, WidgetBaseClass, model_param)
  init_component_base(kelm.stream(), widget, base, kelm)
  return Ok(null)
}

export function run<WIDGET extends Widget>(
  WidgetClass: new () => WIDGET,
  model_param: WIDGET['_ModelParam']
): Result<null, null> {
  let _component = init(WidgetClass, model_param)
  return Ok(null)
}

export function interval<MSG>(stream: EventStream<MSG>, duration: number, constructor: () => MSG) {
  setInterval(() => {
    let msg = constructor()
    stream.emit(msg)
  }, duration)
}

export function timeout<MSG>(stream: EventStream<MSG>, duration: number, constructor: () => MSG) {
  setTimeout(() => {
    let msg = constructor()
    stream.emit(msg)
  }, duration)
}

export function add_container<CHILDCONTAINER extends Container>(
  container: WidgetContainer<CHILDCONTAINER['_Root']>,
  ChildContainerClass: new () => CHILDCONTAINER,
  model_param: CHILDCONTAINER['_ModelParam']
): ContainerComponent<CHILDCONTAINER> {
  let [component, child, child_kelm] = create_widget(ChildContainerClass, model_param)
  let child_container = child.container()
  let root = child.root()
  container.add(root)
  child.on_add(child_kelm, container)
  init_component(component.stream(), child, child_kelm)
  return new ContainerComponent<CHILDCONTAINER>(component, child_container)
}

export function add_widget<CHILDWIDGET extends Widget>(
  container: CHILDWIDGET['_Parent'],
  ChildWidgetClass: new () => CHILDWIDGET,
  model_param: CHILDWIDGET['_ModelParam']
): Component<CHILDWIDGET> {
  let [component, child, child_kelm] = create_widget(ChildWidgetClass, model_param)
  let widget = component.widget()
  container.add(widget)
  child.on_add(child_kelm, container)
  init_component(component.stream(), child, child_kelm)
  return component
}
