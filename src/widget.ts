import konva from 'konva'
import { Kelm, Update, UpdateBase } from './state'
import { WidgetContainer } from './container'

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
  PARENT extends WidgetContainer<ROOT> = WidgetContainer<ROOT>
> extends Update<MODEL, MODELPARAM, MSG> {
  _Root!: ROOT
  _Parent!: PARENT

  // Method called when the widget is added to its parent.
  on_add(_kelm: Kelm<this['_Msg']>, _parent: PARENT): void {}

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
  PARENT extends WidgetContainer<ROOT> = WidgetContainer<ROOT>
> extends UpdateBase<MODEL, MODELPARAM, MSG> {
  _Root!: ROOT
  _Parent!: PARENT

  // Method called when the widget is added to its parent.
  on_add<MSG extends this['_Msg']>(_kelm: Kelm<MSG>, _parent: PARENT): void {}

  // Get the root layer of the view.
  abstract root(): this['_Root']

  // Create the initial view.
  abstract view<MSG extends this['_Msg'], WIDGET extends this['_Model']>(
    self: WIDGET,
    kelm: Kelm<MSG>,
    model: this['_Model']
  ): void
}
