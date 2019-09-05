import konva from 'konva'
import { EventStream } from './core'
import { Component } from './component'
import { create_widget } from './helpers'
import { init_component } from './state'
import { Widget, WidgetBase, WidgetRoot } from './widget'

export interface WidgetContainer<CHILD> extends WidgetRoot {
  add(child: CHILD): any
}

export abstract class Container<
  MODEL = any,
  MODELPARAM = any,
  MSG = any,
  CHILD = any,
  CONTAINER extends WidgetContainer<CHILD> = WidgetContainer<CHILD>,
  // Setting PARENT to any because setting to WidgetContainer<CONTAINER> doesn't
  // satisfy all possible types (e.g. WidgetContainer<CONTAINER | CHILD>. Therefore,
  // there's no way to have a sensible default for this type
  PARENT = any
> extends Widget<MODEL, MODELPARAM, MSG, CONTAINER, PARENT> {
  _Container!: CONTAINER
  _Child!: CHILD

  // Get the containing widget, i.e. the widget where the children will be added.
  abstract container(): this['_Container']
}

export abstract class ContainerBase<
  MODEL = any,
  MODELPARAM = any,
  MSG = any,
  CHILD = any,
  CONTAINER extends WidgetContainer<CHILD> = WidgetContainer<CHILD>,
  // Setting PARENT to any because setting to WidgetContainer<CONTAINER> doesn't
  // satisfy all possible types (e.g. WidgetContainer<CONTAINER | CHILD>. Therefore,
  // there's no way to have a sensible default for this type
  PARENT = any
> extends WidgetBase<MODEL, MODELPARAM, MSG, CONTAINER, PARENT> {
  _Container!: CONTAINER
  _Child!: CHILD

  // Get the containing widget, i.e. the widget where the children will be added.
  abstract container(): this['_Container']
}

export class ContainerComponent<
  CONTAINER extends Container,
  WIDGET extends Widget<
    CONTAINER['_Model'],
    CONTAINER['_ModelParam'],
    CONTAINER['_Msg'],
    CONTAINER['_Root'],
    CONTAINER['_Parent']
  > = CONTAINER
> {
  private component: Component<WIDGET>
  container: CONTAINER['_Container']
  add: CONTAINER['_Container']['add']

  constructor(component: Component<WIDGET>, container: CONTAINER['_Container']) {
    // Add a method to add a node to the kelm container.
    this.add = (child: CONTAINER['_Child']) => container.add(child)

    this.component = component
    this.container = container
  }

  add_widget<
    MODEL,
    MODELPARAM,
    MSG,
    ROOT extends CONTAINER['_Child'],
    CHILDWIDGET extends Widget<MODEL, MODELPARAM, MSG, ROOT, CONTAINER['_Container']>
  >(
    ChildWidgetClass: new () => CHILDWIDGET,
    model_param: CHILDWIDGET['_ModelParam']
  ): Component<CHILDWIDGET> {
    let [component, child, child_kelm] = create_widget(ChildWidgetClass, model_param)
    let root = component.root()
    this.add(root)
    child.on_add(child_kelm, this.container)
    init_component(component.stream(), child, child_kelm)
    return component
  }

  // Emit a message of the widget stream.
  emit(msg: CONTAINER['_Msg']) {
    this.stream().emit(msg)
  }

  // Get the event stream of the component.
  // This is used internally by the library.
  stream(): EventStream<CONTAINER['_Msg']> {
    return this.component.stream()
  }

  // Get the root of the component.
  root(): CONTAINER['_Root'] {
    return this.component.root()
  }
}
