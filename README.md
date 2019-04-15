ipyantd
===============================
[![PyPI version](https://badge.fury.io/py/ipyantd.svg)](https://badge.fury.io/py/ipyantd)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/g21589/ipyantd/master?filepath=ipyantd_test.ipynb)

Ant Design Jupyter Widget

Installation
------------

To install use pip:

    $ pip install ipyantd
    $ jupyter nbextension enable --py --sys-prefix ipyantd


For a development installation (requires npm),

    $ git clone https://github.com//ipyantd.git
    $ cd ipyantd
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --sys-prefix ipyantd
    $ jupyter nbextension enable --py --sys-prefix ipyantd

Support Components
------------

|  Component | Support functions |
|:----------:|:-----------------:|
| Row & Col  |     essential     |
| Button     |     essential     |
| Switch     |     essential     |
| Checkbox   |     essential     |
| Select     |     essential     |
| DatePicker |     essential     |
| Progress   |     essential     |
| Steps      |     essential     |
