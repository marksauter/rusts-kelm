import { EventStream } from "./core";
import { abstract_panic } from "@rusts/std";

export class Kelm<Msg> {
  private _stream: EventStream<Msg>;

  public constructor(stream: EventStream<Msg>) {
    this._stream = stream;
  }

  public emit(msg: Msg) {
    this._stream.emit(msg);
  }

  public stream(): EventStream<Msg> {
    return this._stream;
  }
}

export class Update<M = any, P = any, G = any> {
  public Model!: M;
  public Param!: P;
  public Msg!: G;

  public state: this["Model"];

  protected constructor(kelm: Kelm<G>, param: P) {
    this.state = this.model(kelm, param);
  }

  // Create the initial model.
  public model(kelm: Kelm<this["Msg"]>, param: this["Param"]): this["Model"] {
    abstract_panic("Update", "model");
    // Unreachable
    return (undefined as unknown) as this["Model"];
  }

  // Connect the subscriptions.
  // Subscriptions are streams that are spawned wen the object is created.
  public subscriptions(kelm: Kelm<this["Msg"]>): void {}

  // Method called when a msg is received from an event.
  public update(kelm: Kelm<this["Msg"]>, msg: this["Msg"]) {
    abstract_panic("Update", "update");
  }
}

export interface UpdateConstructor<U extends Update> {
  new (kelm: Kelm<U["Msg"]>, param: U["Param"]): U;
}

export function execute<U extends Update>(
  UpdateClass: UpdateConstructor<U>,
  model_param: U["Param"]
): EventStream<U["Msg"]> {
  let stream: EventStream<U["Msg"]> = new EventStream();
  let kelm = new Kelm(stream);
  let update = new UpdateClass(kelm, model_param);

  init_component(stream, update, kelm);
  return stream;
}

export function init_component<U extends Update>(
  stream: EventStream<U["Msg"]>,
  component: U,
  kelm: Kelm<U["Msg"]>
) {
  component.subscriptions(kelm);
  stream.set_callback(event => {
    update_component(component, kelm, event);
  });
}

export function update_component<U extends Update>(
  component: U,
  kelm: Kelm<U["Msg"]>,
  event: U["Msg"]
) {
  component.update(kelm, event);
}
