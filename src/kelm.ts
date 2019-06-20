// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
import konva from 'konva'
import flyd from 'flyd'
import { init_component } from './state'
import { Component } from './component'
import { Container, ContainerComponent } from './container'
import { create_node } from './helpers'
import { Node } from './node'

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

export function interval<MSG>(stream: flyd.Stream<MSG>, duration: number, constructor: () => MSG) {
  setInterval(() => {
    let msg = constructor()
    stream(msg)
  }, duration)
}

export function timeout<MSG>(stream: flyd.Stream<MSG>, duration: number, constructor: () => MSG) {
  setTimeout(() => {
    let msg = constructor()
    stream(msg)
  }, duration)
}

export function add_layer<LAYER extends Container<any, any, any, konva.Layer>>(
  stage: konva.Stage,
  LayerClass: new () => LAYER,
  model_param: LAYER['_ModelParam']
): ContainerComponent<LAYER> {
  let [component, layer, layer_kelm] = create_node(LayerClass, model_param)
  let container = layer.container()
  let root = layer.root()
  stage.add(root)
  if (typeof layer.on_add === 'function') {
    layer.on_add(layer_kelm, stage)
  }
  init_component(component.stream(), layer, layer_kelm)
  return new ContainerComponent(component, container)
}

export function add_node<CHILDNODE extends Node>(
  container: konva.Layer | konva.Group,
  ChildNodeClass: new () => CHILDNODE,
  model_param: CHILDNODE['_ModelParam']
): Component<CHILDNODE> {
  let [component, child, child_kelm] = create_node(ChildNodeClass, model_param)
  container.add(component.node())
  if (typeof child.on_add === 'function') {
    child.on_add(child_kelm, container)
  }
  init_component(component.stream(), child, child_kelm)
  return component
}
