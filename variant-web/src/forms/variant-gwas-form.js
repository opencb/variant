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

    var regionPatt = /^([a-zA-Z0-9])+\:([0-9])+\-([0-9])+$/;
    var regions = [];
    if (!Array.isArray(this.paramsWS["region"])) {
        this.paramsWS["region"] = [this.paramsWS["region"]];
    }
    for (var i = 0; i < this.paramsWS['region'].length; i++) {
        var regionStr = this.paramsWS['region'][i];
        if (regionStr !== '' && regionPatt.test(regionStr)) {
            regions.push(regionStr);
        }
    }
    if (regions.length > 0) {
        this.paramsWS["region"] = regions.join(',');
    } else {
        delete this.paramsWS["region"];
    }


    this.paramsWS["gene"] = this.paramsWS["gene"].replace(/\s/gm, "").replace(/(^,*)|(,*$)/g, "");
    if (this.paramsWS["gene"] === '') {
        delete this.paramsWS["gene"];
    }
    if (this.paramsWS["alleles"] === '') {
        delete this.paramsWS["alleles"];
    }
    if (this.paramsWS["coverage"] === '') {
        delete this.paramsWS["coverage"];
    }
    if (this.paramsWS["quality"] === '') {
        delete this.paramsWS["quality"];
    }
    if (this.paramsWS["maf"] === '') {
        delete this.paramsWS["maf"];
    }
    if (this.paramsWS["missing"] === '') {
        delete this.paramsWS["missing"];
    }
    if (this.paramsWS["dominant"] === '') {
        delete this.paramsWS["dominant"];
    }
    if (this.paramsWS["recessive"] === '') {
        delete this.paramsWS["recessive"];
    }

    if (Array.isArray(this.paramsWS["var-type"])) {
        if (this.paramsWS["var-type"].length === 3) {
            delete this.paramsWS["var-type"]
        } else if (this.paramsWS["var-type"].length == 2) {
            this.paramsWS["var-type"] = this.paramsWS["var-type"].join(',');
        }
    }


    if (this.paramsWS["test"] == "assoc") {
        delete this.paramsWS["chisq"];
        delete this.paramsWS["fisher"];

        this.paramsWS[this.paramsWS["function_test"]] = "";
    }

    if (this.testing) {
        console.log("Watch out!!! testing flag is on, so job will not launched.")
    }

    this.paramsWS["config"] = "/httpd/bioinfo/opencga/analysis/hpg-variant/bin";

};


VariantGwasForm.prototype.getPanels = function () {
    var items = [
        this._getBrowseInputForm(),
        this._getFilterForm(),
        this._getTestForm()
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
        header: this.headerFormConfig,
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


    Ext.getCmp(this.id + 'jobname').setValue("GWAS 4K");
    Ext.getCmp(this.id + 'jobdescription').setValue("147 variants");
}

VariantGwasForm.prototype._getFilterForm = function () {
    var _this = this;


    this.regionsFieldContainer = Ext.create('Ext.form.FieldContainer', {
        items: [
            {
                xtype: 'textfield',
                fieldLabel: 'Region',
                labelWidth: this.labelWidth,
                name: 'region',
                emptyText: "chr:start-end",
                regex: /^([a-zA-Z0-9])+\:([0-9])+\-([0-9])+$/
            }
        ]
    });

    var button = Ext.create('Ext.button.Button', {
        text: "Add region",
        margin: "0 0 15 " + (this.labelWidth + 5),
        handler: function () {
            this.previousSibling().add({
                xtype: 'textfield',
                fieldLabel: 'Region',
                labelWidth: _this.labelWidth,
                name: 'region',
                emptyText: "chr:start-end",
                regex: /^([a-zA-Z0-9])+\:([0-9])+\-([0-9])+$/
            });
        }
    });

    var removeRegionButton = Ext.create('Ext.button.Button', {
        text: "Remove region",
        margin: "0 0 15 10",
        handler: function () {
            var childs = _this.regionsFieldContainer.query('>*');
            if (childs.length > 1) {
                _this.regionsFieldContainer.remove(_this.regionsFieldContainer.query('>*:last')[0]);
            }
        }
    });


    this.gene = Ext.create('Ext.form.field.TextArea', {
        fieldLabel: 'Gene list (csv)',
        labelWidth: this.labelWidth,
        name: 'gene',
        flex: 1,
        enableKeyEvents: true,
        value: ''
    });

    this.alleles = Ext.create('Ext.form.field.Number', {
        fieldLabel: 'Number of alleles',
        labelWidth: this.labelWidth,
        name: 'alleles',
        minValue: 1,
        allowDecimals: false
    });

    this.coverage = Ext.create('Ext.form.field.Number', {
        fieldLabel: 'Minimum coverage',
        labelWidth: this.labelWidth,
        name: 'coverage',
        minValue: 0,
        allowDecimals: false
    });

    this.quality = Ext.create('Ext.form.field.Number', {
        fieldLabel: 'Minimum quality',
        labelWidth: this.labelWidth,
        name: 'quality',
        minValue: 0,
        allowDecimals: false
    });

    this.minAlleles = Ext.create('Ext.form.field.Number', {
        fieldLabel: 'Minimum allele freq. (MAF)',
        labelWidth: this.labelWidth,
        name: 'maf',
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        decimalPrecision: 12,
        allowDecimals: true
    });

    this.maxMissing = Ext.create('Ext.form.field.Number', {
        fieldLabel: 'Maximum missing values',
        labelWidth: this.labelWidth,
        name: 'missing',
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        decimalPrecision: 12,
        allowDecimals: true
    });


    this.dominant = Ext.create('Ext.form.field.Number', {
        fieldLabel: 'Dominant inheritance pattern',
        labelWidth: this.labelWidth,
        name: 'dominant',
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        decimalPrecision: 12,
        allowDecimals: true
    });

    this.recessive = Ext.create('Ext.form.field.Number', {
        fieldLabel: 'Recessive inheritance pattern',
        labelWidth: this.labelWidth,
        name: 'recessive',
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        decimalPrecision: 12,
        allowDecimals: true
    });


    this.snpCheckBox = {
        xtype: 'radio',
//        xtype: 'checkbox',
        boxLabel: 'SNP',
        name: 'var-type',
        inputValue: 'snv',
        checked: true
    };
    this.indelCheckBox = {
        xtype: 'radio',
//        xtype: 'checkbox',
        boxLabel: 'Indel',
        name: 'var-type',
        inputValue: 'indel',
//        checked: true
    };

    this.structuralCheckBox = {
        xtype: 'radio',
//        xtype: 'checkbox',
        boxLabel: 'Structural',
        name: 'var-type',
        inputValue: 'structural',
//        checked: true
    };

    var formFilterOptions = Ext.create('Ext.form.Panel', {
        title: 'Filters <span style="font-size:13px;color:grey">(optional)</span>',
        header: this.headerFormConfig,
        border: this.formBorder,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [
            this.regionsFieldContainer,
            button,
            removeRegionButton,

            this.gene,
            this.alleles,
            this.coverage,
            this.quality,
            this.minAlleles,
            this.maxMissing,
            this.dominant,
            this.recessive,
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Variant type',
                labelWidth: this.labelWidth,
                items: [
                    this.snpCheckBox,
                    this.indelCheckBox,
                    this.structuralCheckBox,
                ]
            }
        ]
    });


    return formFilterOptions;
};
