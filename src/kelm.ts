// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
import konva from 'konva'
import { EventStream } from './core'
import { init_component } from './state'
import { Component } from './component'
import { Container, ContainerComponent } from './container'
import { create_node } from './helpers'
import { Node } from './node'

export * from './core'
export * from './state'
export * from './component'
export * from './container'
export * from './helpers'
export * from './node'

export function init<NODE extends Node>(
  NodeClass: new () => NODE,
  model_param: NODE['_ModelParam']
): Component<NODE> {
  let [component, node, kelm] = create_node<NODE>(NodeClass, model_param)
  init_component(component.stream(), node, kelm)
  return component
}

export function run<NODE extends Node>(
  NodeClass: new () => NODE,
  model_param: NODE['_ModelParam']
) {
  let _component = init<NODE>(NodeClass, model_param)
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

export function add_container<CONTAINER extends Container>(
  konva_container: CONTAINER['_Root'] extends konva.Layer ? konva.Stage : konva.Layer | konva.Group,
  ContainerClass: new () => CONTAINER,
  model_param: CONTAINER['_ModelParam']
): ContainerComponent<CONTAINER> {
  let [component, child, child_kelm] = create_node(ContainerClass, model_param)
  let container = child.container()
  let root = child.root()
  konva_container.add(root)
  if (typeof child.on_add === 'function') {
    child.on_add(child_kelm, konva_container)
  }
  init_component(component.stream(), child, child_kelm)
  return new ContainerComponent(component, container)
}

export function add_node<CHILDNODE extends Node>(
  konva_container: CHILDNODE['_Root'] extends konva.Layer ? konva.Stage : konva.Layer | konva.Group,
  ChildNodeClass: new () => CHILDNODE,
  model_param: CHILDNODE['_ModelParam']
): Component<CHILDNODE> {
  let [component, child, child_kelm] = create_node(ChildNodeClass, model_param)
  konva_container.add(component.node())
  if (typeof child.on_add === 'function') {
    child.on_add(child_kelm, konva_container)
  }
  init_component(component.stream(), child, child_kelm)
  return component
}
