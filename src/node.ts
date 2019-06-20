import konva from 'konva'
import { Kelm, Update } from './state'

export interface Node<MODEL = any, MODELPARAM = any, MSG = any, ROOT = any>
  extends Update<MODEL, MODELPARAM, MSG> {
  _Update: Update<this['_Model'], this['_ModelParam'], this['_Msg']>
  _Root: ROOT

  // Method called when the node is added to its parent.
  on_add?(
    _kelm: Kelm<Update<this['_Model'], this['_ModelParam'], this['_Msg']>>,
    _parent: any
  ): void

  // Get the root layer of the view.
  root(): this['_Root']

  // Create the initial view.
  view(
    kelm: Kelm<Update<this['_Model'], this['_ModelParam'], this['_Msg']>>,
    model: this['_Model']
  ): void
}
