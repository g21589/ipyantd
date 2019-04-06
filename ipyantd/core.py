import ipywidgets as widgets
from traitlets import Unicode, Instance, CBool, CInt, CFloat, HasTraits, Any, Dict
from ipywidgets.widgets.widget import widget_serialization
from ipywidgets.widgets.trait_types import TypedTuple
from .mixins import ClickMixin

class ValueMixin(HasTraits):
    value = Any(help="value of the widget").tag(sync=True, **widget_serialization)

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

class ButtonBase(ReactWidget, ClickMixin):
    description = Unicode(help="Button label.").tag(sync=True)

class Button(ButtonBase):
    _model_name = Unicode('ButtonModel').tag(sync=True)

class Switch(ButtonBase, ValueMixin):
    _model_name = Unicode('SwitchModel').tag(sync=True)
    checked = CBool(None, allow_none=True, help="checked or not").tag(sync=True)
    checked_children = Unicode('On', help="content to be shown when the state is checked").tag(sync=True)
    un_checked_children = Unicode('Off', help="content to be shown when the state is unchecked").tag(sync=True)

class Checkbox(ReactWidget):
    _model_name = Unicode('CheckboxModel').tag(sync=True)
    description = Unicode(help="Menu item").tag(sync=True)
    selected = CBool(help="selected or not").tag(sync=True)
    checked = CBool(help="checked or not").tag(sync=True)

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

#class Transfer(ReactWidget):
#   _model_name = Unicode('TransferModel').tag(sync=True)
    