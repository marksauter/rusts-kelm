import { abstract_panic } from "@rusts/std";
import { EventStream } from "./core";
import { Kelm, Update } from "./state";

export type NodeEventMap = GlobalEventHandlersEventMap & {
  [index: string]: any;
};

export interface WidgetRoot {
  on<K extends keyof NodeEventMap>(evt_str: K, handler: Function): any;
  off(evt_str: string, callback?: Function): any;
}

export interface WidgetContainer<Child = any> extends WidgetRoot {
  add(child: Child): any;
}

export class Widget<Model = any, Param = any, Msg = any, Root = any> extends Update<
  Model,
  Param,
  Msg
> {
  public Root!: Root;

  protected constructor(kelm: Kelm<Msg>, param: Param) {
    super(kelm, param);
  }

  // Method called when the widget is added to its parent.
  public on_add(_kelm: Kelm<this["Msg"]>, _parent: any) {}

  // Get the root Konva Widget of the view.
  public root(): this["Root"] {
    abstract_panic("Widget", "root");
    // Unreachable
    return (undefined as unknown) as this["Root"];
  }

  // IntoComponent
  public IntoComp!: any;

  public into_component(kelm: Kelm<this["Msg"]>): this["IntoComp"] {
    return new Component(kelm, this);
  }
}

export interface WidgetConstructor<W extends Widget> {
  new (kelm: Kelm<W["Msg"]>, param: W["Param"]): W;
}

export class Component<W extends Widget> {
  protected _kelm: Kelm<W["Msg"]>;
  protected _widget: W;

  public constructor(kelm: Kelm<W["Msg"]>, widget: W) {
    this._kelm = kelm;
    this._widget = widget;
  }

  public emit(msg: W["Msg"]) {
    this._kelm.emit(msg);
  }

  public stream(): EventStream<W["Msg"]> {
    return this._kelm.stream();
  }

  public root(): W["Root"] {
    return this._widget.root();
  }
}

export interface IntoComponent<
  W extends Widget = Widget,
  IntoComp extends Component<W> = Component<W>
> {
  // Which kind of component are we turning this into?
  IntoComp: IntoComp;

  // Creates a component from a value.
  into_component(kelm: Kelm<W["Msg"]>): this["IntoComp"];
}
