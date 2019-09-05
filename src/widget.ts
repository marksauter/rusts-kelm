import konva from 'konva'
import { Kelm, Update, UpdateBase } from './state'

export type NodeEventMap = GlobalEventHandlersEventMap & {
  [index: string]: any
}

export interface WidgetRoot {
  on<K extends keyof NodeEventMap>(evt_str: K, handler: Function): any
  off(evt_str: string, callback?: Function): any
}

export abstract class Widget<
  MODEL = any,
  MODELPARAM = any,
  MSG = any,
  ROOT = any,
  // Setting PARENT to any because setting to WidgetContainer<ROOT> breaks
  // compatibility with Container PARENT type, see Container for more details
  PARENT = any
> extends Update<MODEL, MODELPARAM, MSG> {
  _Root!: ROOT
  _Parent!: PARENT

  // Method called when the widget is added to its parent.
  on_add(_kelm: Kelm<this['_Msg']>, _parent: this['_Parent']): void {}

  // Get the root Konva Widget of the view.
  abstract root(): this['_Root']

  // Create the initial view.
  abstract view(kelm: Kelm<this['_Msg']>, model: this['_Model']): void
}

export abstract class WidgetBase<
  MODEL = any,
  MODELPARAM = any,
  MSG = any,
  ROOT = any,
  // Setting PARENT to any because setting to WidgetContainer<ROOT> breaks
  // compatibility with Container PARENT type, see Container for more details
  PARENT = any
> extends UpdateBase<MODEL, MODELPARAM, MSG> {
  _Root!: ROOT
  _Parent!: PARENT

  // Method called when the widget is added to its parent.
  on_add<MSG extends this['_Msg'], WIDGET extends this['_Model']>(
    _self: WIDGET,
    _kelm: Kelm<MSG>,
    _parent: this['_Parent']
  ): void {}

  // Get the root of the view.
  abstract root(): this['_Root']

  // Create the initial view.
  abstract view<MSG extends this['_Msg'], WIDGET extends this['_Model']>(
    self: WIDGET,
    kelm: Kelm<MSG>,
    model: this['_Model']
  ): void
}

export function init_component_widget_base<WIDGET extends Widget, WIDGETBASE extends WidgetBase>(
  widget: WIDGET,
  base: WIDGETBASE
) {
  let widget_on_add = widget.on_add
  widget.on_add = (...args: Parameters<typeof widget.on_add>) => {
    widget_on_add(...args)
    base.on_add(widget, ...args)
  }
}
