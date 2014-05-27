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

VariantEpistasisForm.prototype = new GenericFormPanel();

function VariantEpistasisForm(args) {
    args.analysis = 'hpg-variant.epistasis';
    GenericFormPanel.prototype.constructor.call(this, args);

    this.id = Utils.genId("VariantEpistasisForm");
    this.headerWidget = this.webapp.headerWidget;
    this.opencgaBrowserWidget = this.webapp.headerWidget.opencgaBrowserWidget;
}

VariantEpistasisForm.prototype.beforeRun = function () {
    console.log(this.paramsWS);

    if (this.testing) {
        console.log("Watch out!!! testing flag is on, so job will not launched.")
    }

    this.paramsWS["config"] = "/httpd/bioinfo/opencga/analysis/hpg-variant/bin";
};


VariantEpistasisForm.prototype.getPanels = function () {
    var items = [
        this._getBrowseInputForm(),
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

    return [this._getExampleForm(), form];
};


VariantEpistasisForm.prototype._getExampleForm = function () {
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

VariantEpistasisForm.prototype._getBrowseInputForm = function () {
    var _this = this;

    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Input",
        header: this.headerFormConfig,
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

VariantEpistasisForm.prototype._getParametersForm = function () {
    var _this = this;

    this.combined = Ext.create('Ext.form.field.Number', {
        fieldLabel: 'SNPs combined at once',
        labelWidth: this.labelWidth,
        name: '',
        minValue: 0,
        allowDecimals: false
    });
    this.folds = Ext.create('Ext.form.field.Number', {
        fieldLabel: 'Num. of folds in k-fold cross-validation',
        labelWidth: this.labelWidth,
        name: '',
        minValue: 0,
        allowDecimals: false
    });
    this.validations = Ext.create('Ext.form.field.Number', {
        fieldLabel: 'Num. of cross-validations',
        labelWidth: this.labelWidth,
        name: '',
        minValue: 0,
        allowDecimals: false
    });
    this.ranking = Ext.create('Ext.form.field.Number', {
        fieldLabel: 'Size of best model ranking',
        labelWidth: this.labelWidth,
        name: '',
        minValue: 0,
        allowDecimals: false
    });

    this.subsetRadioGroup = Ext.create('Ext.form.RadioGroup', {
        fieldLabel: 'Subset for model evaluation',
        labelWidth: this.labelWidth,
//        layout:'vbox',
        items: [
            {
                boxLabel: 'Training',
                inputValue: '',
                name: 'subset',
                checked: true
            },
            {
                boxLabel: 'Testing',
                inputValue: '',
                name: 'subset'
            }
        ]
    });
    this.bestModelRadioGroup = Ext.create('Ext.form.RadioGroup', {
        fieldLabel: 'Best model is choosen by',
        labelWidth: this.labelWidth,
//        layout:'vbox',
        items: [
            {
                boxLabel: 'Times it appears among the best (CVC)',
                inputValue: '',
                name: 'bestModel',
                checked: true
            },
            {
                boxLabel: "It's accuracy (CVA)",
                inputValue: '',
                name: 'bestModel'
            }
        ]
    });

    var formBrowser = Ext.create('Ext.form.Panel', {
        title: "Parameters",
        header: this.headerFormConfig,
        border: this.formBorder,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [
            this.combined,
            this.folds,
            this.validations,
            this.ranking,
            this.subsetRadioGroup,
            this.bestModelRadioGroup
        ]
    });

    return formBrowser;

};


VariantEpistasisForm.prototype.loadExample1 = function () {
    Ext.getCmp(this.id + 'vcf-file').setValue('Example 1');
    Ext.getCmp(this.id + 'vcf-file' + 'hidden').setValue('example_4K_variants_147_samples.vcf');

    Ext.getCmp(this.id + 'ped-file').setValue('Example 1');
    Ext.getCmp(this.id + 'ped-file' + 'hidden').setValue('example_4K_variants_147_samples.ped');


    Ext.getCmp(this.id + 'jobname').setValue("GWAS example");
    Ext.getCmp(this.id + 'jobdescription').setValue("GWAS example");
};
