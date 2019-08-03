import konva from 'konva'
import { Kelm, Update } from './state'

export type NodeEventMap = GlobalEventHandlersEventMap & {
  [index: string]: any
}

export interface INode {
  on<K extends keyof NodeEventMap>(
    evtStr: K,
    handler: konva.KonvaEventListener<this, NodeEventMap[K]>
  ): this
  off(evtStr: string, callback?: Function): this
}

export abstract class Node<MODEL = any, MODELPARAM = any, MSG = any, ROOT = any> extends Update<
  MODEL,
  MODELPARAM,
  MSG
> {
  _Root!: ROOT

  // Method called when the node is added to its parent.
  on_add(_kelm: Kelm<this['_Msg']>, _parent: any): void {}

  // Get the root layer of the view.
  abstract root(): this['_Root']

  // Create the initial view.
  abstract view(kelm: Kelm<this['_Msg']>, model: this['_Model']): void
}
