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
    args.analysis = 'hpg-variant.filter';
    GenericFormPanel.prototype.constructor.call(this, args);

    this.id = Utils.genId("VariantFilterForm");
    this.headerWidget = this.webapp.headerWidget;
    this.opencgaBrowserWidget = this.webapp.headerWidget.opencgaBrowserWidget;
}

VariantFilterForm.prototype.beforeRun = function () {
    if (this.testing) {
        console.log("Watch out!!! testing flag is on, so job will not launched.")
    }
};


VariantFilterForm.prototype.getPanels = function () {
    var items = [
        this._getSpeciesForm(),
        this._getBrowseInputForm(),
        this._getBrowseOutputForm(),
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

VariantFilterForm.prototype._getBrowseInputForm = function () {
    var _this = this;

    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Input",
        header:this.headerFormConfig,
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
            this.createOpencgaBrowserCmp({
                fieldLabel: 'Input PED file:',
                dataParamName: 'ped-file',
                id: this.id + 'ped-file',
                mode: 'fileSelection',
                allowedTypes: ['ped'],
                allowBlank: true
            })]
    });
    return formBrowser;
}


VariantFilterForm.prototype._getBrowseOutputForm = function () {
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
        //cls:'panel-border-top',
        header:this.headerFormConfig,
        border: this.border,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [
            file,
            this.createOpencgaBrowserCmp({
                fieldLabel: 'Output folder',
                dataParamName: 'output-folder',
                id: this.id + 'outputFolder',
                mode: 'fileSelection',
//                allowedTypes: ['ped'],
                allowBlank: true
            })
        ]
    });

    return formBrowser;
}

VariantFilterForm.prototype._getFilterForm = function () {
    var _this = this;
    var items = [];
    
    var region = Ext.create('Ext.form.field.Text', {
        id: this.id + "region",
        fieldLabel: 'Region (chr:start-end)',
        name: 'region',
        width: 500,
        //emptyText: "chr:start-end",
        regex: /^([a-zA-Z0-9])+\:([0-9])+\-([0-9])+$/
    });
    
    items.push(region);
    
    
    var gene = {
        id: this.id + "gene",
        fieldLabel: 'Gene list (csv)',
        xtype: 'textarea',
        name: 'gene',
        flex: 1,
        width: 500,
        enableKeyEvents: true,
        value: ''
    };
    items.push(gene);

    var alleles = Ext.create('Ext.form.field.Number', {
        id: this.id + "num_alleles",
        fieldLabel: 'Number of alleles',
        name: 'alleles',
        width: 500,
        minValue: 1,
        allowDecimals: false
    });
    items.push(alleles);
    
    var coverage = Ext.create('Ext.form.field.Number', {
        id: this.id + "coverage",
        fieldLabel: 'Minimum coverage',
        name: 'coverage',
        width: 500,
        minValue: 0,
        allowDecimals: false
    });
    items.push(coverage);

    var quality = Ext.create('Ext.form.field.Number', {
        id: this.id + "quality",
        fieldLabel: 'Minimum quality',
        name: 'quality',
        width: 500,
        minValue: 0,
        allowDecimals: false
    });
    items.push(quality);
    
    var minAlleles = Ext.create('Ext.form.field.Number', {
        id: this.id + "minAlleles",
        fieldLabel: 'Minimum allele freq. (MAF)',
        name: 'maf',
        width: 500,
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        decimalPrecision: 12,
        allowDecimals: true
    });
    items.push(minAlleles);

    var minAlleles = Ext.create('Ext.form.field.Number', {
        id: this.id + "minAlleles",
        fieldLabel: 'Minimum allele freq. (MAF)',
        name: 'maf',
        width: 500,
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        decimalPrecision: 12,
        allowDecimals: true
    });
    items.push(minAlleles);


    var dominant = Ext.create('Ext.form.field.Number', {
        id: this.id + "dominant",
        fieldLabel: 'Dominant inheritance pattern',
        name: 'dominant',
        width: 500,
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        decimalPrecision: 12,
        allowDecimals: true
    });
    items.push(dominant);

    var recessive = Ext.create('Ext.form.field.Number', {
        id: this.id + "recessive",
        fieldLabel: 'Recessive inheritance pattern',
        name: 'recessive',
        width: 500,
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        decimalPrecision: 12,
        allowDecimals: true
    });
    items.push(recessive);
 

    var radioItems = [];
    radioItems.push(this.createRadio("All", "variant_type", true));
    radioItems.push(this.createRadio("Only SNPs", "variant_type"));
    radioItems.push(this.createRadio("Only Indel", "variant_type"));
    radioItems.push(this.createRadio("Structural", "variant_type"));
    var radioGroup = Ext.create('Ext.form.RadioGroup', {
        fieldLabel: 'Variant Type',
        width: 500,
        items: radioItems
    });
    items.push(radioGroup);
   
    var save = {
        xtype: 'checkbox',
        boxLabel: 'Save rejected variants to another file', 
        name: 'save',
        inputValue: 'save',
        checked: false
    };


    items.push(save);
    //var radioSNPItems = [];
    //radioSNPItems.push(this.createRadio("All", "snp", true));
    //radioSNPItems.push(this.createRadio("Only SNPs", "snp"));
    //radioSNPItems.push(this.createRadio("Only Indel","snp"));
    //var radioSNPGroup = Ext.create('Ext.form.RadioGroup', {
        //fieldLabel: 'SNP',
        //width: 500,
        //items: radioSNPItems
    //});
    //items.push(radioSNPGroup);
    
    //var radioINDELItems = [];
    //radioINDELItems.push(this.createRadio("All", "indel", true));
    //radioINDELItems.push(this.createRadio("Only SNPs", "indel"));
    //radioINDELItems.push(this.createRadio("Only Indel","indel"));
    //var radioINDELGroup = Ext.create('Ext.form.RadioGroup', {
        //fieldLabel: 'Indel',
        //width: 500,
        //items: radioINDELItems
    //});
    //items.push(radioINDELGroup); 
    
    
    
    var formFilterOptions = Ext.create('Ext.form.Panel', {
        title: "Filters",
        header: this.headerFormConfig,
        border: this.formBorder,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: items
    });

    return formFilterOptions;
}

VariantFilterForm.prototype._getExampleForm = function () {
    var _this = this;

    var example1 = Ext.create('Ext.Component', {
        html: '<span class="s140"><span class="btn btn-default">Load</span> &nbsp; VCF file with ~3500 variants example</span>',
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
        html: '<span class="s140"><span class="btn btn-default">Load</span> &nbsp; VCF file with ~5000 variants example</span>',
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
        title:'Examples',
        header: this.headerFormConfig,
        border: this.formBorder,
        items: [
            this.note1,
            example1,
            this.note2,
            example2,
        ],
        defaults: {margin: '5 0 0 0'},
        margin: '0 0 10 0'
    });

    return exampleForm;
};



VariantFilterForm.prototype.loadExample1 = function () {

    Ext.getCmp(this.id + 'vcf-file').update('<span class="emph">Example 1</span>', false);
    Ext.getCmp(this.id + 'vcf-file' + 'hidden').setValue('example_CHB.exon.2010_03.sites.fixed.vcf');


    Ext.getCmp(this.id + 'jobname').setValue("Example vcf 3500");
    Ext.getCmp(this.id + 'jobdescription').setValue("VCF file with ~3500 variants");

    Ext.getCmp("Only SNPs_" + this.id).setValue(true);

};
VariantFilterForm.prototype._getSpeciesForm = function () {
    var _this = this;

    //var checkFlags = function (value) {
        //var outputOptions = Ext.getCmp('outputOptions' + _this.id);
        //if (value != "hsa") {
            //outputOptions.child('checkboxfield[inputValue=TF_binding_site_variant]').setValue(false).disable();
            //outputOptions.child('checkboxfield[inputValue=miRNA_target_site]').setValue(false).disable();
            //outputOptions.child('checkboxfield[id=other_regulatory]').setValue(false).disable();

            //outputOptions.child('checkboxfield[inputValue=SNP]').setValue(false).disable();
            //outputOptions.child('checkboxfield[id=uniprot_natural_variants]').setValue(false).disable();

            //outputOptions.child('checkboxfield[id=phenotypic_annotated_SNPs]').setValue(false).disable();
            //outputOptions.child('checkboxfield[id=disease_mutations]').setValue(false).disable();
        //} else {
            //outputOptions.child('checkboxfield[inputValue=TF_binding_site_variant]').setValue(false).enable();
            //outputOptions.child('checkboxfield[inputValue=miRNA_target_site]').setValue(false).enable();
            //outputOptions.child('checkboxfield[id=other_regulatory]').setValue(false).enable();

            //outputOptions.child('checkboxfield[inputValue=SNP]').setValue(false).enable();
            //outputOptions.child('checkboxfield[id=uniprot_natural_variants]').setValue(false).enable();

            //outputOptions.child('checkboxfield[id=phenotypic_annotated_SNPs]').setValue(false).enable();
            //outputOptions.child('checkboxfield[id=disease_mutations]').setValue(false).enable();
        //}
    //};

    var speciesForm = Ext.create('Ext.panel.Panel', {
        title: "Species",
        header: this.headerFormConfig,
        border: this.formBorder,
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
                change: function () {
                    if (this.getValue()) {
                        //checkFlags(this.getValue());
                    }
                }
            }
        });
        speciesCombo.select(speciesCombo.getStore().data.items[0]);
        speciesForm.add(speciesCombo);
    }, error: function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
    }});

    return speciesForm;
}
