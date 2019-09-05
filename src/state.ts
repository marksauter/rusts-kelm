import { EventStream } from './core'

export class Kelm<MSG> {
  private _stream: EventStream<MSG>

  constructor(stream: EventStream<MSG>) {
    this._stream = stream
  }

  emit(msg: MSG) {
    this._stream.emit(msg)
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
  abstract update(kelm: Kelm<this['_Msg']>, msg: this['_Msg']): boolean
}

export abstract class UpdateNew<MODEL = any, MODELPARAM = any, MSG = any> extends Update<
  MODEL,
  MODELPARAM,
  MSG
> {
  // Create a new component.
  abstract init(kelm: Kelm<this['_Msg']>, model: this['_Model']): void
}

export abstract class UpdateBase<MODEL = any, MODELPARAM = any, MSG = any> {
  _Model!: MODEL
  _ModelParam!: MODELPARAM
  _Msg!: MSG

  // Create the initial model.
  abstract model<MSG extends this['_Msg']>(
    kelm: Kelm<MSG>,
    param?: this['_ModelParam']
  ): this['_Model']

  // Connect the subscriptions.
  // Subscriptions are streams that are spawned wen the object is created.
  subscriptions<UPDATE extends this['_Model'], MSG extends this['_Msg']>(
    self: UPDATE,
    kelm: Kelm<MSG>
  ): void {}

  // Method called when a msg is received from an event.
  abstract update<UPDATE extends this['_Model'], MSG extends this['_Msg']>(
    self: UPDATE,
    kelm: Kelm<MSG>,
    msg: this['_Msg']
  ): boolean
}

export abstract class UpdateBaseNew<MODEL = any, MODELPARAM = any, MSG = any> extends UpdateBase<
  MODEL,
  MODELPARAM,
  MSG
> {
  // Create a new component.
  abstract init<UPDATE extends this['_Model'], MSG extends this['_Msg']>(
    self: UPDATE,
    kelm: Kelm<this['_Msg']>,
    model: this['_Model']
  ): void
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

export function execute_base<UPDATE extends Update, UPDATEBASE extends UpdateBaseNew>(
  update: UPDATE,
  kelm: Kelm<UPDATE['_Msg']>,
  UpdateBaseClass: new () => UPDATEBASE,
  model_param: UPDATEBASE['_ModelParam']
) {
  let base = new UpdateBaseClass()

  let model = base.model(kelm, model_param)
  base.init(update, kelm, model)

  init_component_base(kelm.stream(), update, base, kelm)
}

export function init_component<COMPONENT extends Update>(
  stream: EventStream<COMPONENT['_Msg']>,
  component: COMPONENT,
  kelm: Kelm<COMPONENT['_Msg']>
) {
  component.subscriptions(kelm)
  let callback = stream.get_callback()
  stream.set_callback(event => {
    let ret = update_component(component, kelm, event)
    if (!ret && callback) {
      return callback(event)
    }
  })
}

export function init_component_base<COMPONENT extends Update, COMPONENTBASE extends UpdateBase>(
  stream: EventStream<COMPONENT['_Msg']>,
  component: COMPONENT,
  base: COMPONENTBASE,
  kelm: Kelm<COMPONENT['_Msg']>
) {
  base.subscriptions(component, kelm)
  let callback = stream.get_callback()
  stream.set_callback(event => {
    let ret = update_component_base(component, base, kelm, event)
    if (!ret && callback) {
      return callback(event)
    }
  })
}

export function update_component<COMPONENT extends Update>(
  component: COMPONENT,
  kelm: Kelm<COMPONENT['_Msg']>,
  event: COMPONENT['_Msg']
): boolean {
  return component.update(kelm, event)
}

export function update_component_base<COMPONENT extends Update, COMPONENTBASE extends UpdateBase>(
  component: COMPONENT,
  base: COMPONENTBASE,
  kelm: Kelm<COMPONENT['_Msg']>,
  event: COMPONENT['_Msg']
): boolean {
  return base.update(component, kelm, event)
}
