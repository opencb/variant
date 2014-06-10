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


VariantGwasForm.prototype.getPanels = function () {
    var items = [
        this._getBrowseInputForm(),
        this._getBrowseOutputForm(), ,
        this._getTestForm()
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
        defaults:{
            margin:'0 0 15 0'
        }
    });

    return [this._getExampleForm(), form];
};


VariantGwasForm.prototype._getExampleForm = function () {
    var _this = this;

    var example1 = Ext.create('Ext.Component', {
        width: 275,
        html: '<span class="s140"><span class="btn btn-default">Load</span> &nbsp; VCF file example</span>',
        cls: 'dedo',
        listeners: {
            afterrender: function () {
                this.getEl().on("click", function () {
                    _this.loadExample1();
                    Ext.example.msg("Example loaded", "");
                });

            }
        }
    });

    var exampleForm = Ext.create('Ext.container.Container', {
        bodyPadding: 10,
        cls:'bootstrap',
        items: [this.note1, example1],
        defaults: {margin: '5 0 0 0'},
        margin:'0 0 10 0'
    });

    return exampleForm;
};

VariantGwasForm.prototype._getBrowseInputForm = function () {
    var _this = this;

    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Input",
        header:this.headerFormConfig,
        border: true,
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

VariantGwasForm.prototype._getBrowseOutputForm = function () {
    var file = Ext.create('Ext.form.field.Text', {
        id: this.id + "output-file",
        fieldLabel: 'Output',
        name: 'output-file',
        padding: "5 0 0 5",
        bodyPadding: 10,
        width: 500
    });

    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Output",
        header:this.headerFormConfig,
        border: true,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [
            file,
            this.createOpencgaBrowserCmp({
                fieldLabel: 'Output folder:',
                dataParamName: 'output-folder',
                id: this.id + 'outputFolder',
                mode: 'fileSelection',
//                allowedTypes: ['ped'],
                allowBlank: true
            })
        ]
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
        border: true,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [radioGroupTest, radioGroupFunction]
    });

    return formBrowser;

}
;


VariantGwasForm.prototype.loadExample1 = function () {
    Ext.getCmp(this.id + 'vcf-file').setText('<span class="emph">Example 1</span>', false);
    Ext.getCmp(this.id + 'vcf-file' + 'hidden').setValue('example_4K_variants_147_samples.vcf');

    Ext.getCmp(this.id + 'ped-file').setText('<span class="emph">Example 1</span>', false);
    Ext.getCmp(this.id + 'ped-file' + 'hidden').setValue('example_4K_variants_147_samples.ped');


    Ext.getCmp(this.id + 'jobname').setValue("GWAS example");
    Ext.getCmp(this.id + 'jobdescription').setValue("GWAS example");
};
