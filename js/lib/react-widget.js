import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import { camelCase, snakeCase } from 'lodash';
import { 
    DOMWidgetModel, DOMWidgetView, unpack_models, ViewList
} from '@jupyter-widgets/base';
/*
import {
    MessageLoop, Message
} from '@phosphor/messaging';
*/
import {
    Widget, Panel
} from '@phosphor/widgets';


export
    class ReactModel extends DOMWidgetModel {
    // defaults: _.extend(DOMWidgetModel.prototype.defaults(), {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'ReactModel',
            _view_name: 'ReactView',
            _model_module: 'ipyantd',
            _view_module: 'ipyantd',
            _model_module_version: '0.1.0',
            _view_module_version: '0.1.0',
        })
    }
    autoProps = []
    reactComponent = () => Dummy
    getProps = () => { 
        return { model: this, ...this.genProps() } 
    }
    genProps(props) {
        
        console.log("--- genProps(props) ---")
        console.log("props:", props)
        console.log("this.props:", this.props)
        
        let newProps = {};
        if (props) {
            newProps = { ...props };
        }
        
        if (this.props) {
            this.props.forEach((key, idx) => {
                if (!(key in this.autoProps)) {
                    console.warn('Property \"', key, '\" found in (React) props, but not marked as widget property');
                }
            })
        }
        
        const autoProps = ['style', 'className', ...this.autoProps]
        autoProps.forEach((key, idx) => {
            let attribute_key = snakeCase(key);
            console.log("  > ", idx, key, attribute_key)
            
            if (props && key in props) { // sync back to backbone/widget
                console.log("this.set(attribute_key, props[key])")
                this.set(attribute_key, props[key])
            }
            newProps[key] = this.get(attribute_key)
            
            if (newProps[key] && this.widgetProps && this.widgetProps.indexOf(key) !== -1) {
                console.log("newProps[key] = newProps[key].createWrappedReactElement()")
                newProps[key] = newProps[key].createWrappedReactElement()
            }
        })
        console.log(newProps)
        return newProps
    }
    createWrappedReactElement(props) {
        // let comp = this.createReactComponent(props);
        // let usedProps = comp.props;
        // return <BackboneWrapper model={this} {...usedProps}></BackboneWrapper>
        return this.createReactElement(props)
    }
    createReactElement(baseProps) {
        // return React.createElement("h1", {}, "Just an empty React component view")
        let props = { ...this.getProps(), ...baseProps }
        return React.createElement(this.reactComponent(), props, ...this.getChildren())
    }
    getChildren() {
        let children = [];
        // if(this.get('icon'))
        //     children.push(this.getChildWidgetComponent('icon'))
        if (this.get('description')) {
            children.push(this.get('description'))
        }
        if (this.get('content')) {
            children.push(this.get('content'))
        }
        if (this.get('child')) {
            children.push(this.get('child').createWrappedReactElement())
        }
        if (this.get('children')) {
            children = children.concat(...this.getChildWidgetComponentList('children'))
        }
        return children;
    }
    comp(name) {
        return this.getChildWidgetComponent(name)
    }
    getChildWidgetComponent(name) {
        let widget = this.get(name);
        if (!widget) {
            console.log('Null widget, do nothing')
            return null;
        } else if (widget instanceof ReactModel) {
            console.log('React widget')
            return widget.createWrappedReactElement()
        } else {
            console.log('Not React widget, using BlackboxWidget')
            return <BlackboxWidget widget={widget}></BlackboxWidget>
        }
    }
    getChildWidgetComponentList(name) {
        let widgetList = this.get(name);
        return widgetList.map((widget) => {
            if (widget instanceof ReactModel) {
                console.log('React widget')
                return widget.createWrappedReactElement({ key: widget.cid })
            } else {
                console.log('Not React widget, using BlackboxWidget')
                return <BlackboxWidget widget={widget}></BlackboxWidget>
            }
        });
    }
}

ReactModel.serializers = {
    ...DOMWidgetModel.serializers,
    children: { deserialize: unpack_models },
    child: { deserialize: unpack_models },
    // icon: {deserialize: unpack_models},
    value: { deserialize: unpack_models },
    control: { deserialize: unpack_models },
    extra: { deserialize: unpack_models }
};

export
class ReactView extends DOMWidgetView {

    initialize(parameters) {
        super.initialize(parameters);
    }

    render() {
        console.log('ReactView > render')
        
        super.render();

        // Wrap element
        const root_element = document.createElement("div")
        
        // React render
        const react_element = this.model.createWrappedReactElement({})
        console.log(react_element)
        ReactDOM.render(react_element, root_element)

        // Append to Backbone.View
        this.el.appendChild(root_element)
    }

}

// this is a black box for React, but renders a plain Jupyter DOMWidget
class BlackboxWidget extends React.Component {

    componentDidMount() {
        console.log('BlackboxWidget > componentDidMount')
        let widget = this.props.widget;
        let manager = widget.widget_manager;
        console.log('widget', widget)
        manager.create_view(widget).then((view) => {
            console.log(view)
            this.view = view;

            //MessageLoop.sendMessage(view, Widget.Msg.BeforeAttach);
            try {
                view.pWidget.processMessage(Widget.Msg.BeforeAttach);
            } catch (e) {
                console.log(e);
                view.processPhosphorMessage(Widget.Msg.BeforeAttach);
            }
            
            this.el.appendChild(this.view.el);

            //MessageLoop.sendMessage(view, Widget.Msg.AfterAttach);
            try {
                view.pWidget.processMessage(Widget.Msg.AfterAttach);
            } catch (e) {
                console.log(e);
                view.processPhosphorMessage(Widget.Msg.AfterAttach);
            }
            
        });
    }

    componentWillUnmount() {
        console.log('BlackboxWidget > componentWillUnmount')
        // TODO: destroy the view?
    }

    render() {
        console.log('BlackboxWidget > render')
        return <div ref={el => this.el = el} />;
    }
}


