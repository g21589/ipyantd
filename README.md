ipyantd
===============================

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