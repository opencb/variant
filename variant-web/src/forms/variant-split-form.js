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

VariantSplitForm.prototype = new GenericFormPanel();

function VariantSplitForm(args) {
    args.analysis = 'hpg-variant.vcf-split';
    GenericFormPanel.prototype.constructor.call(this, args);

    this.id = Utils.genId("VariantSplitForm");
    this.headerWidget = this.webapp.headerWidget;
    this.opencgaBrowserWidget = this.webapp.headerWidget.opencgaBrowserWidget;
}

VariantSplitForm.prototype.beforeRun = function () {

    if (this.testing) {
        console.log("Watch out!!! testing flag is on, so job will not launched.")
    }

//    switch (this.paramsWS["function_test"]) {
//        case "fisher":
//            this.paramsWS["fisher"] = "";
//            if (this.paramsWS["chisq"]) {
//                delete this.paramsWS["chisq"];
//            }
//            break;
//        case "chisq":
//            this.paramsWS["chisq"] = "";
//            if (this.paramsWS["fisher"]) {
//                delete this.paramsWS["fisher"];
//            }
//            break;
//
//    }

    if (this.paramsWS["test"] == "assoc") {
        delete this.paramsWS["chisq"];
        delete this.paramsWS["fisher"];

        this.paramsWS[this.paramsWS["function_test"]] = "";
    }

    this.paramsWS["config"] = "/httpd/bioinfo/opencga/analysis/hpg-variant/bin";
    console.log(this.paramsWS);
    console.log(this.analysis);

};


VariantSplitForm.prototype.getPanels = function () {
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


VariantSplitForm.prototype._getExampleForm = function () {
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

VariantSplitForm.prototype._getBrowseInputForm = function () {
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

VariantSplitForm.prototype._getParametersForm = function () {
    var _this = this;
    var chr = Ext.create('Ext.form.field.Radio', {
        id: "chr" + "_" + this.id,
        boxLabel: 'Chromosome',
        inputValue: 'chromosome',
        checked: true,
        name: 'criterion',
    });

    var cov = Ext.create('Ext.form.field.Radio', {
        id: "cov" + "_" + this.id,
        boxLabel: 'Coverage',
        inputValue: 'coverage',
        name: 'criterion'

    });

    var radioGroup = Ext.create('Ext.form.RadioGroup', {
        fieldLabel: 'Test',
        width: 500,
        items: [chr, cov]
    });

    var intervals = _this.createTextFields("intervals");

    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Criterion",
        header: this.headerFormConfig,
        border: this.formBorder,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [
            radioGroup,
            intervals
        ]
    });

    return formBrowser;

}
;


VariantSplitForm.prototype.loadExample1 = function () {
    Ext.getCmp(this.id + 'vcf-file').setValue('Example 1');
    Ext.getCmp(this.id + 'vcf-file' + 'hidden').setValue('example_4K_variants_147_samples.vcf');

    Ext.getCmp(this.id + 'ped-file').setValue('Example 1');
    Ext.getCmp(this.id + 'ped-file' + 'hidden').setValue('example_4K_variants_147_samples.ped');


    Ext.getCmp(this.id + 'jobname').setValue("GWAS example");
    Ext.getCmp(this.id + 'jobdescription').setValue("GWAS example");
};
