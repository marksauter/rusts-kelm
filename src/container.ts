import { EventStream } from './core'
import { Component } from './component'
import { create_node } from './helpers'
import { init_component } from './state'
import { Node } from './node'

export interface IContainer {
  add(child: any): void
}

export class ContainerComponent<
  NODE extends Container,
  CONTAINER extends Node<NODE['_Model'], NODE['_ModelParam'], NODE['_Msg'], NODE['_Root']> = NODE
> {
  private component: Component<CONTAINER>
  container: NODE['_Container']

  constructor(component: Component<CONTAINER>, container: NODE['_Container']) {
    this.component = component
    this.container = container
  }

  // // Add a node to a kelm container.
  add(node: any) {
    this.container.add(node)
  }

  // Add a kelm node to a kelm container.
  add_node<CHILDNODE extends Node>(
    ChildNodeClass: new () => CHILDNODE,
    model_param: CHILDNODE['_ModelParam']
  ): Component<CHILDNODE> {
    let [component, child, child_kelm] = create_node(ChildNodeClass, model_param)
    this.container.add(component.node())
    if (typeof child.on_add === 'function') {
      child.on_add(child_kelm, this.container)
    }
    init_component(component.stream(), child, child_kelm)
    return component
  }

  // Emit a message of the node stream.
  emit(msg: NODE['_Msg']) {
    this.stream().emit(msg)
  }

  // Get the event stream of the component.
  // This is used internally by the library.
  stream(): EventStream<NODE['_Msg']> {
    return this.component.stream()
  }

  // Get the node of the component.
  node(): NODE['_Root'] {
    return this.component.node()
  }
}

export abstract class Container<
  MODEL = any,
  MODELPARAM = any,
  MSG = any,
  CONTAINER extends IContainer = any
> extends Node<MODEL, MODELPARAM, MSG, CONTAINER> {
  _Container!: CONTAINER

  // Get the containing node, i.e. the node where the children will be added.
  abstract container(): this['_Container']
}
