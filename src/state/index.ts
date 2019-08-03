import { EventStream } from '../core'

export class Kelm<MSG> {
  private _stream: EventStream<MSG>

  constructor(stream: EventStream<MSG>) {
    this._stream = stream
  }

  stream(): EventStream<MSG> {
    return this._stream
  }
}

export abstract class Update<MODEL = any, MODELPARAM = any, MSG = any> {
  _Model!: MODEL
  _ModelParam!: MODELPARAM
  _Msg!: MSG

  // Create the initial model.
  abstract model(kelm: Kelm<this['_Msg']>, param?: this['_ModelParam']): this['_Model']

  // Connect the subscriptions.
  // Subscriptions are streams that are spawned wen the object is created.
  subscriptions(kelm: Kelm<this['_Msg']>): void {}

  // Method called when a msg is received from an event.
  abstract update(kelm: Kelm<this['_Msg']>, msg: this['_Msg']): void
}

export abstract class UpdateNew<MODEL = any, MODELPARAM = any, MSG = any> extends Update<
  MODEL,
  MODELPARAM,
  MSG
> {
  // Create a new component.
  abstract init(kelm: Kelm<this['_Msg']>, model: this['_Model']): void
}

export function execute<UPDATE extends UpdateNew>(
  UpdateClass: new () => UPDATE,
  model_param: UPDATE['_ModelParam']
): EventStream<UPDATE['_Msg']> {
  let update = new UpdateClass()
  let stream: EventStream<UPDATE['_Msg']> = new EventStream()

  let kelm = new Kelm(stream)
  let model = update.model(kelm, model_param)
  update.init(kelm, model)

  init_component(stream, update, kelm)
  return stream
}

export function init_component<COMPONENT extends Update>(
  stream: EventStream<COMPONENT['_Msg']>,
  component: COMPONENT,
  kelm: Kelm<COMPONENT['_Msg']>
) {
  if (typeof component.subscriptions === 'function') {
    component.subscriptions(kelm)
  }
  stream.set_callback(event => update_component(component, kelm, event))
}

export function update_component<COMPONENT extends Update>(
  component: COMPONENT,
  kelm: Kelm<COMPONENT['_Msg']>,
  event: COMPONENT['_Msg']
) {
  component.update(kelm, event)
}
