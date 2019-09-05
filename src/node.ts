import konva from 'konva'
import { Component } from './component'
import { Container, ContainerComponent, WidgetContainer } from './container'
import { create_widget } from './helpers'
import { init_component } from './state'
import { NodeEventMap, Widget } from './widget'

declare global {
  interface EventTarget {
    _event_listeners: { [index: string]: Array<{ name: string; handler: EventListener }> }
    on<K extends keyof NodeEventMap>(evt_str: K, handler: NodeEventMap[K]): void
    off(evt_str: string, callback?: Function): void
    _off(evt_type: string, name?: string, callback?: Function): void
    fire(evt_type: string, detail: any, bubbles?: boolean): void
  }

  interface Node {
    add(node: Node | konva.Stage): any
    add_widget<CHILDWIDGET extends Widget>(
      this: CHILDWIDGET['_Parent'],
      ChildWidgetClass: new () => CHILDWIDGET,
      model_param: CHILDWIDGET['_ModelParam']
    ): Component<CHILDWIDGET>
    add_container<CONTAINER extends Container>(
      this: WidgetContainer<CONTAINER['_Root']>,
      ContainerClass: new () => CONTAINER,
      model_param: CONTAINER['_ModelParam']
    ): ContainerComponent<CONTAINER>
    remove(): void
    replace_with_widget<CHILDWIDGET extends Widget>(
      this: CHILDWIDGET['_Parent'],
      ChildWidgetClass: new () => CHILDWIDGET,
      model_param: CHILDWIDGET['_ModelParam']
    ): Component<CHILDWIDGET>
    replace_with_container<CONTAINER extends Container>(
      this: WidgetContainer<CONTAINER['_Root']>,
      ContainerClass: new () => CONTAINER,
      model_param: CONTAINER['_ModelParam']
    ): ContainerComponent<CONTAINER>
  }
}

EventTarget.prototype._event_listeners = {}
EventTarget.prototype.on = function<K extends keyof NodeEventMap>(
  this: EventTarget,
  evt_str: K,
  handler: NodeEventMap[K]
) {
  let events = (evt_str as string).split(' '),
    len = events.length,
    n,
    event,
    parts,
    base_event,
    name

  // loop through types and attach event listeners to each one. eg. 'click mouseover.namespace
  // mouseout' will create three event bindings
  for (n = 0; n < len; n++) {
    event = events[n]
    parts = event.split('.')
    base_event = parts[0]
    name = parts[1] || ''

    // create events array if it doesn't exist
    if (!this._event_listeners[base_event]) {
      this._event_listeners[base_event] = []
    }

    this.addEventListener(base_event, handler)
    this._event_listeners[base_event].push({ name, handler: handler })
  }
}
EventTarget.prototype.off = function(this: EventTarget, evt_str: string, callback?: Function) {
  let events = (evt_str as string).split(' '),
    len = events.length,
    n,
    t,
    event,
    parts,
    base_event,
    name

  if (!evt_str) {
    // remove all events
    for (t in this._event_listeners) {
      this._off(t)
    }
  }
  for (let n = 0; n < len; n++) {
    event = events[n]
    parts = event.split('.')
    base_event = parts[0]
    name = parts[1]

    if (base_event) {
      if (this._event_listeners[base_event]) {
        this._off(base_event, name, callback)
      }
    } else {
      for (t in this._event_listeners) {
        this._off(t, name, callback)
      }
    }
  }
}

EventTarget.prototype._off = function(
  this: EventTarget,
  evt_type: string,
  name?: string,
  callback?: Function
) {
  let evt_listeners = this._event_listeners[evt_type],
    i,
    evt_name,
    handler

  for (i = 0; i < evt_listeners.length; i++) {
    evt_name = evt_listeners[i].name
    handler = evt_listeners[i].handler
    if ((!name || evt_name === name) && (!callback || callback === handler)) {
      this.removeEventListener(evt_type, handler)
      evt_listeners.splice(i, 1)
      if (evt_listeners.length === 0) {
        delete this._event_listeners[evt_type]
        break
      }
      i--
    }
  }
}

EventTarget.prototype.fire = function(
  this: EventTarget,
  evt_type: string,
  detail: any,
  bubbles?: boolean
): EventTarget {
  let evt = new CustomEvent(evt_type, { bubbles, detail })
  this.dispatchEvent(evt)
  return this
}

function add(this: Node, node: Node): Node
function add(this: Node, node: konva.Stage): konva.Stage
function add(this: Node, node: any): any {
  if (node instanceof Node) {
    return this.appendChild(node)
  } else {
    if (this instanceof HTMLDivElement) {
      return node.container(this)
    } else {
      throw new Error("Konva.Stage can only be added to a 'div' element")
    }
  }
}

Node.prototype.add = add

Node.prototype.remove = function(this: Node): Node {
  let parent = this.parentNode
  if (parent) {
    parent.removeChild(this)
  }
  return this
}

Node.prototype.add_container = function<CHILDCONTAINER extends Container>(
  this: WidgetContainer<CHILDCONTAINER['_Root']>,
  ChildContainerClass: new () => CHILDCONTAINER,
  model_param: CHILDCONTAINER['_ModelParam']
): ContainerComponent<CHILDCONTAINER> {
  let [component, child, child_kelm] = create_widget(ChildContainerClass, model_param)
  let container = child.container()
  let root = child.root()
  this.add(root)
  child.on_add(child_kelm, this)
  init_component(component.stream(), child, child_kelm)
  return new ContainerComponent<CHILDCONTAINER>(component, container)
}

Node.prototype.add_widget = function<CHILDWIDGET extends Widget>(
  this: CHILDWIDGET['_Parent'],
  ChildWidgetClass: new () => CHILDWIDGET,
  model_param: CHILDWIDGET['_ModelParam']
): Component<CHILDWIDGET> {
  let [component, child, child_kelm] = create_widget(ChildWidgetClass, model_param)
  let root = child.root()
  this.add(root)
  child.on_add(child_kelm, this)
  init_component(component.stream(), child, child_kelm)
  return component
}

Node.prototype.replace_with_container = function<CHILDCONTAINER extends Container>(
  ChildContainerClass: new () => CHILDCONTAINER,
  model_param: CHILDCONTAINER['_ModelParam']
): ContainerComponent<CHILDCONTAINER> {
  let [component, child, child_kelm] = create_widget(ChildContainerClass, model_param)
  let container = child.container()
  let root = child.root()
  if (!(root instanceof Node)) {
    throw new Error("ChildContainer Root is not assignable to type 'Node'")
  }
  let parent = this.parentNode
  if (!parent) {
    throw new Error('Node must have a parent Node')
  }
  parent.insertBefore(root, this)
  child.on_add(child_kelm, parent)
  init_component(component.stream(), child, child_kelm)
  parent.removeChild(this)
  return new ContainerComponent<CHILDCONTAINER>(component, container)
}

Node.prototype.replace_with_widget = function<CHILDWIDGET extends Widget>(
  ChildWidgetClass: new () => CHILDWIDGET,
  model_param: CHILDWIDGET['_ModelParam']
): Component<CHILDWIDGET> {
  let [component, child, child_kelm] = create_widget(ChildWidgetClass, model_param)
  let root = child.root()
  if (!((root as any) instanceof Node)) {
    throw new Error("ChildWidget Root is not assignable to type 'Node'")
  }
  let parent = this.parentNode
  if (!parent) {
    throw new Error('Node must have a parent Node')
  }
  parent.insertBefore(root, this)
  child.on_add(child_kelm, parent)
  init_component(component.stream(), child, child_kelm)
  parent.removeChild(this)
  return component
}
