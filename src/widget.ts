import konva from "konva";
import { abstract_panic } from "@rusts/std";
import { Kelm, Update } from "./state";

export type NodeEventMap = GlobalEventHandlersEventMap & {
  [index: string]: any;
};

export interface WidgetRoot {
  on<K extends keyof NodeEventMap>(evt_str: K, handler: Function): any;
  off(evt_str: string, callback?: Function): any;
}

export class Widget<
  Model = any,
  Param = any,
  Msg = any,
  Root = any,
  // Setting Parent to any because setting to WidgetContainer<Root> breaks
  // compatibility with Container Parent type, see Container for more details
  Parent = any
> extends Update<Model, Param, Msg> {
  public Root!: Root;
  public Parent!: Parent;

  protected constructor(kelm: Kelm<Msg>, param: Param) {
    super(kelm, param);
  }

  // Method called when the widget is added to its parent.
  public on_add(_kelm: Kelm<this["Msg"]>, _parent: this["Parent"]): void {}

  // Get the root Konva Widget of the view.
  public root(): this["Root"] {
    abstract_panic("Widget", "root");
    // Unreachable
    return (undefined as unknown) as this["Root"];
  }
}

export interface WidgetConstructor<W extends Widget> {
  new (kelm: Kelm<W["Msg"]>, param: W["Param"]): W;
}
