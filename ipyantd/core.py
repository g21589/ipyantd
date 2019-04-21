import ipywidgets as widgets
from traitlets import Unicode, Instance, CBool, CInt, CFloat, HasTraits, Any, Dict, List
from ipywidgets.widgets.widget import widget_serialization
from ipywidgets.widgets.trait_types import TypedTuple
from .mixins import ClickMixin

class ValueMixin(HasTraits):
    value = Any(help="value of the widget").tag(sync=True, **widget_serialization)

class DefaultValueMixin(HasTraits):
    default_value = Any(help="default value of the widget").tag(sync=True, **widget_serialization)

class LabelMixin:
    label = Unicode(help="label of the widget").tag(sync=True)

class SizeMixin:
    size = Unicode('default', allow_none=True, help="size of the widget").tag(sync=True)

@widgets.register
class ReactWidget(widgets.DOMWidget, ClickMixin):
    """An example widget."""
    _view_name = Unicode('ReactView').tag(sync=True)
    _model_name = Unicode('ReactModel').tag(sync=True)
    _view_module = Unicode('ipyantd').tag(sync=True)
    _model_module = Unicode('ipyantd').tag(sync=True)
    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    _model_module_version = Unicode('^0.1.0').tag(sync=True)
    child = Instance('ipywidgets.widgets.domwidget.DOMWidget', default_value=None, allow_none=True)\
                .tag(sync=True, **widget_serialization).tag(sync=True)
    children = TypedTuple(trait=Instance('ipywidgets.widgets.domwidget.DOMWidget'), help="children", default=[], allow_none=True)\
                .tag(sync=True, **widget_serialization).tag(sync=True)
    visible = CBool(True).tag(sync=True)
    content = Unicode(help="").tag(sync=True)
    style = Dict().tag(sync=True)
    # icon = Instance(widgets.DOMWidget, allow_none=True, default_value=None).tag(sync=True, **widget_serialization)

class Div(ReactWidget):
    _model_name = Unicode('DivModel').tag(sync=True)

def text(text):
    return Div(content=text)

def div(*children):
    if len(children) == 1:
        return Div(child=children[0])
    else:
        return Div(children=children)

def divjslink(widget, property):
    value = getattr(widget, property)
    issequence = False
    try:
        value[0]
        issequence = False
    except:
        pass
    div = Div()
    if issequence:
        widgets.jslink((widget, property), (div, 'children'))
    else:
        widgets.jslink((widget, property), (div, 'child'))
    return div

class Selectable:
    selected = CBool(help="selected or not").tag(sync=True)

class Checkable:
    checked = CBool(help="checked or not").tag(sync=True)

class ReactGridLayout(ReactWidget):
    _model_name = Unicode('ReactGridLayoutModel').tag(sync=True)
    layout      = List(help="layout").tag(sync=True)
    cols        = CInt(12, help="cols").tag(sync=True)
    row_height  = CInt(30, help="row_height").tag(sync=True)
    width       = CInt(900, help="width").tag(sync=True)
    class_name  = Unicode('layout', help="class_name").tag(sync=True)
    draggable_handle = Unicode('', help="draggable_handle").tag(sync=True)

class ReactGridLayoutItem(ReactWidget):
    _model_name = Unicode('ReactGridLayoutItemModel').tag(sync=True)
    key = Unicode(help="key").tag(sync=True)

class Row(ReactWidget):
    _model_name = Unicode('RowModel').tag(sync=True)
    align   = Unicode('top', help="align").tag(sync=True)
    gutter  = CInt(0, help="gutter").tag(sync=True)
    justify = Unicode('start', help="justify").tag(sync=True)
    type    = Unicode(None, allow_none=True, help="type").tag(sync=True)

class Col(ReactWidget):
    _model_name = Unicode('ColModel').tag(sync=True)
    offset = CInt(0, help="offset").tag(sync=True)
    order  = CInt(0, help="order").tag(sync=True)
    pull   = CInt(0, help="pull").tag(sync=True)
    push   = CInt(0, help="push").tag(sync=True)
    span   = CInt(None, allow_none=True, help="span").tag(sync=True)
    xs     = CInt(None, allow_none=True, help="xs").tag(sync=True)
    sm     = CInt(None, allow_none=True, help="sm").tag(sync=True)
    md     = CInt(None, allow_none=True, help="md").tag(sync=True)
    lg     = CInt(None, allow_none=True, help="lg").tag(sync=True)
    xl     = CInt(None, allow_none=True, help="xl").tag(sync=True)
    xxl    = CInt(None, allow_none=True, help="xxl").tag(sync=True)

class Icon(ReactWidget):
    _model_name = Unicode('IconModel').tag(sync=True)
    type        = Unicode('', help='type').tag(sync=True)
    spin        = CBool(False, help="spin").tag(sync=True)
    rotate      = CFloat(None, allow_none=True, help="rotate").tag(sync=True)

class Text(ReactWidget):
    _model_name = Unicode('TextModel').tag(sync=True)
    code        = CBool(False, help="code").tag(sync=True)
    copyable    = CBool(False, help="copyable").tag(sync=True)
    delete      = CBool(False, help="delete").tag(sync=True)
    disabled    = CBool(False, help="disabled").tag(sync=True)
    editable    = CBool(False, help="editable").tag(sync=True)
    ellipsis    = CBool(False, help="ellipsis").tag(sync=True)
    mark        = CBool(False, help="mark").tag(sync=True)
    underline   = CBool(False, help="underline").tag(sync=True)
    strong      = CBool(False, help="strong").tag(sync=True)
    type        = Unicode('', help='type').tag(sync=True)

class Title(ReactWidget):
    _model_name = Unicode('TitleModel').tag(sync=True)
    level       = CInt(1, help="level").tag(sync=True)
    copyable    = CBool(False, help="copyable").tag(sync=True)
    delete      = CBool(False, help="delete").tag(sync=True)
    disabled    = CBool(False, help="disabled").tag(sync=True)
    editable    = CBool(False, help="editable").tag(sync=True)
    ellipsis    = CBool(False, help="ellipsis").tag(sync=True)
    mark        = CBool(False, help="mark").tag(sync=True)
    underline   = CBool(False, help="underline").tag(sync=True)
    strong      = CBool(False, help="strong").tag(sync=True)
    type        = Unicode('', help='type').tag(sync=True)

class Paragraph(ReactWidget):
    _model_name = Unicode('ParagraphModel').tag(sync=True)
    copyable    = CBool(False, help="copyable").tag(sync=True)
    delete      = CBool(False, help="delete").tag(sync=True)
    disabled    = CBool(False, help="disabled").tag(sync=True)
    editable    = CBool(False, help="editable").tag(sync=True)
    ellipsis    = CBool(False, help="ellipsis").tag(sync=True)
    mark        = CBool(False, help="mark").tag(sync=True)
    underline   = CBool(False, help="underline").tag(sync=True)
    strong      = CBool(False, help="strong").tag(sync=True)
    type        = Unicode('', help='type').tag(sync=True)

class Form(ReactWidget):
    _model_name = Unicode('FormModel').tag(sync=True)
    label_col   = Dict(help='label_col').tag(sync=True)
    wrapper_col = Dict(help='label_col').tag(sync=True)

class FormItem(ReactWidget):
    _model_name = Unicode('FormItemModel').tag(sync=True)
    label       = Unicode('', allow_none=True, help='label').tag(sync=True)

class Input(ReactWidget, ValueMixin):
    _model_name = Unicode('InputModel').tag(sync=True)
    default_value = Unicode('', allow_none=True, help="default_value").tag(sync=True)
    type = Unicode(help="type").tag(sync=True)

class TextArea(ReactWidget, ValueMixin):
    _model_name = Unicode('TextAreaModel').tag(sync=True)
    default_value = Unicode('', allow_none=True, help="default_value").tag(sync=True)
    type = Unicode(help="type").tag(sync=True)

class Search(ReactWidget, ValueMixin):
    _model_name = Unicode('SearchModel').tag(sync=True)
    default_value = Unicode('', allow_none=True, help="default_value").tag(sync=True)
    type = Unicode(help="type").tag(sync=True)

class InputGroup(ReactWidget, ValueMixin):
    _model_name = Unicode('InputGroupModel').tag(sync=True)

class Password(ReactWidget, ValueMixin):
    _model_name = Unicode('PasswordModel').tag(sync=True)
    visibility_toggle = CBool(True, allow_none=True, help="selected or not").tag(sync=True)

class InputNumber(ReactWidget, ValueMixin):
    _model_name = Unicode('InputNumberModel').tag(sync=True)
    min = CFloat(help="min value").tag(sync=True)
    max = CFloat(help="max value").tag(sync=True)

class ButtonBase(ReactWidget, ClickMixin):
    description = Unicode(help="Button label.").tag(sync=True)

class Button(ButtonBase):
    _model_name = Unicode('ButtonModel').tag(sync=True)
    type        = Unicode('default', help="type").tag(sync=True)
    size        = Unicode('default', help="size").tag(sync=True)
    icon        = Unicode(help="icon").tag(sync=True)

class Switch(ButtonBase, ValueMixin):
    _model_name = Unicode('SwitchModel').tag(sync=True)
    checked = CBool(None, allow_none=True, help="checked or not").tag(sync=True)
    checked_children = Unicode('On', help="content to be shown when the state is checked").tag(sync=True)
    un_checked_children = Unicode('Off', help="content to be shown when the state is unchecked").tag(sync=True)

class Checkbox(ReactWidget):
    _model_name = Unicode('CheckboxModel').tag(sync=True)
    description = Unicode(help="Menu item").tag(sync=True)
    selected    = CBool(help="selected or not").tag(sync=True)
    checked     = CBool(help="checked or not").tag(sync=True)

class Cascader(ReactWidget):
    _model_name = Unicode('CascaderModel').tag(sync=True)
    options     = List(help='options').tag(sync=True)

class Radio(ReactWidget, ValueMixin):
    _model_name = Unicode('RadioModel').tag(sync=True)
    default_checked = CBool(help="checked or not").tag(sync=True)

class RadioGroup(ReactWidget, ValueMixin):
    _model_name = Unicode('RadioGroupModel').tag(sync=True)
    name = Unicode('', allow_none=True, help='Set mode of Select').tag(sync=True)

class Select(ReactWidget, ValueMixin):
    _model_name = Unicode('SelectModel').tag(sync=True)
    description = Unicode(help="Select").tag(sync=True)
    options = Any(help="options of the widget").tag(sync=True, **widget_serialization)
    mode = Unicode('default', help='Set mode of Select').tag(sync=True)

class SelectOption(ReactWidget, ValueMixin, Selectable):
    _model_name = Unicode('SelectOptionModel').tag(sync=True)
    description = Unicode(help="SelectOption").tag(sync=True)
    key = Unicode(help="SelectOption key").tag(sync=True)
    selected = CBool(help="selected or not").tag(sync=True)  # if removed, traitlets goes to inf recursion

class Slider(ReactWidget, DefaultValueMixin, ValueMixin):
    _model_name = Unicode('SliderModel').tag(sync=True)
    min = CFloat(help="min value").tag(sync=True)
    max = CFloat(help="max value").tag(sync=True)
    range = CBool(help="range mode or not").tag(sync=True)

class DatePicker(ReactWidget, ValueMixin):
    _model_name = Unicode('DatePickerModel').tag(sync=True)
    description = Unicode(help="description").tag(sync=True)
    time_format = Unicode(help="time_format").tag(sync=True)

class MonthPicker(ReactWidget, ValueMixin):
    _model_name = Unicode('MonthPickerModel').tag(sync=True)
    description = Unicode(help="description").tag(sync=True)

class RangePicker(ReactWidget, ValueMixin):
    _model_name = Unicode('RangePickerModel').tag(sync=True)
    description = Unicode(help="description").tag(sync=True)
    start_time = Unicode(help="start_time").tag(sync=True)
    end_time = Unicode(help="end_time").tag(sync=True)

class WeekPicker(ReactWidget, ValueMixin):
    _model_name = Unicode('WeekPickerModel').tag(sync=True)
    description = Unicode(help="description").tag(sync=True)

class Progress(ReactWidget):
    _model_name = Unicode('ProgressModel').tag(sync=True)
    description = Unicode(help="description").tag(sync=True)
    percent = CFloat(help="percent").tag(sync=True)
    type = Unicode(help="type").tag(sync=True)

class Steps(ReactWidget, SizeMixin):
    _model_name = Unicode('StepsModel').tag(sync=True)
    description = Unicode(help="description").tag(sync=True)
    current = CInt(help="current").tag(sync=True)
    direction = Unicode('horizontal', allow_none=True, help="direction").tag(sync=True)
    label_placement = Unicode(None, allow_none=True, help="label_placement").tag(sync=True)
    progress_dot = CBool(False, allow_none=True, help="progress_dot").tag(sync=True)
    status = Unicode(None, allow_none=True, help="status").tag(sync=True)
    initial = CInt(0, allow_none=True, help="initial").tag(sync=True)

class Step(ReactWidget):
    _model_name = Unicode('StepModel').tag(sync=True)
    description = Unicode(None, allow_none=True, help="description").tag(sync=True)
    icon = Unicode(None, allow_none=True, help="icon").tag(sync=True)
    status = Unicode(None, allow_none=True, help="status").tag(sync=True)
    title = Unicode(help="title").tag(sync=True)

class Transfer(ReactWidget):
    _model_name = Unicode('TransferModel').tag(sync=True)
    data_source = List(help="data_source").tag(sync=True)
    show_search = CBool(False, allow_none=True, help="show_search").tag(sync=True)
    target_keys = List(help="target_keys").tag(sync=True)

class Avatar(ReactWidget):
    _model_name = Unicode('AvatarModel').tag(sync=True)
    icon        = Unicode(help="icon").tag(sync=True)
    shape       = Unicode('circle', help="shape").tag(sync=True)
    size        = Unicode('default', help="size").tag(sync=True)
    src         = Unicode(help="src").tag(sync=True)
    src_set     = Unicode(help="src_set").tag(sync=True)
    alt         = Unicode(help="alt").tag(sync=True)

class Badge(ReactWidget):
    _model_name = Unicode('BadgeModel').tag(sync=True)
    count = CInt(help="count").tag(sync=True)
    status = Unicode(help="status").tag(sync=True)
    # TODO

class Comment(ReactWidget):
    _model_name = Unicode('CommentModel').tag(sync=True)
    # TODO

class Collapse(ReactWidget):
    _model_name = Unicode('CollapseModel').tag(sync=True)
    bordered    = CBool(True, help="bordered").tag(sync=True)
    accordion   = CBool(False, help="accordion").tag(sync=True)
    destroy_inactive_panel = CBool(False, help="destroy_inactive_panel").tag(sync=True)
    # TODO

class CollapsePanel(ReactWidget):
    _model_name = Unicode('CollapsePanelModel').tag(sync=True)
    disabled    = CBool(False, help="disabled").tag(sync=True)
    force_render = CBool(False, help="force_render").tag(sync=True)
    header      = Unicode(help="header").tag(sync=True)
    key         = Unicode(help="key").tag(sync=True)
    show_arrow  = CBool(True, help="show_arrow").tag(sync=True)
    # TODO

class Carousel(ReactWidget):
    _model_name = Unicode('CollapseModel').tag(sync=True)
    autoplay    = CBool(False, help="autoplay").tag(sync=True)
    vertical    = CBool(False, help="vertical").tag(sync=True)
    dots        = CBool(False, help="dots").tag(sync=True)
    easing      = Unicode('linear', help="easing").tag(sync=True)
    effect      = Unicode('scrollx', help="effect").tag(sync=True)
    # TODO

class Card(ReactWidget):
    _model_name = Unicode('CardModel').tag(sync=True)
    title = Unicode('', help="title").tag(sync=True)
    extra = Unicode('', help="extra").tag(sync=True)
    size  = Unicode('default', help="size").tag(sync=True)
    # TODO

class CardGrid(ReactWidget):
    _model_name = Unicode('CardGridModel').tag(sync=True)
    class_name = Unicode('', help="class_name").tag(sync=True)

class CardMeta(ReactWidget):
    _model_name = Unicode('CardMetaModel').tag(sync=True)

class Calendar(ReactWidget):
    _model_name = Unicode('CalendarModel').tag(sync=True)
    # TODO

class Empty(ReactWidget):
    _model_name = Unicode('EmptyModel').tag(sync=True)
    # TODO

class ANTList(ReactWidget):
    _model_name = Unicode('ListModel').tag(sync=True)
    # TODO

class ANTListItem(ReactWidget):
    _model_name = Unicode('ListItemModel').tag(sync=True)
    # TODO

class Popover(ReactWidget):
    _model_name = Unicode('PopoverModel').tag(sync=True)
    #content     =
    title       = Unicode(help="title").tag(sync=True)
    # TODO

class Statistic(ReactWidget):
    _model_name = Unicode('StatisticModel').tag(sync=True)
    title       = Unicode('', help="title").tag(sync=True)
    value       = Any(100, help="value").tag(sync=True)
    precision   = CInt(0, help="precision").tag(sync=True)
    prefix      = Unicode('', help="prefix").tag(sync=True)
    suffix      = Unicode('', help="suffix").tag(sync=True)
    # TODO

class Tree(ReactWidget):
    _model_name = Unicode('TreeModel').tag(sync=True)
    auto_expand_parent = CBool(True, help="auto_expand_parent").tag(sync=True)
    block_node  = CBool(False, help="block_node").tag(sync=True)
    checkable   = CBool(False, help="checkable").tag(sync=True)
    multiple    = CBool(False, help="multiple").tag(sync=True)
    show_line   = CBool(False, help="show_line").tag(sync=True)
    draggable   = CBool(False, help="draggable").tag(sync=True)
    # TODO

class TreeNode(ReactWidget):
    _model_name      = Unicode('TreeNodeModel').tag(sync=True)
    disable_checkbox = CBool(False, help="disable_checkbox").tag(sync=True)
    disabled         = CBool(False, help="disabled").tag(sync=True)
    icon             = Instance('ipywidgets.widgets.domwidget.DOMWidget', default_value=None, allow_none=True)\
                            .tag(sync=True, **widget_serialization).tag(sync=True)
    is_leaf          = CBool(False, help="is_leaf").tag(sync=True)
    title            = Unicode('', help="title").tag(sync=True)
    key              = Unicode('0-0', help="key").tag(sync=True)
    selectable       = CBool(True, help="selectable").tag(sync=True)
    # TODO

class Tooltip(ReactWidget):
    _model_name = Unicode('TooltipModel').tag(sync=True)
    title       = Unicode(help="title").tag(sync=True)
    # TODO

class Tag(ReactWidget):
    _model_name = Unicode('TagModel').tag(sync=True)
    closable    = CBool(False, help="closable").tag(sync=True)
    color       = Unicode(help="color").tag(sync=True)
    visible     = CBool(True, help="visible").tag(sync=True)
    # TODO

class Tabs(ReactWidget):
    _model_name = Unicode('TabsModel').tag(sync=True)
    type        = Unicode('line', help="type").tag(sync=True)
    tab_position = Unicode('top', help="tab_position").tag(sync=True)
    size        = Unicode('default', help="size").tag(sync=True)
    # TODO

class TabPane(ReactWidget):
    _model_name = Unicode('TabPaneModel').tag(sync=True)
    tab         = Unicode(help="tab").tag(sync=True)
    key         = Unicode(help="key").tag(sync=True)
    # TODO

class Table(ReactWidget):
    _model_name = Unicode('TableModel').tag(sync=True)
    data_source = List(help="data_source").tag(sync=True)
    columns     = List(help="columns").tag(sync=True)
    bordered    = CBool(False, help="bordered").tag(sync=True)
    size        = Unicode('small', help="size").tag(sync=True)
    # TODO

class Timeline(ReactWidget):
    _model_name = Unicode('TimelineModel').tag(sync=True)
    pending = CBool(False, allow_none=True, help="pending").tag(sync=True)
    pending_dot = Unicode(None, allow_none=True, help="pending_dot").tag(sync=True)
    reverse = CBool(False, allow_none=True, help="reverse").tag(sync=True)
    mode = Unicode('left', allow_none=True, help="mode").tag(sync=True)

class TimelineItem(ReactWidget):
    _model_name = Unicode('TimelineItemModel').tag(sync=True)
    color = Unicode('blue', allow_none=True, help="color").tag(sync=True)
    dot = Unicode(None, allow_none=True, help="dot").tag(sync=True)

class Drawer(ReactWidget):
    _model_name = Unicode('DrawerModel').tag(sync=True)
    title = Unicode('Title', allow_none=True, help="title").tag(sync=True)
    placement = Unicode('right', allow_none=True, help="placement").tag(sync=True)
    visible = CBool(False, allow_none=True, help="visible").tag(sync=True)

class Model(ReactWidget):
    _model_name = Unicode('ModelModel').tag(sync=True)
    title = Unicode('Title', allow_none=True, help="title").tag(sync=True)
    visible = CBool(False, allow_none=True, help="visible").tag(sync=True)

class Popconfirm(ReactWidget):
    _model_name = Unicode('PopconfirmModel').tag(sync=True)
    title = Unicode('Title', allow_none=True, help="title").tag(sync=True)
