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

VariantMergeForm.prototype = new GenericFormPanel();

function VariantMergeForm(args) {
    args.analysis = 'hpg-variant.vcf-merge';
    args.border = false;
    GenericFormPanel.prototype.constructor.call(this, args);

    this.id = Utils.genId("VariantMergeForm");
    this.headerWidget = this.webapp.headerWidget;
    this.opencgaBrowserWidget = this.webapp.headerWidget.opencgaBrowserWidget;

    this.file_id = 0;
}

VariantMergeForm.prototype.beforeRun = function () {
    this.paramsWS["vcf-list"] = this.paramsWS["vcf-file"].join(",");

    delete this.paramsWS["vcf-file"];
    this.paramsWS["config"] = "/httpd/bioinfo/opencga/analysis/hpg-variant/bin";

    if (this.testing) {
        console.log("Watch out!!! testing flag is on, so job will not launched.")
    }
};


VariantMergeForm.prototype.getPanels = function () {
    var items = [
        //this._getSpeciesForm(),
        this._getBrowseInputForm(),
        //this._getBrowseOutputForm(),
        this._getParametersForm()
    ];

    var form = Ext.create('Ext.panel.Panel', {
        margin: "15 0 5 0",
        border: false,
        buttonAlign: 'center',
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


VariantMergeForm.prototype._getExampleForm = function () {
    var _this = this;


    var example1 = Ext.create('Ext.container.Container', {
        layout: 'hbox',
        items: [
            {
                xtype: 'button',
                width: this.labelWidth,
                text: 'Load example 1',
                handler: function () {
                    _this.loadExample1();
                    Utils.msg("Example 1", "Loaded");
                }
            },
            {
                xtype: 'box',
                margin: '5 0 0 15',
                html: 'VCF file with ~3500 variants'

            }
        ]
    });

    var exampleForm = Ext.create('Ext.panel.Panel', {
        bodyPadding: 10,
        title: 'Examples',
        header: this.headerFormConfig,
        border: this.formBorder,
        items: [example1],
        defaults: {margin: '5 0 0 0'},
        margin: '0 0 10 0'
    });

    return exampleForm;
};


VariantMergeForm.prototype._getSpeciesForm = function () {
    var _this = this;

    var speciesForm = Ext.create('Ext.panel.Panel', {
        title: "Species",
        header: this.headerFormConfig,
        border: this.border,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: []
    });

    $.ajax({url: CELLBASE_HOST + "/latest/species?of=json", success: function (data, textStatus, jqXHR) {
        // Create the combo box, attached to the states data store
        var objdata = JSON.parse(data);
        for (var i = 0; i < objdata.length; i++) {
            objdata[i].sciAsembly = objdata[i].scientific + " (" + objdata[i].assembly + ")";
        }
        var species = Ext.create('Ext.data.Store', {
            autoLoad: true,
            fields: ['species', 'common', 'scientific', 'assembly', 'sciAsembly'],
            data: objdata
        });
        var speciesCombo = Ext.create('Ext.form.field.ComboBox', {
            id: _this.id + "speciesCombo",
            name: 'species',
            fieldLabel: 'Choose Species',
            displayField: 'sciAsembly',
            valueField: 'species',
            editable: false,
            width: 350,
            allowBlank: false,
            store: species,
            listeners: {
                //change: function () {
                //if (this.getValue()) {
                //checkFlags(this.getValue());
                //}
                //}
            }
        });
        speciesCombo.select(speciesCombo.getStore().data.items[0]);
        speciesForm.add(speciesCombo);
    }, error: function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
    }});

    return speciesForm;
};


VariantMergeForm.prototype._getBrowseInputForm = function () {
    var _this = this;

    this.addVcfFilebutton = Ext.create('Ext.button.Button', {
        text: "Add file",
        margin: '5 0 0 ' + (this.labelWidth + 5),
        handler: function () {
            _this.file_id++;
            var file = _this.createOpencgaBrowserCmp({
                fieldLabel: 'Input VCF file',
                dataParamName: 'vcf-file',
                id: this.id + '_vcf-file_' + _this.file_id,
                mode: 'fileSelection',
                allowedTypes: ['vcf'],
                allowBlank: false
            });
            _this.filesFieldContainer.add(file);
        }
    });
    this.removeVcfFilebutton = Ext.create('Ext.button.Button', {
        text: "Remove file",
        margin: '5 0 0 10',
        handler: function () {
            var childs = _this.filesFieldContainer.query('>*');
            if (childs.length > 2) {
                _this.file_id--;
                _this.filesFieldContainer.remove(_this.filesFieldContainer.query('>*:last')[0]);
            }
        }
    });

    this.filesFieldContainer = Ext.create('Ext.form.FieldContainer', {
        items: [
            this.createOpencgaBrowserCmp({
                fieldLabel: 'Input VCF file',
                dataParamName: 'vcf-file',
                id: this.id + 'vcf-file-1',
                mode: 'fileSelection',
                allowedTypes: ['vcf'],
                allowBlank: false
            }),
            this.createOpencgaBrowserCmp({
                fieldLabel: 'Input VCF file',
                dataParamName: 'vcf-file',
                id: this.id + 'vcf-file-2',
                mode: 'fileSelection',
                allowedTypes: ['vcf'],
                allowBlank: false
            })
        ]
    });

    var form = Ext.create('Ext.form.Panel', {
        title: "Input",
        header: this.headerFormConfig,
        border: this.border,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [
            this.filesFieldContainer,
            this.addVcfFilebutton,
            this.removeVcfFilebutton
        ]
    });


    return form;
};

VariantMergeForm.prototype._getParametersForm = function () {
    var _this = this;
    var ref = Ext.create('Ext.form.field.Radio', {
        id: "ref" + "_" + this.id,
        boxLabel: 'Reference (0/0)',
        inputValue: 'reference',
        checked: true,
        name: 'missing-mode'
    });

    var mis = Ext.create('Ext.form.field.Radio', {
        id: "mis" + "_" + this.id,
        boxLabel: 'Missing (./.)',
        inputValue: 'missing',
        name: 'missing-mode'

    });

    var radioGroup = Ext.create('Ext.form.RadioGroup', {
        fieldLabel: 'Fill empty variant/sample relationships as',
        labelWidth: this.labelWidth,
        width: 500,
        items: [ref, mis]
    });

    var info = {
        xtype: 'checkbox',
        boxLabel: 'Copy old INFO to samples',
        name: 'copy-info',
        inputValue: '',
        checked: false
    };

    var filter = {
        xtype: 'checkbox',
        boxLabel: 'Copy olf FILTER to samples',
        name: 'copy-filter',
        inputValue: '',
        checked: false
    };

    var strict_ref = {
        xtype: 'checkbox',
        boxLabel: 'Enforce same reference in all files',
        name: 'scrict-ref',
        inputValue: '',
        checked: false
    };

    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Parameters",
        header: this.headerFormConfig,
        border: this.formBorder,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [ radioGroup, info, filter, strict_ref]
    });

    return formBrowser;

};


//VariantMergeForm.prototype._getBrowseOutputForm = function () {
//    var _this = this;
//    var file = Ext.create('Ext.form.field.Text', {
//        id: this.id + "output-file",
//        fieldLabel: 'Output',
//        name: 'output-file',
//        width: 500
//    });
//
//    var folder = _this.createOpencgaBrowserCmp({
//        fieldLabel: 'Output folder:',
//        dataParamName: 'output-folder',
//        //  id: this.id + 'vcf-file',
//        mode: 'fileSelection',
//        allowedTypes: ['vcf'],
//        //allowBlank: false
//    });
//
//    var formBrowser = Ext.create('Ext.panel.Panel', {
//        title: "Output",
//        header: this.headerFormConfig,
//        border: this.border,
//        padding: "5 0 0 0",
//        bodyPadding: 10,
//        items: [
//            file,
//            folder
//        ]
//    });
//
//    return formBrowser;
//};

VariantMergeForm.prototype.loadExample1 = function () {
    this.clean();

    Ext.getCmp(this.id + 'vcf-file-1').setValue('file_1.vcf');
    Ext.getCmp(this.id + 'vcf-file-1' + 'hidden').setValue('example_file_1.vcf');

    Ext.getCmp(this.id + 'vcf-file-2').setValue('file_2.vcf');
    Ext.getCmp(this.id + 'vcf-file-2' + 'hidden').setValue('example_file_2.vcf');


    Ext.getCmp(this.id + 'jobname').setValue("VCF example");
    Ext.getCmp(this.id + 'jobdescription').setValue("VCF example");
};

