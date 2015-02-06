//VariantStatsWidget.prototype = new VariantWidget();

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

VariantStatsWidget.prototype = {
    render : function (targetId) {
        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;

        this.dbName = this.job.command.data['vcf-file'];
        this.dbName = this.dbName.substring(this.dbName.lastIndexOf('/') + 1);
        this.dbName = this.dbName + '.db';
        this.statsName = this.dbName.substring(0, this.dbName.lastIndexOf('.')) + '.json';

        this.optValues = Ext.create('Ext.data.Store', {
            fields: ['value', 'name'],
            data: [
                {"value": "<", "name": "<"},
                {"value": "<=", "name": "<="},
                {"value": ">", "name": ">"},
                {"value": ">=", "name": ">="},
                {"value": "=", "name": "="},
                {"value": "!=", "name": "!="}
            ],
            pageSize: 20
        });

        /* main panel */
        this.panel = this._createVariantPanel();

        this.rendered = true;
    },
    draw: function(){
        var _this = this;

        this.targetId.add(this.panel);

    },
    _getRegionList: function () {
        var regionList = Ext.create('Ext.form.field.TextArea', {
            id: this.id + "region_list",
            name: "region_list",
            emptyText: '1:1-1000000,2:1-1000000',
            margin: '0 0 0 5',
            value: "1:1-10000000",
            allowBlank: false,
            width:'100%'
        });

        return Ext.create('Ext.form.Panel', {
            border: true,
            bodyPadding: "5",
            margin: "0 0 5 0",
            flex:1,
            border: 0,
            buttonAlign: 'center',
            layout: 'vbox',
            items: [
                {
                xtype: 'tbtext', text: '<span class="info">Enter regions (comma separated)</span>'
            },
            regionList
            ]
        });
    },
    _getGenes: function () {
        var geneList = Ext.create('Ext.form.field.TextArea', {
            id: this.id + "genes",
            name: "genes",
            emptyText: 'BRCA2,PPL',
            margin: '0 0 0 5',
            allowBlank: false,
            width:'100%'
        });

        return Ext.create('Ext.form.Panel', {
            border: true,
            bodyPadding: "5",
            margin: "0 0 5 0",
            width: "100%",
            border: 0,
            buttonAlign: 'center',
            layout: 'vbox',
            items: [
                {
                xtype: 'tbtext', text: '<span class="info">Enter genes (comma separated)</span>'
            },
            geneList
            ]
        });
    },
    _getMissing: function () {
        var alleles_text = Ext.create('Ext.form.field.Text', {
            id: this.id + "miss_allele",
            name: "miss_allele",
            margin: '0 0 0 5',
            width: "20%",
            allowBlank: false
        });

        var alleles_opt = this._createCombobox("option_miss_alleles", "", this.optValues, 0, 10, '0 0 0 5');
        alleles_opt.width = "20%";

        var gt_text = Ext.create('Ext.form.field.Text', {
            id: this.id + "miss_gt",
            name: "miss_gt",
            margin: '0 0 0 5',
            allowBlank: false,
            width: "20%",
            value: 0
        });

        var gt_opt = this._createCombobox("option_miss_gt", "", this.optValues, 4, 10, '0 0 0 5');
        gt_opt.width = "20%";

        return Ext.create('Ext.form.Panel', {
            border: true,
            bodyPadding: "5",
            margin: "0 0 5 0",
            width: "100%",
            type: 'vbox',
            border: 0,
            items: [
                {
                xtype: 'tbtext', text: '<span class="emph">Missing Alleles</span>'
            },
            {
                xtype: 'fieldcontainer',
                margin: "0 0 5 0",

                layout: 'hbox',
                border: false,
                items: [alleles_opt, alleles_text] },
                {
                    xtype: 'tbtext', text: '<span class="emph">Missing genotypes</span>'
                },

                {
                    xtype: 'fieldcontainer',
                    margin: "0 0 5 0",
                    layout: 'hbox',
                    border: false,
                    items: [gt_opt, gt_text]}
            ]
        });
    },
    _getMAF: function () {
        var maf_text = Ext.create('Ext.form.field.Text', {
            id: this.id + "maf",
            name: "maf",
            margin: '0 0 0 5',
            width: "20%",
            allowBlank: false
        });

        var maf_opt = this._createCombobox("option_maf", "", this.optValues, 0, 10, '0 0 0 5');
        maf_opt.width = "20%";

        var mgf_text = Ext.create('Ext.form.field.Text', {
            id: this.id + "mgf",
            name: "mgf",
            margin: '0 0 0 5',
            allowBlank: false,
            width: "20%"
        });

        var mgf_opt = this._createCombobox("option_mgf", "", this.optValues, 0, 10, '0 0 0 5');
        mgf_opt.width = "20%";

        return Ext.create('Ext.form.Panel', {
            border: true,
            bodyPadding: "5",
            margin: "0 0 5 0",
            width: "100%",
            type: 'vbox',
            border: 0,
            items: [
                {
                xtype: 'tbtext', text: '<span class="emph">Allele freq.</span>'
            },
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                border: false,
                items: [
                    maf_opt,
                    maf_text]
            },
            {
                xtype: 'tbtext', text: '<span class="emph">Genotype freq.</span>'
            },

            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                border: false,
                items: [ mgf_opt, mgf_text]}
            ]
        });
    },
    _getMendelError: function () {
        var mendel_text = Ext.create('Ext.form.field.Text', {
            id: this.id + "mend_error",
            name: "mend_error",
            margin: '0 0 0 5',
            width: "20%",
            allowBlank: false
        });

        var mendel_opt = this._createCombobox("option_mend_error", "", this.optValues, 0, 10, '0 0 0 5');
        mendel_opt.width = "20%";

        return Ext.create('Ext.form.Panel', {
            bodyPadding: "5",
            margin: "0 0 5 0",
            width: "100%",
            buttonAlign: 'center',
            type: 'vbox',
            border: 0,
            items: [
                {
                xtype: 'tbtext', text: '<span class="emph">Mendelian Errors</span>'
            },
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                border: false,
                items: [mendel_opt, mendel_text]
            }
            ]

        });
    },
    _getIsIndel: function () {
        return Ext.create('Ext.form.Panel', {
            bodyPadding: "5",
            margin: "0 0 5 0",
            width: "99%",
            buttonAlign: 'center',
            layout: 'hbox',
            border: 0,
            items: [
                {
                xtype: 'tbtext',
                text: '<span class="emph">Is indel?</span>',
                margin: '5 0 0 5'
            },
            {
                xtype: 'checkboxfield',
                name: 'is_indel'

            }
            ]
        });
    },
    _getInheritance: function () {

        var cases_d = Ext.create('Ext.form.field.Text', {
            id: this.id + "cases_percent_dominant",
            name: "cases_percent_dominant",
            margin: '0 0 0 5',
            width: "20%",
            allowBlank: false
        });

        var cases_d_opt = this._createCombobox("option_cases_dom", "", this.optValues, 0, 10, '0 0 0 5');
        cases_d_opt.width = "20%";

        var controls_d = Ext.create('Ext.form.field.Text', {
            id: this.id + "controls_percent_dominant",
            name: "controls_percent_dominant",
            margin: '0 0 0 5',
            width: "20%",
            allowBlank: false
        });

        var controls_d_opt = this._createCombobox("option_controls_dom", "", this.optValues, 0, 10, '0 0 0 5');
        controls_d_opt.width = "20%";

        var cases_r = Ext.create('Ext.form.field.Text', {
            id: this.id + "cases_percent_recessive",
            name: "cases_percent_recessive",
            margin: '0 0 0 5',
            width: "20%",
            allowBlank: false
        });

        var cases_r_opt = this._createCombobox("option_cases_rec", "", this.optValues, 0, 10, '0 0 0 5');
        cases_r_opt.width = "20%";

        var controls_r = Ext.create('Ext.form.field.Text', {
            id: this.id + "controls_percent_recessive",
            name: "controls_percent_recessive",
            margin: '0 0 0 5',
            width: "20%",
            allowBlank: false
        });

        var controls_r_opt = this._createCombobox("option_controls_rec", "", this.optValues, 0, 10, '0 0 0 5');
        controls_r_opt.width = "20%";

        return Ext.create('Ext.form.Panel', {
            border: true,
            bodyPadding: "5",
            margin: "0 0 5 0",
            width: "100%",
            buttonAlign: 'center',
            type: 'vbox',
            border: 0,
            items: [
                {
                xtype: 'tbtext', text: '<span class="emph">% Cases Dominant</span>'
            },
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                border: false,
                items: [cases_d_opt, cases_d]
            },
            {
                xtype: 'tbtext', text: '<span class="emph">% Controls Dominant</span>'
            },
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                border: false,
                items: [controls_d_opt, controls_d]
            },
            {
                xtype: 'tbtext', text: '<span class="emph">% Cases Recessive</span>'
            },
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                border: false,
                items: [cases_r_opt, cases_r]
            },
            {
                xtype: 'tbtext', text: '<span class="emph">% Controls Recessive</span>'
            },
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                border: false,
                items: [controls_r_opt, controls_r]
            }
            ]
        });


    },
    _createCombobox: function (name, label, data, defaultValue, labelWidth, margin) {
        var _this = this;

        return Ext.create('Ext.form.field.ComboBox', {
            id: this.id + name,
            name: name,
            fieldLabel: label,
            store: data,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'value',
            value: data.getAt(defaultValue).get('value'),
            labelWidth: labelWidth,
            margin: margin,
            editable: false,
            allowBlank: false
        });
    },
}

VariantStatsWidget.prototype._createVariantPanel = function () {

    this.form = this._createForm();
    this.grid = this._createGrid();

    var panel = Ext.create('Ext.panel.Panel', {
        //title: 'Variants',
        width: '100%',
        height: '1000',
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
        {name: "chromosome", type: "string"},
        {name: "position", type: "int"},
        {name: "refAlleles", type: "string"},
        {name: "altAlleles", type: "string"},
        {name: 'maf', type: 'float'},
        {name: 'mgf', type: 'float'},
        {name: 'mafAllele', type: 'string'},
        {name: 'mgfAllele', type: 'string'},
        {name: 'missingAlleles', type: 'int'},
        {name: 'missingGenotypes', type: 'int'},
        {name: 'mendelinanErrors', type: 'int'},
        {name: 'indel', type: 'boolean'},
        {name: 'casesPercentDominant', type: 'float'},
        {name: 'controlsPercentDominant', type: 'float'},
        {name: 'casesPercentRecessive', type: 'float'},
        {name: 'controlsPercentRecessive', type: 'float'}
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
            }]
        }]});

                         return grid;
}

VariantStatsWidget.prototype._getResult = function () {

    var _this = this;

    var values = this.form.getForm().getValues();

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
            response = JSON.parse(response.response);

            if (response.length) {

                _this.st.loadData(response);
                _this.grid.getView().refresh();
                Ext.getCmp(_this.id + "numRowsLabel").setText(response.length + " variants");
                Utils.msg('Search', 'Sucessfully')

            }

            _this.grid.setLoading(false);

        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('no va');
            _this.grid.setLoading(false);
        }
    });
};
