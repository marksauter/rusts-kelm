import flyd from 'flyd'

export class Kelm<
  UPDATE extends Update<MODEL, MODELPARAM, MSG>,
  MODEL = UPDATE['_Model'],
  MODELPARAM = UPDATE['_ModelParam'],
  MSG = UPDATE['_Msg']
> {
  private _stream: flyd.Stream<UPDATE['_Msg']>

  constructor(stream: flyd.Stream<UPDATE['_Msg']>) {
    this._stream = stream
  }

  stream(): flyd.Stream<UPDATE['_Msg']> {
    return this._stream
  }
}

export interface Update<MODEL = any, MODELPARAM = any, MSG = any> {
  _Model: MODEL
  _ModelParam: MODELPARAM
  _Msg: MSG

  // Create the initial model.
  model(
    kelm: Kelm<Update<this['_Model'], this['_ModelParam'], this['_Msg']>>,
    param?: this['_ModelParam']
  ): this['_Model']

  // Connect the subscriptions.
  // Subscriptions are streams that are spawned wen the object is created.
  subscriptions?(kelm: Kelm<Update<this['_Model'], this['_ModelParam'], this['_Msg']>>): void

  // Method called when an event is received from an event.
  update(msg: this['_Msg']): void
  // Return available messages that can be used to modify the model.
  // messages(update: flyd.flyd.Stream<PatchRequest<MODEL>>): MSG;
}

export interface UpdateNew<MODEL = any, MODELPARAM = any, MSG = any>
  extends Update<MODEL, MODELPARAM, MSG> {
  // Create a new component.
  new (
    kelm: Kelm<Update<this['_Model'], this['_ModelParam'], this['_Msg']>>,
    model: this['_Model']
  ): this
}

export function execute<UPDATE extends UpdateNew>(
  update: UPDATE,
  model_param: UPDATE['_ModelParam']
): flyd.Stream<UPDATE['_Msg']> {
  let stream: flyd.Stream<UPDATE['_Msg']> = flyd.stream()

  let kelm = new Kelm<Update<UPDATE['_Model'], UPDATE['_ModelParam'], UPDATE['_Msg']>>(stream)
  let model = update.model(kelm, model_param)
  let component = new update(kelm, model)

  init_component(stream, component, kelm)
  return stream
}

export function init_component<UPDATE extends Update>(
  stream: flyd.Stream<UPDATE['_Msg']>,
  component: UPDATE,
  kelm: Kelm<Update<UPDATE['_Model'], UPDATE['_ModelParam'], UPDATE['_Msg']>>
) {
  if (typeof component.subscriptions === 'function') {
    component.subscriptions(kelm)
  }
  flyd.chain(event => flyd.stream(update_component(component, event)), stream)
}

export function update_component<COMPONENT extends Update>(
  component: COMPONENT,
  event: COMPONENT['_Msg']
) {
  component.update(event)
}
