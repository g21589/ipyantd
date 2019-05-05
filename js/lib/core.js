import * as React from 'react';
import moment from 'moment';
import { ReactModel } from './react-widget';
import GridLayout from 'react-grid-layout';
import 'antd/dist/antd.css';
import './styles/ipyantd.css';
import 'react-grid-layout/css/styles.css';
//import 'react-resizable/css/styles.css';

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

function DivWidget() {
    return class extends BackboneWidget {
        render() {
            let { model, ...props } = this.stateProps();
            return <div {...props}>{props.children}</div>
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

function ModelHandler(Component) {
    return class extends BackboneWidget {
        onOkHandler = (event) => {
            console.log('ModelHandler > onOkHandler', event);
            this.props.model.set('visible', false);
            this.props.model.save_changes();
        }
        onCancelHandler = (event) => {
            console.log('ModelHandler > onCancelHandler', event);
            this.props.model.set('visible', false);
            this.props.model.save_changes();
        }
        render() {
            console.log('ModelHandler > render', Component);
            this.props.visible = this.props.model.get('visible');            
            return (
                <Component 
                    {...this.props}
                    onOk={this.onOkHandler}
                    onCancel={this.onCancelHandler}
                >
                </Component>
            );
        }
    }
}

function PopconfirmHandler(Component) {
    return class extends BackboneWidget {
        onConfirmHandler = (event) => {
        }
        onCancelHandler = (event) => {
        }
        render() {   
            return (
                <Component 
                    {...this.props}
                    onConfirm={this.onConfirmHandler}
                    onCancel={this.onCancelHandler}
                >
                </Component>
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

// Div
export
    class DivModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = []
    reactComponent = () => DivWidget()
}

// ReactGridLayout
function ReactGridLayoutHandler() {
    return class extends BackboneWidget {

        onLayoutChangeHandler = (layout) => {
            this.props.model.set('layout', layout);
            this.props.model.save_changes();
            this.saveLayoutToLS('TEST', 'layout', layout)
        }
        
        onResizeStartHandler = (layout, oldItem, newItem, placeholder, e, element) => {
            console.log('onResizeStart');
        }
        
        onResizeHandler = (layout, oldItem, newItem, placeholder, e, element) => {
            console.log('onResize');
        }
        
        onResizeStopHandler = (layout, oldItem, newItem, placeholder, e, element) => {
            console.log('onResizeStop');
        }

        getLayoutFromLS = (apname, key) => {
            let ls = {};
            if (global.localStorage) {
                try {
                    ls = JSON.parse(global.localStorage.getItem(apname)) || {};
                } catch (e) {
                    console.log(e);
                }
            }
            return ls[key];
        }
          
        saveLayoutToLS = (apname, key, value) => {
            if (global.localStorage) {
                global.localStorage.setItem(apname, JSON.stringify({ [key]: value }));
            }
        }

        render() {

            let { model, ...props } = this.stateProps();
            let es = props.children.map((element, index) => <div key={index}>{element}</div>)

            return (
                <GridLayout 
                    {...props} 
                    onLayoutChange={this.onLayoutChangeHandler}
                    onResizeStart={this.onResizeStartHandler}
                    onResize={this.onResizeHandler}
                    onResizeStop={this.onResizeStopHandler}
                >
                    {es}
                </GridLayout>
            )

        }
    }
}

export
    class ReactGridLayoutModel extends ReactModel {
    defaults = () => {
        return {
            ...super.defaults(),
            className: 'layout',
            cols: 12,
            rowHeight:30,
            width: 1200,
            draggableHandle: ''
        }
    };
    autoProps = ['layout', 'className', 'cols', 'rowHeight', 'width', 'draggableHandle']
    reactComponent = () => ReactGridLayoutHandler()
}

function ReactGridLayoutItemHandler() {
    return class extends BackboneWidget {
        render() {
            return (
                <div key={this.props.model.get('key')}>AAAAA</div>
            );
        }
    }
}

// ReactGridLayoutItem
export
    class ReactGridLayoutItemModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['key']
    reactComponent = () => ReactGridLayoutItemHandler()
}

// ReactEcharts
import ReactEcharts from 'echarts-for-react';
export
    class ReactEchartsModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['option', 'notMerge', 'lazyUpdate', 'theme', 'opts']
    reactComponent = () => BasicWidget(ReactEcharts, true)
}

// Row
import { Row, Col } from 'antd';
export
    class RowModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['align', 'gutter', 'justify']
    reactComponent = () => BasicWidget(Row)
}

// Col
export
    class ColModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['span', 'offset']
    reactComponent = () => BasicWidget(Col)
}

// Icon
import { Icon } from 'antd';
export
    class IconModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['type', 'spin', 'rotate']
    reactComponent = () => BasicWidget(Icon)
}

// Text
import { Typography } from 'antd';
export
    class TextModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['code', 'copyable ', 'delete', 'disabled', 'editable', 
                 'ellipsis', 'mark', 'underline', 'strong', 'type']
    reactComponent = () => BasicWidget(Typography.Text)
}

// Title
export
    class TitleModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['copyable ', 'delete', 'disabled', 'editable', 
                 'ellipsis', 'mark', 'underline', 'strong', 'type', 'level']
    reactComponent = () => BasicWidget(Typography.Title)
}

// Paragraph
export
    class ParagraphModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['copyable ', 'delete', 'disabled', 'editable', 
                 'ellipsis', 'mark', 'underline', 'strong', 'type']
    reactComponent = () => BasicWidget(Typography.Paragraph)
}

// Affix
import { Affix } from 'antd';
export
    class AffixModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['offsetBottom', 'offsetTop']
    reactComponent = () => BasicWidget(Affix)
}

// Breadcrumb
import { Breadcrumb } from 'antd';
export
    class BreadcrumbModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), separator: '/' } };
    autoProps = ['separator']
    reactComponent = () => BasicWidget(Breadcrumb)
}

// BreadcrumbItem
import { BreadcrumbItem } from 'antd';
export
    class BreadcrumbItemModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = []
    reactComponent = () => BasicWidget(BreadcrumbItem)
}

// Dropdown
import { Dropdown } from 'antd';
export
    class DropdownModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['overlay']
    reactComponent = () => BasicWidget(Dropdown)
}

// Menu
import { Menu } from 'antd';
export
    class MenuModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['mode', 'theme', 'inlineCollapsed', 'inlineIndent', 
                 'multiple', 'selectable']
    reactComponent = () => BasicWidget(Menu)
}

// MenuItem
export
    class MenuItemModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['disabled', 'key', 'title']
    reactComponent = () => BasicWidget(Menu.Item)
}

// MenuSubMenu
export
    class MenuSubMenuModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['disabled', 'key', 'title']
    reactComponent = () => BasicWidget(Menu.SubMenu)
}

// MenuItemGroup
export
    class MenuItemGroupModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['title']
    reactComponent = () => BasicWidget(Menu.ItemGroup)
}

// MenuDivider
export
    class MenuDividerModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = []
    reactComponent = () => BasicWidget(Menu.Divider)
}

// Pagination
import { Pagination } from 'antd';
export
    class PaginationModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['current', 'defaultCurrent', 'total', 'defaultPageSize', 'size',
                 'showSizeChanger', 'simple']
    reactComponent = () => BasicWidget(Pagination)
}

// PageHeader
import { PageHeader } from 'antd';
export
    class PageHeaderModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['title', 'subTitle']
    reactComponent = () => BasicWidget(PageHeader, true)
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

// AutoComplete
import { AutoComplete } from 'antd';
export
    class AutoCompleteModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['dataSource', 'placeholder']
    reactComponent = () => BasicWidget(AutoComplete)
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
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['disabled', 'ghost', 'loading', 'shape', 'type', 
                 'size', 'icon', 'block']
    reactComponent = () => ClickWidget(Button)
}

// ExtButton
function ExtButtonWidget(Component, isVoid=false) {
    return class extends BackboneWidget {
        onClickHandler(event) {
            console.log("ExtButtonWidget > onClickHandler");
            console.log(event, this);
            eval(this.props.onClick)
        }
        render() {
            let { model, ...props } = this.stateProps();
            if (isVoid) {
                console.log('isVoid');
                delete props.children
                return <Component {...props}/>
            } else {
                delete props.onClick
                return (
                    <Component 
                        {...props}
                        onClick={(event) => {this.onClickHandler(event)}}
                    >
                        {props.children}
                    </Component>
                )
            }
        }
    }
}

export
    class ExtButtonModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['disabled', 'ghost', 'loading', 'shape', 'type', 
                 'size', 'icon', 'block', 'onClick']
    reactComponent = () => ExtButtonWidget(Button)
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
    reactComponent = () => ValueHandler(BasicWidget(Radio.Group))
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

// Transfer
import { Transfer } from 'antd';
export
    class TransferModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), dataSource: [], targetKeys: [], showSearch: false } };
    autoProps = ['dataSource', 'showSearch', 'targetKeys']
    reactComponent = () => TransferHandler(BasicWidget(Transfer))
}

// Upload
import { Upload } from 'antd';
export
    class UploadModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['name', 'multiple', 'listType']
    reactComponent = () => BasicWidget(Upload)
}

// Avatar
import { Avatar } from 'antd';
export
    class AvatarModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['icon', 'shape', 'size', 'src', 'srcSet', 'alt']
    reactComponent = () => BasicWidget(Avatar)
}

// Badge
import { Badge } from 'antd';
export
    class BadgeModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['count', 'status']
    reactComponent = () => BasicWidget(Badge)
}

// Comment
import { Comment } from 'antd';
export
    class CommentModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = []
    reactComponent = () => BasicWidget(Comment)
}

// Collapse
import { Collapse } from 'antd';
export
    class CollapseModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['bordered', 'accordion', 'destroyInactivePanel']
    reactComponent = () => BasicWidget(Collapse)
}

// CollapsePanel
export
    class CollapsePanelModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['disabled', 'forceRender', 'header', 'key', 'showArrow']
    reactComponent = () => BasicWidget(Collapse.Panel)
}

// Carousel
import { Carousel } from 'antd';
export
    class CarouselModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['autoplay', 'vertical', 'dots', 'easing', 'effect']
    reactComponent = () => BasicWidget(Carousel)
}

// Card
import { Card } from 'antd';
export
    class CardModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['title', 'extra', 'size']
    reactComponent = () => BasicWidget(Card)
}

// Card
export
    class CardGridModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = []
    reactComponent = () => BasicWidget(Card.Grid)
}

// Card
export
    class CardMetaModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = []
    reactComponent = () => BasicWidget(Card.Meta)
}

// Calendar
import { Calendar } from 'antd';
export
    class CalendarModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = []
    reactComponent = () => BasicWidget(Calendar)
}

// Empty
import { Empty } from 'antd';
export
    class EmptyModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = []
    reactComponent = () => BasicWidget(Empty)
}

// List
import { List } from 'antd';
export
    class ListModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = []
    reactComponent = () => BasicWidget(List)
}

// ListItem
export
    class ListItemModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = []
    reactComponent = () => BasicWidget(List.Item)
}

// Popover
import { Popover } from 'antd';
export
    class PopoverModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['title']
    reactComponent = () => BasicWidget(Popover)
}

// Statistic
import { Statistic } from 'antd';
export
    class StatisticModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['title', 'value', 'precision', 'prefix', 'suffix']
    reactComponent = () => BasicWidget(Statistic)
}

// Tree
import { Tree } from 'antd';
const { TreeNode } = Tree;

function SimpleTreeWidget() {
    return class extends BackboneWidget {
        onSelectHandler = (selectedKeys, info) => {
            console.log('selected', selectedKeys, info);
        }
        onCheckHandler = (checkedKeys, info) => {
            console.log('onCheck', checkedKeys, info);
        }
        render() {
            let { model, ...props } = this.stateProps();
            return (
                <Tree
                    checkable
                    defaultExpandedKeys={['0-0-0', '0-0-1']}
                    defaultSelectedKeys={['0-0-0', '0-0-1']}
                    defaultCheckedKeys={['0-0-0', '0-0-1']}
                    onSelect={this.onSelectHandler}
                    onCheck={this.onCheckHandler}
                >
                    <TreeNode title="parent 1" key="0-0">
                    <TreeNode title="parent 1-0" key="0-0-0" disabled>
                        <TreeNode title="leaf" key="0-0-0-0" disableCheckbox />
                        <TreeNode title="leaf" key="0-0-0-1" />
                    </TreeNode>
                    <TreeNode title="parent 1-1" key="0-0-1">
                        <TreeNode title={<span style={{ color: '#1890ff' }}>sss</span>} key="0-0-1-0" />
                    </TreeNode>
                    </TreeNode>
                </Tree>
            );
        }
    }
}

export
    class TreeModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['autoExpandParent', 'blockNode', 'checkable', 'multiple', 
                 'showLine', 'draggable']
    //reactComponent = () => BasicWidget(Tree)
    reactComponent = () => SimpleTreeWidget()
}

function TreeNodeWidget() {
    return class extends BackboneWidget {
        render() {
            let { model, ...props } = this.stateProps();
            return (
                <TreeNode
                    title={this.props.model.get('title')}
                    key={this.props.model.get('key')}
                >
                    {props.children}
                </TreeNode>
            );
        }
    }
}

// TreeNode
export
    class TreeNodeModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['disableCheckbox', 'disabled', 'icon', 'isLeaf', 
                 'title', 'key', 'selectable']
    reactComponent = () => TreeNodeWidget()
}

// Tooltip
import { Tooltip } from 'antd';
export
    class TooltipModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['title']
    reactComponent = () => BasicWidget(Tooltip)
}

// Tag
import { Tag } from 'antd';
export
    class TagModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['closable', 'color', 'visible']
    reactComponent = () => BasicWidget(Tag)
}

// Tabs
import { Tabs } from 'antd';
export
    class TabsModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['type', 'tabPosition', 'size']
    reactComponent = () => BasicWidget(Tabs)
}

// TabPane
export
    class TabPaneModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['tab', 'key']
    reactComponent = () => BasicWidget(Tabs.TabPane)
}

// Table
import { Table } from 'antd';
export
    class TableModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['dataSource', 'columns', 'bordered', 'size']
    reactComponent = () => BasicWidget(Table)
}

// Timeline
import { Timeline } from 'antd';
export
    class TimelineModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), pending: false, reverse: false, mode: 'left' } };
    autoProps = ['pending', 'reverse', 'mode']
    reactComponent = () => BasicWidget(Timeline)
}

// TimelineItem
export
    class TimelineItemModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), color: 'blue' } };
    autoProps = ['color']
    reactComponent = () => BasicWidget(Timeline.Item)
}

// Drawer
import { Drawer } from 'antd';
export
    class DrawerModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), title: 'Title', placement: 'right', visible: false } };
    autoProps = ['title', 'placement', 'visible']
    reactComponent = () => DrawerHandler(BasicWidget(Drawer))
}

// Model
import { Model } from 'antd';
export
    class ModelModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), title: 'Title', visible: false } };
    autoProps = ['title', 'visible']
    reactComponent = () => ModelHandler(BasicWidget(Model))
}

// Progress
import { Progress } from 'antd';
export
    class ProgressModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), percent: 50.0, type: 'line'} };
    autoProps = ['percent', 'type']
    reactComponent = () => BasicWidget(Progress)
}

// Popconfirm
import { Popconfirm } from 'antd';
export
    class PopconfirmModel extends ReactModel {
    defaults = () => { return { ...super.defaults(), title: 'Title' } };
    autoProps = ['title']
    reactComponent = () => PopconfirmHandler(BasicWidget(Popconfirm))
}

// Spin
import { Spin } from 'antd';
export
    class SpinModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['delay', 'size', 'spinning', 'tip']
    reactComponent = () => BasicWidget(Spin, true)
}

// Skeleton
import { Skeleton } from 'antd';
export
    class SkeletonModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['active', 'avatar', 'loading', 'paragraph', 'title']
    reactComponent = () => BasicWidget(Skeleton, true)
}

// Anchor
import { Anchor } from 'antd';
export
    class AnchorModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['affix', 'bounds', 'showInkInFixed']
    reactComponent = () => BasicWidget(Anchor)
}

// AnchorLink
export
    class AnchorLinkModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['href', 'title']
    reactComponent = () => BasicWidget(Anchor.Link)
}

// BackTop
import { BackTop } from 'antd';
export
    class BackTopModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['visibilityHeight']
    reactComponent = () => BasicWidget(BackTop)
}

// ConfigProvider
import { ConfigProvider } from 'antd';
export
    class ConfigProviderModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['autoInsertSpaceInButton', 'prefixCls']
    reactComponent = () => BasicWidget(ConfigProvider)
}

// Divider
import { Divider } from 'antd';
export
    class DividerModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['dashed', 'orientation', 'type']
    reactComponent = () => BasicWidget(Divider)
}

// LocaleProvider
import { LocaleProvider } from 'antd';
export
    class LocaleProviderModel extends ReactModel {
    defaults = () => { return { ...super.defaults() } };
    autoProps = ['locale']
    reactComponent = () => BasicWidget(LocaleProvider)
}
