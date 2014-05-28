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

VariantFilterForm.prototype = new GenericFormPanel();

function VariantFilterForm(args) {
    args.analysis = 'hpg-variant.vcf-filter';
    GenericFormPanel.prototype.constructor.call(this, args);

    this.id = Utils.genId("VariantFilterForm");
    this.headerWidget = this.webapp.headerWidget;
    this.opencgaBrowserWidget = this.webapp.headerWidget.opencgaBrowserWidget;
}

VariantFilterForm.prototype.beforeRun = function () {
    //validate regions
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


//    if (this.paramsWS["var-type"] === '') {
//        delete this.paramsWS["var-type"];
//    }
//    if (this.paramsWS["snp"] === '') {
//        delete this.paramsWS["snp"];
//    }
//    if (this.paramsWS["indel"] === '') {
//        delete this.paramsWS["indel"];
//    }
//
//
//


    if (this.paramsWS["ped-file"] == "") {
        delete this.paramsWS["ped-file"];
    }

    this.paramsWS["config"] = "/httpd/bioinfo/opencga/analysis/hpg-variant/bin";
};


VariantFilterForm.prototype.getPanels = function () {
    var items = [
        this._getBrowseInputForm(),
        this._getFilterForm()
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

    return [this._getExampleForm(), form];
};


VariantFilterForm.prototype._getExampleForm = function () {
    var _this = this;

    var example2 = Ext.create('Ext.container.Container', {
        layout: 'hbox',
        items: [
            {
                xtype: 'button',
                width: this.labelWidth,
                text: 'Load example 1',
                handler: function () {
                    _this.loadExample2();
                    Utils.msg("Example 2", "147 Samples ~4000 variants");
                }
            },
            {
                xtype: 'box',
                margin: '5 0 0 15',
                html: '147 Samples ~4000 variants'

            }
        ]
    });

    var exampleForm = Ext.create('Ext.panel.Panel', {
        bodyPadding: 10,
        title: 'Examples',
        header: this.headerFormConfig,
        border: this.formBorder,
        items: [example2],
        defaults: {margin: '5 0 0 0'},
        margin: '0 0 10 0'
    });

    return exampleForm;
};


VariantFilterForm.prototype._getBrowseInputForm = function () {
    var _this = this;

    var speciesStore = Ext.create('Ext.data.Store', {
        autoLoad: false,
        fields: ['species', 'common', 'scientific', 'assembly', 'sciAsembly'],
        data: this.webapp.speciesList
    });

    var speciesCombo = Ext.create('Ext.form.field.ComboBox', {
//        id: _this.id + "speciesCombo",
        fieldLabel: 'Choose Species',
        labelWidth: this.labelWidth,
        labelAlign: 'left',
        name: 'species',
        displayField: 'species',
        valueField: 'species',
        editable: false,
        allowBlank: false,
        store: speciesStore,
        listeners: {
            change: function () {
                if (this.getValue()) {
                    //
                }
            }
        }
    });


    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Input",
        header: this.headerFormConfig,
        border: this.border,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [
            /* speciesCombo, */
            this.createOpencgaBrowserCmp({
                fieldLabel: 'Input VCF file',
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
                allowBlank: true
            })
        ]
    });
    return formBrowser;
}

VariantFilterForm.prototype._getFilterForm = function () {
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


    this.rejectedCheckbox = Ext.create('Ext.form.field.Checkbox', {
        boxLabel: 'Save rejected variants to another file',
        name: 'save-rejected',
        inputValue: '',
        checked: false
    });


    var formFilterOptions = Ext.create('Ext.form.Panel', {
        title: "Filters",
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
            },
            this.rejectedCheckbox
        ]
    });


    return formFilterOptions;
}


VariantFilterForm.prototype.loadExample2 = function () {
    this.clean();

    Ext.getCmp(this.id + 'vcf-file').setValue('4K_variants_147_samples.vcf');
    Ext.getCmp(this.id + 'vcf-file' + 'hidden').setValue('example_4K_variants_147_samples.vcf');

    Ext.getCmp(this.id + 'ped-file').setValue('4K_variants_147_samples.ped');
    Ext.getCmp(this.id + 'ped-file' + 'hidden').setValue('example_4K_variants_147_samples.ped');

    Ext.getCmp(this.id + 'jobname').setValue("Filter 4K");
    Ext.getCmp(this.id + 'jobdescription').setValue("147 Samples");
};