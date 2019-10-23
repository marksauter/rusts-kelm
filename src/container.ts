import konva from "konva";
import { abstract_panic } from "@rusts/std";
import { EventStream } from "./core";
import { Component } from "./component";
import { create_widget } from "./helpers";
import { Kelm, init_component } from "./state";
import { Widget, WidgetConstructor, WidgetRoot } from "./widget";

export interface WidgetContainer<Child> extends WidgetRoot {
  add(child: Child): any;
}

export class Container<
  Model = any,
  Param = any,
  Msg = any,
  Child = any,
  Container extends WidgetContainer<Child> = WidgetContainer<Child>,
  // Setting Parent to any because setting to WidgetContainer<Container> doesn't
  // satisfy all possible types (e.g. WidgetContainer<Container | Child>. Therefore,
  // there's no way to have a sensible default for this type
  Parent = any
> extends Widget<Model, Param, Msg, Container, Parent> {
  public Container!: Container;
  public Child!: Child;

  protected constructor(kelm: Kelm<Msg>, param: Param) {
    super(kelm, param);
  }

  // Get the containing widget, i.e. the widget where the children will be added.
  public container(): this["Container"] {
    abstract_panic("Container", "container");
    // Unreachable
    return (undefined as unknown) as this["Container"];
  }
}

export interface ContainerConstructor<R extends Container> {
  new (kelm: Kelm<R["Msg"]>, param: R["Param"]): R;
}

export class ContainerComponent<
  R extends Container,
  W extends Widget<R["Model"], R["Param"], R["Msg"], R["Root"], R["Parent"]> = R
> {
  private component: Component<W>;
  public container: R["Container"];
  public add: R["Container"]["add"];

  public constructor(component: Component<W>, container: R["Container"]) {
    // Add a method to add a node to the kelm container.
    this.add = (child: R["Child"]) => container.add(child);

    this.component = component;
    this.container = container;
  }

  public add_widget<
    Model,
    Param,
    Msg,
    Root extends R["Child"],
    W extends Widget<Model, Param, Msg, Root, R["Container"]>
  >(WidgetClass: WidgetConstructor<W>, model_param: W["Param"]): Component<W> {
    let [component, child, child_kelm] = create_widget(WidgetClass, model_param);
    let root = component.root();
    this.add(root);
    child.on_add(child_kelm, this.container);
    init_component(component.stream(), child, child_kelm);
    return component;
  }

  // Emit a message of the widget stream.
  public emit(msg: R["Msg"]) {
    this.stream().emit(msg);
  }

  // Get the event stream of the component.
  // This is used internally by the library.
  public stream(): EventStream<R["Msg"]> {
    return this.component.stream();
  }

  // Get the root of the component.
  public root(): R["Root"] {
    return this.component.root();
  }
}
