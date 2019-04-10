import * as React from 'react';
import moment from 'moment';
import { ReactModel } from './react-widget';
import 'antd/dist/antd.css';
import './styles/ipyantd.css';


class BackboneWidget extends React.Component {
    constructor(props) {
        super(props)
        this.model = props.model;
    }
    stateProps() {
        return { ...this.props, ...this.model.getProps(), children: this.model.getChildren() }
    }
    componentDidMount() {
        this.updateCallback = () => {
            this.forceUpdate()
        }
        this.props.model.on('change', this.updateCallback)
    }
    componentWillUnmount() {
        this.props.model.off('change', this.updateCallback)
    }
}

// using higher-order component pattern
function BasicWidget(Component, isVoid=false) {
    return class extends BackboneWidget {
        render() {
            let { model, ...props } = this.stateProps();
            if (isVoid) {
                console.log('isVoid');
                delete props.children
                return <Component {...props}/>
            } else {
                return <Component {...props}>{props.children}</Component>
            }
        }
    }
}

function RemoveNull(Component, attributes=[]) {
    return class extends BackboneWidget {
        render() {
            let { ...cleanProps } = this.props;
            attributes.forEach((attribute) => {
                if (cleanProps[attribute] === null) {
                    delete cleanProps[attribute]
                }
            })
            return <Component {...cleanProps}>{cleanProps.children}</Component>
        }
    }
}

function ClickHandler(Component) {
    return class extends BackboneWidget {
        onClickHandler = (event) => {
            this.props.model.send({ event: 'click' })
            if (this.props.onClick) {
                this.props.onClick(event)
            }
        }
        render() {
            return <Component {...this.props} onClick={this.onClickHandler}></Component>
        }
    }
}

function CheckedHandler(Component, attributeName = 'checked') {
    return class extends BackboneWidget {
        onChangeHandler = (event, value) => {
            console.log('onChangeHandler')
            console.log(event)
            if (event === true || event === false) {
                this.props.model.set(attributeName, event);
            } else {
                this.props.model.set(attributeName, event.target.checked);
            }
            this.props.model.save_changes()
            if (this.props.onChange) {
                this.props.onChange(event, value)
            }
        }
        render() {
            console.log('CheckedHandler')
            console.log(this.props)
            return <Component {...this.props} onChange={this.onChangeHandler}></Component>
        }
    }
}

function FixClickCapture(Component, attributeName = 'checked') {
    return class extends BackboneWidget {
        onClickHandler = (event, value) => {
            if (this.props.onClick) {
                this.props.onClick(event, value)
            }
        }
        onClickCaptureHandler = (event, value) => {
            if (this.props.clickFix) {
                event.stopPropagation()
            }
            // if(this.props.onClickCapture)
            //    this.props.onClickCapture(event, value)
        }
        render() {
            const { clickFix, ...props } = this.props;
            if (clickFix) {
                console.log('FixClickCapture AAA')
                console.log(props)
                return <div onClick={this.onClickHandler} onClickCapture={this.onClickCaptureHandler}><Component {...props} ></Component></div>
            } else {
                console.log('FixClickCapture BBB')
                console.log(props)
                return <Component {...props} ></Component>
            }
        }
    }
}

function ToggleHandler(Component, attributeName = 'selected') {
    return class extends BackboneWidget {
        onChangeHandler = (event, value) => {
            // only handle if the value is true/false
            // meaning None/null can be used for interal control
            if ((this.props.model.get(attributeName) === true) || (this.props.model.get(attributeName) === false)) {
                this.props.model.set(attributeName, !this.props.model.get(attributeName))
                this.props.model.save_changes();
            }
            if (this.props.onChange) {
                this.props.onChange(event, value)
            }
        }
        render() {
            return <Component {...this.props} onChange={this.onChangeHandler}></Component>
        }
    }
}

function ValueHandler(Component) {
    return class extends BackboneWidget {
        onChangeHandler = (event) => {
            // Sync: React -> Backbone Model -> Python
            let value = event.target === undefined ? event : event.target.value;
            this.props.model.set('value', value)
            this.props.model.save_changes()
            if (this.props.onChange) {
                this.props.onChange(event)
            }
        }
        render() {
            // Sync: Python -> Backbone Model -> React
            this.props.value = this.props.model.get('value')
            return <Component {...this.props} onChange={this.onChangeHandler}></Component>
        }
    }
}

function MomentValueHandler(Component) {
    return class extends BackboneWidget {
        onChangeHandler = (date, dateString) => {
            console.log('MomentValueHandler > onChangeHandler');
            if (Component === RangePicker) {
                this.props.model.set('start_time', dateString[0]);
                this.props.model.set('end_time', dateString[1]);
            } else if (Component === WeekPicker) {
                //this.props.value = date;
            } else {
                this.props.model.set('value', dateString);
            }
            this.props.model.save_changes();
            if (this.props.onChange) {
                console.log('MomentValueHandler > onChangeHandler > if (this.props.onChange)');
                this.props.onChange(date, dateString);
            }
        }
        render() {
            console.log('MomentValueHandler > render');
            console.log(this.props);
            if (Component === RangePicker) {
                this.props.value = [moment(this.props.model.get('start_time')), moment(this.props.model.get('end_time'))];
            } else if (Component === WeekPicker) {
                this.props.value = moment(this.props.model.get('value'), 'YYYY-wo');
            } else {
                this.props.value = moment(this.props.model.get('value'));
            }
            return <Component {...this.props} onChange={this.onChangeHandler}></Component>
        }
    }
}

function ToggleButtonGroupHandler(Component, attributeName = 'selected') {
    return class extends BackboneWidget {
        onChangeHandler = (event, value) => {
            if (value && value.props && value.props) {
                value = value.props.value; // sometimes values is the widget
            }
            this.props.model.set('value', value)
            this.props.model.save_changes()
            // MUI's ToggleButtonGroup's behaviour doesn't play well with how we do things
            // with the widgets. So we control the children ourselves
        }
        render() {
            let exclusive = this.props.model.get('exclusive')
            let value = this.props.model.get('value')
            let children = this.props.model.get('children') || [];
            children.forEach((child) => {
                if (child instanceof ToggleButtonModel) {
                    if (exclusive) {
                        child.set('selected', value === child.get('value'))
                    } else {
                        child.set('selected', value && value.indexOf(child.get('value')) !== -1)
                    }
                }
            })
            return <Component {...this.props} onChange={this.onChangeHandler}></Component>
        }
    }
}

import { Select } from 'antd';
const Option = Select.Option;

function SelectHandler(Component) {
    return class extends BackboneWidget {
        onChangeHandler = (value) => {
            console.log(`selected ${value}`);
            this.props.model.set('value', value);
            this.props.model.save_changes();
        }
        render() {
            console.log('SelectHandler > render', Component);

            let value = this.props.model.get('value');
            let options = this.props.model.get('options') || [];
            let mode = this.props.model.get('mode');
            let style = this.props.model.get('style');
            
            return (
                <Select
                    mode={mode}
                    style={style}
                    placeholder="Please select"
                    defaultValue={value}
                    onChange={this.onChangeHandler}
                >
                    {options.map(option => <Option key={option}>{option}</Option>)}
                </Select>
            );
        }
    }
}

function TransferHandler(Component) {
    return class extends BackboneWidget {
        onChangeHandler = (targetKeys, direction, moveKeys) => {
        }
        onSelectChangeHandler = (sourceSelectedKeys, targetSelectedKeys) => {
        }
        onScrollHandler = (direction, event) => {
        }
        onSearchHandler = (direction, value) => {
        }
        render() {          
            return (
                <Component {...this.props} render={item => item.title}/>
            );
        }
    }
}

function DrawerHandler(Component) {
    return class extends BackboneWidget {
        onCloseHandler = (event) => {
            // Change & Save status in `this.props.model`
            console.log('DrawerHandler > onCloseHandler', event);
            this.props.model.set('visible', false);
            this.props.model.save_changes();
        }
        render() {
            // Get status from `this.props.model` and then Render by `this.props`
            console.log('DrawerHandler > render', Component);
            this.props.visible = this.props.model.get('visible');            
            return (
                <Component {...this.props} onClose={this.onCloseHandler}></Component>
            );
        }
    }
}

const ClickWidget = (c) => ClickHandler(BasicWidget(c))
const CheckedWidget = (c) => CheckedHandler(ClickWidget(c))
const ValueWidget = (c) => ValueHandler(BasicWidget(c))
// for some reason if we do ToggleHandler(ClickWidget(c)) it does not toggle
const ToggleWidget = (c) => ToggleHandler(BasicWidget(c))
const ToggleButtonGroupWidget = (c) => ToggleButtonGroupHandler(BasicWidget(c))

// Row & Col
import { Row, Col } from 'antd';
export
    class RowModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['align', 'gutter', 'justify']
    reactComponent = () => BasicWidget(Row)
}

export
    class ColModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['span', 'offset']
    reactComponent = () => BasicWidget(Col)
}

// Form
import { Form } from 'antd';
export
    class FormModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['labelCol', 'wrapperCol']
    reactComponent = () => BasicWidget(Form)
}

// FormItem
export
    class FormItemModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), label: null } };
    autoProps = ['label']
    reactComponent = () => BasicWidget(Form.Item)
}

// Input
import { Input } from 'antd';
export
    class InputModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), value: null, type: 'text' } };
    autoProps = ['value', 'type']
    reactComponent = () => ValueHandler(BasicWidget(Input, true))
}

// TextArea
export
    class TextAreaModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), value: null } };
    autoProps = ['value']
    reactComponent = () => ValueHandler(BasicWidget(Input.TextArea))
}

// Search
export
    class SearchModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), value: null } };
    autoProps = ['value']
    reactComponent = () => ValueHandler(BasicWidget(Input.Search, true))
}

// InputGroup
export
    class InputGroupModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), value: null } };
    autoProps = ['value']
    reactComponent = () => ValueHandler(BasicWidget(Input.Group))
}

// Password
export
    class PasswordModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), value: null } };
    autoProps = ['value']
    reactComponent = () => ValueHandler(BasicWidget(Input.Password, true))
}

// InputNumber
import { InputNumber } from 'antd';
export
    class InputNumberModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), value: null, min: -Infinity, max: Infinity } };
    autoProps = ['value', 'min', 'max']
    reactComponent = () => ValueHandler(BasicWidget(InputNumber))
}

// Button
import { Button } from 'antd';
export
    class ButtonModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), value: null, exclusive: false } };
    autoProps = ['value', 'exclusive']
    reactComponent = () => ClickWidget(Button)
}

// Switch
import { Switch } from 'antd';
export
    class SwitchModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), value: null, checked: false } };
    autoProps = ['value', 'checked', 'checkedChildren', 'unCheckedChildren']
    reactComponent = () => FixClickCapture(CheckedWidget(Switch))
}

// Checkbox
import { Checkbox } from 'antd';
export
    class CheckboxModel extends ReactModel {
    autoProps = ['value', 'checked'];
    reactComponent = () => CheckedWidget(Checkbox)
}

// Cascader
import { Cascader } from 'antd';
export
    class CascaderModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), options: [] } };
    autoProps = ['options']
    reactComponent = () => BasicWidget(Cascader, true)
}

// Radio
import { Radio } from 'antd';
export
    class RadioModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), value: null } };
    autoProps = ['value']
    reactComponent = () => BasicWidget(Radio)
}

// RadioGroup
export
    class RadioGroupModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), value: null } };
    autoProps = ['value', 'name']
    reactComponent = () => BasicWidget(Radio.Group)
}

// Select
export
    class SelectModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), options: [], value: null, mode: 'default' } };
    autoProps = ['value', 'options', 'mode']
    //reactComponent = () => SelectHandler(BasicWidget(Select))
    reactComponent = () => SelectHandler(Select)
}

// SelectOption
export
    class SelectOptionModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), value: null, key: '0' } };
    autoProps = ['value', 'key']
    reactComponent = () => BasicWidget(Select.Option)
}

// Slider
import { Slider } from 'antd';
export
    class SliderModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), min: 0, max: 100, value: '', range: false } };
    autoProps = ['min', 'max', 'value', 'range']
    reactComponent = () => ValueHandler(BasicWidget(Slider))
}

// DatePicker
import { DatePicker } from 'antd';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
export
    class DatePickerModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), value: '' } };
    autoProps = ['value']
    reactComponent = () => MomentValueHandler(DatePicker)
}

// MonthPicker
export
    class MonthPickerModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), value: '' } };
    autoProps = ['value']
    reactComponent = () => MomentValueHandler(MonthPicker)
}

// RangePicker
export
    class RangePickerModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), value: '' } };
    autoProps = ['value']
    reactComponent = () => MomentValueHandler(RangePicker)
}

// WeekPicker
export
    class WeekPickerModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), value: '' } };
    autoProps = ['value']
    reactComponent = () => MomentValueHandler(WeekPicker)
}

// Progress
import { Progress } from 'antd';
export
    class ProgressModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), percent: 50.0, type: 'line'} };
    autoProps = ['percent', 'type']
    reactComponent = () => BasicWidget(Progress)
}

// Steps
import { Steps } from 'antd';
const Step = Steps.Step;
export
    class StepsModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), current: 0, direction: 'horizontal', progressDot: false, initial: 0, size: 'default'} };
    autoProps = ['current', 'direction', 'progressDot', 'initial', 'size']
    reactComponent = () => BasicWidget(Steps)
}

// Step
export
    class StepModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), title: '', description: ''/*, status: null, icon: null*/} };
    autoProps = ['title', 'description'] //, 'status', 'icon']
    reactComponent = () => BasicWidget(Step)
}

// Transfer
import { Transfer } from 'antd';
export
    class TransferModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), dataSource: [], targetKeys: [], showSearch: false, render: item => item.title } };
    autoProps = ['dataSource', 'showSearch', 'targetKeys']
    reactComponent = () => TransferHandler(BasicWidget(Transfer))
}

// Drawer
import { Drawer } from 'antd';
export
    class DrawerModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), title: 'Title', placement: 'right', visible: false } };
    autoProps = ['title', 'placement', 'visible']
    reactComponent = () => DrawerHandler(BasicWidget(Drawer))
}
