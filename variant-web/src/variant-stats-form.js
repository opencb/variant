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

    this.uniqueFieldMap = {};
    this.samplesStore = Ext.create('Ext.data.Store', {
        fields: ['name', 'value'],
        data: []
    });

}

VariantStatsForm.prototype.beforeRun = function () {
    if (this.testing) {
        console.log("Watch out!!! testing flag is on, so job will not launched.")
    }

    if (this.paramsWS["ped-file"] == "") {
        delete this.paramsWS["ped-file"];
    }
    if (this.paramsWS["out"] == "") {
        delete this.paramsWS["out"];
    }

    if (this.parametersCheckbox.getValue()) {
        if (this.customGroupsCheckbox.getValue()) {
            var groups = [];
            if (!Array.isArray(this.paramsWS["other-variable-groups"])) {
                this.paramsWS["other-variable-groups"] = [this.paramsWS["other-variable-groups"]];
            }
            for (var i = 0; i < this.paramsWS["other-variable-groups"].length; i++) {
                var group = this.paramsWS["other-variable-groups"][i];
                if (group !== '') {
                    group = group.replace(/\s/gi, '');
                    group = group.replace(/;/gi, ',');
                    group = _.uniq(group.split(',')).join(',');

                    groups.push(group)
                }
            }
            if (groups.length > 1) {//at least 2 groups
                this.paramsWS["variable-group"] = '"'+groups.join(";")+'"';
            }else{
                delete this.paramsWS["variable-group"];
            }
        }
    } else {
        delete this.paramsWS["variable"];
        delete this.paramsWS["variable-group"];
    }

    delete this.paramsWS["other-variable-groups"];
    delete this.paramsWS["remove_param"];

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

VariantStatsForm.prototype._getExampleForm = function () {
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
    var example2 = Ext.create('Ext.container.Container', {
        layout: 'hbox',
        items: [
            {
                xtype: 'button',
                width: this.labelWidth,
                text: 'Load example 1',
                handler: function () {
                    _this.loadExample2();
                    Utils.msg("Example 2", "Loaded");
                }
            },
            {
                xtype: 'box',
                margin: '5 0 0 15',
                html: 'VCF file with 4000 variants and 147 samples'

            }
        ]
    });


    var exampleForm = Ext.create('Ext.panel.Panel', {
        bodyPadding: 10,
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
                start: -1,
                limit: -1,
                success: function (data) {
                    _this._parsePED(data);
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
    this.samplesGroupingCombo = Ext.create('Ext.form.field.ComboBox', {
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
//                this.select(this.getStore().getAt(0));
            },
            change: function (field, e) {
                var value = field.getValue();
                if (value != null) {
                    _this.cleanGroups();
                    _this.variablesBox.setValue(Object.keys(_this.uniqueFieldMap[value]).join(', '));
                }
            }
        }
    });

    this.parametersCheckbox = Ext.create('Ext.form.field.Checkbox', {
        name: 'remove_param',
        boxLabel: 'I Want per-group report in addition to global statistics',
        disabled: true,
        handler: function () {
            if (this.getValue()) {
                this.nextSibling().show();
            } else {
                this.nextSibling().hide();
            }
        }
    });

    this.customGroupsCheckbox = Ext.create('Ext.form.field.Checkbox', {
        boxLabel: 'Create custom groups',
        name: 'remove_param',
        handler: function () {
            if (this.getValue()) {
                _this.groupsFieldContainer.show();
                _this.addGroupButton.show();
                _this.removeGroupButton.show();
                _this.variablesBox.show();
            } else {
                _this.groupsFieldContainer.hide();
                _this.addGroupButton.hide();
                _this.removeGroupButton.hide();
                _this.variablesBox.hide();
            }
        }
    });

    this.groupsFieldContainer = Ext.create('Ext.form.FieldContainer', {
        hidden: true,
        items: [
            {
                xtype: 'textfield',
                fieldLabel: 'Group',
                labelWidth: this.labelWidth,
                name: 'other-variable-groups',
                emptyText: 'separated by comma',
                validator: function (value) {
                    return _this._variableGroupValidator(value)
                }
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Group',
                labelWidth: this.labelWidth,
                name: 'other-variable-groups',
                emptyText: 'separated by comma',
                validator: function (value) {
                    return _this._variableGroupValidator(value)
                }
            }
        ]
    });

    this.addGroupButton = Ext.create('Ext.button.Button', {
        text: 'Add group',
        hidden: true,
        margin: '5 0 0 ' + (this.labelWidth + 5),
        handler: function () {
            _this.groupsFieldContainer.add({
                xtype: 'textfield',
                fieldLabel: 'Group',
                labelWidth: _this.labelWidth,
                name: 'other-variable-groups',
                emptyText: 'separated by comma',
                validator: function (value) {
                    return _this._variableGroupValidator(value)
                }
            })
        }
    });
    this.removeGroupButton = Ext.create('Ext.button.Button', {
        text: "Remove group",
        hidden: true,
        margin: '5 0 0 10',
        handler: function () {
            var childs = _this.groupsFieldContainer.query('>*');
            if(childs.length > 2){
                _this.groupsFieldContainer.remove(_this.groupsFieldContainer.query('>*:last')[0]);
            }
        }
    });

    this.variablesBox = Ext.create('Ext.form.field.TextArea', {
        name: 'remove_param',
        grow: true,
        hidden: true,
        labelWidth: _this.labelWidth,
        fieldLabel: 'Values found',
        height: 100,
        width: 450,
        fieldStyle: {
            color: 'gray'
        },
        editable: false
    });

    this.groupingFieldContainer = Ext.create('Ext.form.FieldContainer', {
        hidden: true,
        items: [
            this.samplesGroupingCombo,
            this.customGroupsCheckbox,
            this.variablesBox,
            this.groupsFieldContainer,
            this.addGroupButton,
            this.removeGroupButton
        ]
    });


    var form = Ext.create('Ext.form.Panel', {
        title: 'Parameters <span style="font-size:13px;color:grey">(Valid PED file required)</span>',
        header: this.headerFormConfig,
        border: this.border,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [
            this.parametersCheckbox,
            this.groupingFieldContainer
        ]
    });

    return form;
};


VariantStatsForm.prototype.loadExample1 = function () {
    this.clean();
    this.cleanParameters();

    Ext.getCmp(this.id + 'vcf-file').update('<span class="emph">Example 1.vcf</span>', false);
    Ext.getCmp(this.id + 'vcf-file' + 'hidden').setValue('example_1000genomes_5000_variants.vcf');

    Ext.getCmp(this.id + 'ped-file').update('No file selected', false);
    Ext.getCmp(this.id + 'ped-file' + 'hidden').setValue('');

    Ext.getCmp(this.id + 'jobname').setValue("VCF Stats example 3500");
    Ext.getCmp(this.id + 'jobdescription').setValue("example");
};

VariantStatsForm.prototype.loadExample2 = function () {
    this.clean();
    this.cleanParameters();

    Ext.getCmp(this.id + 'vcf-file').update('<span class="emph">Example 2.vcf</span>', false);
    Ext.getCmp(this.id + 'vcf-file' + 'hidden').setValue('example_4K_variants_147_samples.vcf');

    Ext.getCmp(this.id + 'ped-file').update('<span class="emph">Example 2.ped</span>', false);
    Ext.getCmp(this.id + 'ped-file' + 'hidden').setValue('example_4K_variants_147_samples.ped');

    Ext.getCmp(this.id + 'jobname').setValue("VCF Stats example 4000");
    Ext.getCmp(this.id + 'jobdescription').setValue("example");
};

VariantStatsForm.prototype.cleanParameters = function () {
    this.parametersCheckbox.setValue(false);
    this.parametersCheckbox.disable();
    this.cleanGroups();
    this.samplesStore.removeAll();
};
VariantStatsForm.prototype.cleanGroups = function () {
    this.groupsFieldContainer.removeAll();
    this.addGroupButton.el.dom.click();
    this.addGroupButton.el.dom.click();
};

VariantStatsForm.prototype._parsePED = function (data) {
    var fieldsPosition = {};
    this.uniqueFieldMap = {};


    var lines = data.split('\n');
    if (lines.length > 0) {
        var line = lines[0];
        if (line.charAt(0) === '#') {
            this.parametersCheckbox.enable();
            var fields = line.substr(1).split('\t');
            var fieldNames = [];
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                fieldsPosition[i] = field;
                this.uniqueFieldMap[field] = {};
                fieldNames.push({name: field, value: field});
            }
            this.samplesStore.loadData(fieldNames);

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line !== '' && line.charAt(0) !== '#') {
                    var fields = line.split('\t');
                    for (var j = 0; j < fields.length; j++) {
                        var field = fields[j];
                        this.uniqueFieldMap[fieldsPosition[j]][field] = true;
                    }
                }
            }


            var phenotypeRecord = this.samplesStore.getAt(5);
            if (phenotypeRecord) {
                this.samplesGroupingCombo.select(phenotypeRecord);
            } else {
                this.cleanParameters()
            }
        } else {
            this.cleanParameters()
        }


    }
};


VariantStatsForm.prototype._variableGroupValidator = function (value) {
    if (value == '') return true;

    var field = this.samplesGroupingCombo.getValue();
    var tokens = value.split(',');
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if (!this.uniqueFieldMap[field][token]) {
            return false;
        }
    }
    return true;
};