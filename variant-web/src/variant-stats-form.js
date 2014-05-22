/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

VariantStatsForm.prototype = new GenericFormPanel();

function VariantStatsForm(args) {
    args.analysis = 'hpg-variant.vcf-stats';
    args.border = false;
    GenericFormPanel.prototype.constructor.call(this, args);

    this.id = Utils.genId("VariantStatsForm");
    this.headerWidget = this.webapp.headerWidget;
    this.opencgaBrowserWidget = this.webapp.headerWidget.opencgaBrowserWidget;


    this.samplesData = [
        {name: 'Phenotype', value: 'phenotype'},
        {name: 'Family ID', value: 'Family ID'},
        {name: 'Individual ID', value: 'Individual ID'},
        {name: 'Paternal ID', value: 'Paternal ID'},
        {name: 'Maternal ID', value: 'Maternal ID'},
        {name: 'Gender', value: 'Gender'}
        //    Population      Other info      Relationships from Pemberton et al AJHG 2010
    ];
    this.samplesStore = Ext.create('Ext.data.Store', {
        fields: ['name', 'value'],
        data: this.samplesData
    });

}

VariantStatsForm.prototype.beforeRun = function () {

    if (this.testing) {
        console.log("Watch out!!! testing flag is on, so job will not launched.")
    }

    if (this.paramsWS["ped-file"] == "") {
        delete this.paramsWS["ped-file"];
    }
    this.paramsWS["db"] = "";
    this.paramsWS["config"] = "/httpd/bioinfo/opencga/analysis/hpg-variant/bin";

    console.log(this.paramsWS);
    console.log(this.analysis);

};


VariantStatsForm.prototype.getPanels = function () {
    var items = [
        this._getBrowseInputForm(),
        this._getBrowseOutputForm(),
        this._getParametersForm()
    ];

    var form = Ext.create('Ext.panel.Panel', {
        margin: "15 0 5 0",
        border: false,
//		layout:{type:'vbox', align: 'stretch'},
        buttonAlign: 'center',
        width: "99%",
        //height:900,
        //width: "600",
        items: items,
        defaults: {
            margin: '0 0 15 0'
        }
    });

    return [
        this._getExampleForm(),
        form
    ];
};

VariantStatsForm.prototype._getExampleForm = function () {
    var _this = this;

    var example1 = Ext.create('Ext.Component', {
        html: '<span class="s110"><span class="btn btn-default">Load</span> &nbsp; VCF file with ~3500 variants</span>',
        cls: 'dedo',
        listeners: {
            afterrender: function () {
                this.getEl().on("click", function () {
                    _this.loadExample1();
                    Utils.msg("Example loaded", "");
                });

            }
        }
    });
    var example2 = Ext.create('Ext.Component', {
        html: '<span class="s110"><span class="btn btn-default">Load</span> &nbsp; VCF file with 4000 variants and 147 samples</span>',
        cls: 'dedo',
        listeners: {
            afterrender: function () {
                this.getEl().on("click", function () {
                    _this.loadExample2();
                    Utils.msg("Example loaded", "");
                });

            }
        }
    });

    var exampleForm = Ext.create('Ext.panel.Panel', {
        bodyPadding: 10,
        cls: 'bootstrap',
        title: 'Examples',
        header: this.headerFormConfig,
        border: this.formBorder,
        items: [example1, example2],
        defaults: {margin: '5 0 0 0'},
        margin: '0 0 10 0'
    });

    return exampleForm;
};


VariantStatsForm.prototype._getBrowseInputForm = function () {
    var _this = this;

    var pedCont = this.createOpencgaBrowserCmp({
        fieldLabel: 'Input PED file',
        dataParamName: 'ped-file',
        id: this.id + 'ped-file',
        mode: 'fileSelection',
        allowedTypes: ['ped'],
        allowBlank: true,
        onSelect: function (selectEv) {
            OpencgaManager.pollObject({
                accountId: $.cookie("bioinfo_account"),
                sessionId: $.cookie("bioinfo_sid"),
                bucketId: selectEv.bucketId,
                objectId: selectEv.idQuery,
                start: 0,
                limit: 1,
                success: function (data) {
                    var lines = data.split('\n');
                    if (lines.length > 0) {
                        var line = lines[0];
                        if (line.charAt(0) === '#') {
                            var fields = line.substr(1).split('\t');
                            var newSamples = [];
                            for (var i = 6; i < fields.length; i++) {
                                var field = fields[i];
                                newSamples.push({name: field, value: field});
                            }
                            var data = _this.samplesData.concat(newSamples);
                            _this.samplesStore.loadData(data);
                        }
                    }
                }
            });
        }
    });

    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Input",
        header: this.headerFormConfig,
        border: this.border,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [
            this.createOpencgaBrowserCmp({
                fieldLabel: 'Input VCF file',
                dataParamName: 'vcf-file',
                id: this.id + 'vcf-file',
                mode: 'fileSelection',
                allowedTypes: ['vcf'],
                allowBlank: false
            }),
            pedCont
        ]
    });
    return formBrowser;
};

VariantStatsForm.prototype._getBrowseOutputForm = function () {
    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Output",
        //cls:'panel-border-top',
        header: this.headerFormConfig,
        border: this.border,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [
            {
                xtype: 'textfield',
                id: this.id + "out",
                fieldLabel: 'File names prefix',
                labelWidth: this.labelWidth,
                name: 'out'
            },
//            this.createOpencgaBrowserCmp({
//                fieldLabel: 'Folder',
//                dataParamName: 'output-folder',
//                id: this.id + 'outputFolder',
//                mode: 'fileSelection',
////                allowedTypes: ['ped'],
//                allowBlank: true
//            })
        ]
    });

    return formBrowser;
};

VariantStatsForm.prototype._getParametersForm = function () {
    var _this = this;
    var samplesGrouping = Ext.create('Ext.form.field.ComboBox', {
        fieldLabel: 'Variable to use for samples grouping',
        labelWidth: this.labelWidth,
        labelAlign: 'left',
        name: 'variable',
        store: this.samplesStore,
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'value',
        queryMode: 'local',
        forceSelection: true,
        listeners: {
            afterrender: function () {
                this.select(this.getStore().getAt(0));
            },
            change: function (field, e) {
                var value = field.getValue();
                if (value != null) {
                    //?
                }
            }
        }
    });

    var otherRecord;

    var valuesGrouping = Ext.create('Ext.form.field.ComboBox', {
        fieldLabel: 'Values of the variable for grouping',
        labelWidth: this.labelWidth,
        labelAlign: 'left',
        name: 'variable',
        store: Ext.create('Ext.data.Store', {
            fields: ['name', 'value'],
            data: [
                {name: '1, 2', value: '1,2'},
                {name: '0, 1', value: '0,1'},
                {name: 'Other', value: 'other'}
            ]
        }),
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'value',
        queryMode: 'local',
        forceSelection: true,
        listeners: {
            afterrender: function () {
                this.select(this.getStore().getAt(0));
                otherRecord = this.getStore().getAt(2)
            },
            change: function (t, newValue, oldValue, eOpts) {
                var record = this.findRecordByValue(newValue);
                if (newValue === 'other') {
                    this.nextSibling().show();
                    this.nextSibling().nextSibling().show();
                } else {
                    this.nextSibling().hide();
                    this.nextSibling().nextSibling().hide();
                }
            }
        }
    });

    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Parameters",
        //cls:'panel-border-top',
        header: this.headerFormConfig,
        border: this.border,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [
            {
                xtype: 'checkbox',
                boxLabel: 'I want per-group report appart from global statistics',
                name: 'topping',
                inputValue: '1',
                id: 'checkbox1',
                handler: function () {
                    if (this.getValue()) {
                        this.nextSibling().show();
                    } else {
                        this.nextSibling().hide();
                    }
                }
            },
            {
                xtype: 'fieldcontainer',
                hidden: true,
                items: [
                    samplesGrouping,
                    valuesGrouping,
                    {
                        xtype: 'fieldcontainer',
                        hidden: true,
                        items: [
                            {
                                xtype: 'textfield',
                                fieldLabel: 'Other groups',
                                labelWidth: this.labelWidth,
                                emptyText: 'separated by comma'
                            }
                        ]
                    },
                    {
                        xtype: 'button',
                        text: 'Add group',
                        hidden: true,
                        margin: '5 0 0 ' + (this.labelWidth + 5),
                        handler: function () {
                            this.up().child('fieldcontainer').add({
                                xtype: 'textfield',
                                fieldLabel: 'Group',
                                labelWidth: _this.labelWidth,
                                emptyText: 'separated by comma'
                            })
                        }
                    }
                ]
            }
        ]
    });

    return formBrowser;
};


VariantStatsForm.prototype.loadExample1 = function () {

    Ext.getCmp(this.id + 'vcf-file').update('<span class="emph">Example 1.vcf</span>', false);
    Ext.getCmp(this.id + 'vcf-file' + 'hidden').setValue('example_1000genomes_5000_variants.vcf');

    Ext.getCmp(this.id + 'ped-file').update('No file selected', false);
    Ext.getCmp(this.id + 'ped-file' + 'hidden').setValue('');

    Ext.getCmp(this.id + 'jobname').setValue("VCF Stats example");
    Ext.getCmp(this.id + 'jobdescription').setValue("VCF Stats example");
};

VariantStatsForm.prototype.loadExample2 = function () {
    Ext.getCmp(this.id + 'vcf-file').update('<span class="emph">Example 2.vcf</span>', false);
    Ext.getCmp(this.id + 'vcf-file' + 'hidden').setValue('example_4K_variants_147_samples.vcf');

    Ext.getCmp(this.id + 'ped-file').update('<span class="emph">Example 2.ped</span>', false);
    Ext.getCmp(this.id + 'ped-file' + 'hidden').setValue('example_4K_variants_147_samples.ped');


    Ext.getCmp(this.id + 'jobname').setValue("VCF Stats example");
    Ext.getCmp(this.id + 'jobdescription').setValue("VCF Stats example");
};
