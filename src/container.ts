import { create_widget } from "./helpers";
import { Kelm, init_component } from "./state";
import { Component, Widget, WidgetConstructor, WidgetContainer } from "./widget";

export class Container<
  Model = any,
  Param = any,
  Msg = any,
  Child = any,
  Root extends WidgetContainer<Child> = WidgetContainer<Child>
> extends Widget<Model, Param, Msg, Root> {
  public Child!: Child;

  protected constructor(kelm: Kelm<Msg>, param: Param) {
    super(kelm, param);
  }

  // Get the containing widget, i.e. the widget where the children will be added.
  public container(): this["Root"] {
    return this.root();
  }

  // IntoComponent
  public IntoComp!: any;

  public into_component(kelm: Kelm<this["Msg"]>): this["IntoComp"] {
    return new ContainerComponent(kelm, this);
  }
}

export class ContainerComponent<R extends Container> extends Component<R> {
  public constructor(kelm: Kelm<R["Msg"]>, container: R) {
    super(kelm, container);
  }

  public add(child: R["Child"]) {
    this.root().add(child);
  }

  public add_widget<Model, Param, Msg, W extends Widget<Model, Param, Msg, R["Child"]>>(
    WidgetClass: WidgetConstructor<W>,
    model_param: W["Param"]
  ): W["IntoComp"] {
    let [component, child, child_kelm] = create_widget(WidgetClass, model_param);
    let root = component.root();
    this.add(root);
    child.on_add(child_kelm, this.root());
    init_component(component.stream(), child, child_kelm);
    return component;
  }
}
