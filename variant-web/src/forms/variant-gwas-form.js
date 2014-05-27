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

VariantGwasForm.prototype = new GenericFormPanel();

function VariantGwasForm(args) {
    args.analysis = 'hpg-variant.gwas-assoc';
    GenericFormPanel.prototype.constructor.call(this, args);

    this.id = Utils.genId("VariantGwasForm");
    this.headerWidget = this.webapp.headerWidget;
    this.opencgaBrowserWidget = this.webapp.headerWidget.opencgaBrowserWidget;
}

VariantGwasForm.prototype.beforeRun = function () {

    if (this.testing) {
        console.log("Watch out!!! testing flag is on, so job will not launched.")
    }

    if (this.paramsWS["test"] == "assoc") {
        delete this.paramsWS["chisq"];
        delete this.paramsWS["fisher"];

        this.paramsWS[this.paramsWS["function_test"]] = "";
    }

    this.paramsWS["config"] = "/httpd/bioinfo/opencga/analysis/hpg-variant/bin";
    console.log(this.paramsWS);
    console.log(this.analysis);

};


VariantGwasForm.prototype.getPanels = function () {
    var items = [
        this._getBrowseInputForm(),
        this._getTestForm()
    ];

    var form = Ext.create('Ext.panel.Panel', {
        margin: "15 0 5 0",
        border: false,
        buttonAlign: 'center',
        items: items,
        defaults:{
            margin:'0 0 15 0'
        }
    });

    return [this._getExampleForm(), form];
};


VariantGwasForm.prototype._getExampleForm = function () {
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
                    Utils.msg("Example", "Loaded");
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

VariantGwasForm.prototype._getBrowseInputForm = function () {
    var _this = this;

    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Input",
        header:this.headerFormConfig,
        border: this.formBorder,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [
            this.createOpencgaBrowserCmp({
                fieldLabel: 'Input VCF file:',
                dataParamName: 'vcf-file',
                id: this.id + 'vcf-file',
                mode: 'fileSelection',
                allowedTypes: ['vcf'],
                allowBlank: false
            }),
            this.createOpencgaBrowserCmp({
                fieldLabel: 'Input PED file:',
                dataParamName: 'ped-file',
                id: this.id + 'ped-file',
                mode: 'fileSelection',
                allowedTypes: ['ped'],
                allowBlank: false
            })]
    });
    return formBrowser;
};


VariantGwasForm.prototype._getTestForm = function () {
    var _this = this;
    var assoc = Ext.create('Ext.form.field.Radio', {
        id: "assoc" + "_" + this.id,
        boxLabel: 'Assoc',
        inputValue: 'assoc',
        checked: true,
        name: 'test',
        handler: function (field, value) {
            if (value) {
                var radio = Ext.getCmp(_this.id + "_radioGroupFunctionGwas");
                radio.enable();
                _this.analysis = "hpg-variant.gwas-assoc";
                console.log(radio)
            } else {
                var radio = Ext.getCmp(_this.id + "_radioGroupFunctionGwas");
                radio.disable();
                _this.analysis = "hpg-variant.gwas-tdt";

            }
        }
    });

    var tdt = Ext.create('Ext.form.field.Radio', {
        id: "tdt" + "_" + this.id,
        boxLabel: 'TDT',
        inputValue: 'tdt',
        name: 'test'

    });

    var radioGroupTest = Ext.create('Ext.form.RadioGroup', {
        fieldLabel: 'Test',
        width: 500,
        items: [
            assoc,
            tdt]
    });

    var chisq = Ext.create('Ext.form.field.Radio', {
        id: "chisq" + "_" + this.id,
        boxLabel: 'Chisq',
        inputValue: 'chisq',
        checked: true,
        name: 'function_test'
    });

    var fisher = Ext.create('Ext.form.field.Radio', {
        id: "fisher" + "_" + this.id,
        boxLabel: 'Fisher',
        inputValue: 'fisher',
        name: 'function_test'
    });

    var radioGroupFunction = Ext.create('Ext.form.RadioGroup', {
        id: this.id + "_radioGroupFunctionGwas",
        fieldLabel: 'Test',
        width: 500,
        items: [
            chisq,
            fisher]
    });


    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Test",
        header:this.headerFormConfig,
        border: this.formBorder,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [radioGroupTest, radioGroupFunction]
    });

    return formBrowser;

}
;


VariantGwasForm.prototype.loadExample1 = function () {
    Ext.getCmp(this.id + 'vcf-file').setValue('Example 1');
    Ext.getCmp(this.id + 'vcf-file' + 'hidden').setValue('example_4K_variants_147_samples.vcf');

    Ext.getCmp(this.id + 'ped-file').setValue('Example 1');
    Ext.getCmp(this.id + 'ped-file' + 'hidden').setValue('example_4K_variants_147_samples.ped');


    Ext.getCmp(this.id + 'jobname').setValue("GWAS example");
    Ext.getCmp(this.id + 'jobdescription').setValue("GWAS example");
};
