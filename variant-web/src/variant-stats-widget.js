VariantStatsWidget.prototype = new VariantWidget();

function VariantStatsWidget(args) {
    var _this = this;
    _.extend(this, Backbone.Events);

    this.id = Utils.genId("VariantStatsWidget");

    //set default args

    this.border = true;
    this.autoRender = false;
    this.targetId;
    this.width;
    this.height = '100%';
    this.closable = false;

    //set instantiation args, must be last
    _.extend(this, args);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
}

VariantStatsWidget.prototype.render = function (targetId) {
    var _this = this;
    this.targetId = (targetId) ? targetId : this.targetId;

    this.dbName = this.job.command.data['vcf-file'];
    this.dbName = this.dbName.substring(this.dbName.lastIndexOf('/') + 1);
//        this.dbName = this.dbName.substring(0, this.dbName.lastIndexOf('.')) + '.db';
    this.dbName = this.dbName + '.db';
    this.statsName = this.dbName.substring(0, this.dbName.lastIndexOf('.')) + '.json';

    this.rendered = true;


}

VariantStatsWidget.prototype.draw = function () {
    var _this = this;
//    OpencgaManager.poll({
//        accountId: $.cookie("bioinfo_account"),
//        sessionId: $.cookie("bioinfo_sid"),
//        filename: this.statsName,
//        jobId: this.job.id,
//        success: function (data, textStatus, jqXHR) {
//            _this.variantInfo = JSON.parse(data);
//
//            console.log(_this.variantInfo);
//            _this._draw();
//        }
//    });
    _this._draw();
}

VariantStatsWidget.prototype._updateInfo = function () {

};

VariantStatsWidget.prototype._createVariantPanel = function () {

    this.form = this._createForm();
    this.grid = this._createGrid();
    this.colSelector = this._createColumnSelector();

    var panel = Ext.create('Ext.panel.Panel', {
        // title: 'variants',
        width: '100%',
        height: '100%',
        bodyPadding: 20,
        border: 0,
        layout: {type: 'hbox', align: 'stretch'},
        cls: 'ocb-border-top-lightgrey',
        items: [
            {
                xtype: 'container',
                flex: 1,
                layout: 'fit',
                margin: '0 20 20 0',
                items: [
                    this.form
                ]
            },
            {
                xtype: 'container',
                flex: 7,
                layout: {type: 'vbox', align: 'stretch'},
                defaults: {
                    margin: '0 0 20 0',
                    flex: 1
                },
                items: [this.grid]
            }
        ]
    });

    return panel;
}

VariantStatsWidget.prototype._createSummaryPanel = function () {
    var panel = Ext.create('Ext.panel.Panel', {
        width: '100%',
        height: '100%',
        border: 0,
        layout: 'hbox',
        bodyPadding: 60,
        autoScroll: true,
        cls: 'ocb-border-top-lightgrey',
        html: "stats"
    });

    return panel;
}

VariantStatsWidget.prototype._createForm = function () {

    var _this = this;

    var accordion = Ext.create('Ext.form.Panel', {
        border: 1,
        flex: 1,
        height: "100%",
        title: "Filters",
        width: "100%",
        layout: {
            type: 'accordion',
            fill: false
        },
        tbar: {
            items: [
                {
                    xtype: 'button',
                    text: 'Reload',
                    handler: function () {
                        Ext.example.msg('Reload', 'Sucessfully')
                    }
                } ,
                {
                    xtype: 'button',
                    text: 'Clear',
                    handler: function () {
                        Ext.example.msg('Clear', 'Sucessfully')
                    }
                },
                '->',
                {
                    xtype: 'button',
                    text: 'Search',
                    handler: function () {
                        _this._getResult();
                    }
                }
            ]
        }
    });

    var regionItems = [
        this._getRegionList(),
    ];

    var geneItems = [
        this._getGenes(),
    ];

    var region = Ext.create('Ext.panel.Panel', {
        title: "Region",
        items: regionItems
    });

    var genes = Ext.create('Ext.panel.Panel', {
        title: "Gene",
        items: geneItems
    });

    var statsItems = [
        this._getMAF(),
        this._getMissing(),
        this._getMendelError(),
        this._getIsIndel(),
        this._getInheritance()
    ];

    var stats = Ext.create('Ext.panel.Panel', {
        title: "Stats",
        items: statsItems
    });

    var samplesInfo = [];

    var samples = Ext.create('Ext.panel.Panel', {
        title: 'Samples',
        items: samplesInfo,
        id: this.id + "samples_form_panel"
    });

    var controlsItems = [
        this._getControls()
    ];

    var controls = Ext.create('Ext.panel.Panel', {
        title: "Controls",
        items: controlsItems
    });

    var effectItems = [
        this._getConsequenceType()
    ];

    var effect = Ext.create('Ext.panel.Panel', {
        title: "Effect",
        items: effectItems
    });


    accordion.add(region);
    accordion.add(genes);
    accordion.add(stats);

    return accordion;
}

VariantStatsWidget.prototype._createGrid = function () {

    var _this = this;
    _this.columnsGrid = [
        {
            text: "Position",
            dataIndex: 'chromosome',
            flex: 1,
            xtype: "templatecolumn",
            tpl: "{chromosome}:{position}"
        },
        {
            text: "Alleles & Genotypes",
            flex: 3,
            columns: [
                {

                    text: "Rer Allele",
                    dataIndex: 'refAlleles',
                    flex: 1,
                    sortable: true
                },
                {
                    text: "Alt Alleles",
                    dataIndex: 'altAlleles',
                    flex: 0.2,
                    sortable: true
                },

                {
                    text: "MAF",
                    dataIndex: 'maf',
                    xtype: "templatecolumn",
                    tpl: "{maf:round(3)} ({mafAllele})",
                    flex: 1,
                    sortable: true
                },
                {
                    text: "MGF",
                    dataIndex: 'mgf',
                    xtype: "templatecolumn",
                    tpl: "{mgf:round(3)} ({mgfAllele})",
                    flex: 1,
                    sortable: true
                }
            ]
        },
        {
            text: "Missing Alleles/Genotypes",
            flex: 2,
            columns: [
                {
                    text: "Miss. Alleles",
                    dataIndex: 'missingAlleles',
                    flex: 1,
                    sortable: true
                },
                {
                    text: "Miss. Genotypes",
                    dataIndex: 'missingGenotypes',
                    flex: 1,
                    sortable: true
                }
            ]
        },
        {
            text: "Mendelian Errors",
            flex: 1,
            dataIndex: 'mendelinanErrors',
            sortable: true
        },
        {
            text: "Is indel?",
            flex: 1,
            xtype: 'booleancolumn',
            trueText: 'Yes',
            falseText: 'No',
            dataIndex: 'indel',
            sortable: true
        },
        {
            text: "Inheritance",
            flex: 4,
            columns: [
                {
                    text: "% Cases dominant",
                    dataIndex: 'casesPercentDominant',
                    xtype: "templatecolumn",
                    tpl: "{casesPercentDominant:round(2)}%",
                    sortable: true,
                    flex: 1
                },
                {
                    text: "% Controls dominant",
                    dataIndex: 'controlsPercentDominant',
                    xtype: "templatecolumn",
                    tpl: "{controlsPercentDominant:round(2)}%",
                    sortable: true,
                    flex: 1
                },
                {
                    text: "% Cases recessive",
                    dataIndex: 'casesPercentRecessive',
                    xtype: "templatecolumn",
                    tpl: "{casesPercentRecessive:round(2)}%",
                    sortable: true,
                    flex: 1
                },
                {
                    text: "% Controls recessive",
                    dataIndex: 'controlsPercentRecessive',
                    xtype: "templatecolumn",
                    tpl: "{controlsPercentRecessive:round(2)}%",
                    sortable: true,
                    flex: 1
                }
            ]
        }
    ];
    _this.attributes = [
        {name: "chromosome", type: "String"},
        {name: "position", type: "int"},
        {name: "refAlleles", type: "String"},
        {name: "altAlleles", type: "auto"},
        {name: 'maf', type: 'float'},
        {name: 'mgf', type: 'double'},
        {name: 'mafAllele', type: 'string'},
        {name: 'mgfAllele', type: 'string'},
        {name: 'missingAlleles', type: 'int'},
        {name: 'missingGenotypes', type: 'int'},
        {name: 'mendelinanErrors', type: 'int'},
        {name: 'indel', type: 'boolean'},
        {name: 'casesPercentDominant', type: 'double'},
        {name: 'controlsPercentDominant', type: 'double'},
        {name: 'casesPercentRecessive', type: 'double'},
        {name: 'controlsPercentRecessive', type: 'double'},
    ];
    _this.model = Ext.define('Variant', {
        extend: 'Ext.data.Model',
        fields: _this.attributes
    });
    _this.st = Ext.create('Ext.data.Store', {
        model: _this.model,
        groupField: 'gene_name',
        data: [],
        autoLoad: false,
        proxy: {type: 'memory'},
        pageSize: 5

    });
    var groupingFeature = Ext.create('Ext.grid.feature.Grouping', {
        groupHeaderTpl: '{groupField}: {groupValue} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})',
        enableGroupingMenu: false
    });
    var grid = Ext.create('Ext.grid.Panel', {
            title: '<span class="ssel">Variant Info</span>',
            flex: 1,
            height: '100%',
            //width: '100%',
            store: _this.st,
            loadMask: true,
            border: 1,
            columns: this.columnsGrid,
            plugins: 'bufferedrenderer',
            loadMask: true,
            features: [
                {ftype: 'summary'}
            ],
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'bottom',
                    items: [
                        {
                            xtype: 'tbtext',
                            id: this.id + "numRowsLabel"
                        },
                        '->',
                        {
                            xtype: 'button',
                            text: 'Columns',
                            id: this.id + "gridColSelectorBtn",
                            menu: {
                                width: 150,
                                margin: '0 0 10 0',
                                id: this.id + "gridColSelectorMenu",
                                plain: true,
                                items: []
                            }

                        },
                        {
                            xtype: 'button',
                            text: 'Export data...',
                            handler: function () {
                                if (!Ext.getCmp(_this.id + "exportWindow")) {
                                    var cbgItems = [];
                                    var attrList = _this._getColumnNames();

                                    cbgItems.push({
                                        boxLabel: attrList[0],
                                        name: 'attr',
                                        inputValue: attrList[0],
                                        checked: true,
                                        disabled: true
                                    });

                                    for (var i = 1; i < attrList.length; i++) {
                                        cbgItems.push({
                                            boxLabel: attrList[i],
                                            name: 'attr',
                                            inputValue: attrList[i],
                                            checked: true
                                        });
                                    }

                                    Ext.create('Ext.window.Window', {
                                        id: _this.id + "exportWindow",
                                        title: "Export attributes",
                                        height: 250,
                                        maxHeight: 250,
                                        width: 400,
                                        autoScroll: true,
                                        layout: "vbox",
                                        modal: true,
                                        items: [
                                            {
                                                xtype: 'checkboxgroup',
                                                id: _this.id + "cbgAttributes",
                                                layout: 'vbox',
                                                items: cbgItems
                                            }
                                        ],
                                        buttons: [
                                            {
                                                xtype: 'textfield',
                                                id: _this.id + "fileName",
                                                emptyText: "enter file name",
                                                flex: 1
                                            },
                                            {
                                                text: 'Download',
                                                href: "none",
                                                handler: function () {
                                                    var fileName = Ext.getCmp(_this.id + "fileName").getValue();
                                                    if (fileName == "") {
                                                        fileName = "variants";
                                                    }
                                                    var columns = Ext.getCmp(_this.id + "cbgAttributes").getChecked();

                                                    var content = _this._exportToTab(columns);

                                                    this.getEl().set({
                                                        href: 'data:text/csv,' + encodeURIComponent(content),
                                                        download: fileName + ".txt"
                                                    });
                                                }
                                            }
                                        ]
                                    }).show();
                                }
                            }
                        }
                    ]
                }
            ],
            listeners: {
                afterrender: function () {
                    var btn = Ext.getCmp(_this.id + "gridColSelectorMenu");
                    btn.add(_this.colSelector);
                }
            }
        }
    );

    return grid;
}

VariantStatsWidget.prototype._getResult = function () {


    var _this = this;

    var values = this.form.getForm().getValues();

    console.log(values);

    var formParams = {};
    for (var param in values) {
        if (formParams[param]) {
            var aux = [];
            aux.push(formParams[param]);
            aux.push(values[param]);
            formParams[param] = aux;
        } else {
            formParams[param] = values[param];
        }
    }

    _this.grid.setLoading(true);

    // Remove all elements from grids
    _this.grid.store.removeAll();

    OpencgaManager.variantStats({
        accountId: $.cookie("bioinfo_account"),
        sessionId: $.cookie("bioinfo_sid"),
        fileName: this.dbName,
        jobId: this.job.id,
        formData: formParams,
        success: function (response, textStatus, jqXHR) {
            console.log("Variant stats");
            console.log(response);
            if (response.length) {

                _this.st.loadData(response);
                _this.grid.getView().refresh();
                Ext.getCmp(_this.id + "numRowsLabel").setText(response.length + " variants");
                _this._updateInfoVariantMini(response);
                Ext.example.msg('Search', 'Sucessfully')

            }

            _this.grid.setLoading(false);

        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('no va');
            _this.grid.setLoading(false);
        }
    });
};