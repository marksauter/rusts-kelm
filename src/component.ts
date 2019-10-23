import { EventStream } from "./core";
import { Widget } from "./widget";

export class Component<W extends Widget> {
  private _stream: EventStream<W["Msg"]>;
  private _widget: W["Root"];

  public constructor(stream: EventStream<W["Msg"]>, widget: W["Root"]) {
    this._stream = stream;
    this._widget = widget;
  }

  public emit(msg: W["Msg"]) {
    this._stream.emit(msg);
  }

  public stream(): EventStream<W["Msg"]> {
    return this._stream;
  }

  public root(): W["Root"] {
    return this._widget;
  }
}
