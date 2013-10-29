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

VariantMergeForm.prototype = new GenericFormPanel("variant");

function VariantMergeForm(webapp) {
    this.id = Utils.genId("VariantMergeForm");
    this.headerWidget = webapp.headerWidget;
    this.opencgaBrowserWidget = webapp.headerWidget.opencgaBrowserWidget;

//    this.testing = true;
}

VariantMergeForm.prototype.beforeRun = function () {

    if (this.testing) {
        console.log("Watch out!!! testing flag is on, so job will not launched.")
    }
};


VariantMergeForm.prototype.getPanels = function () {
    var items = [
//        this._getSpeciesForm(),
        this._getBrowseInputForm(),
        this._getBrowseOutputForm()
    ];

    var form = Ext.create('Ext.panel.Panel', {
        margin: "15 0 5 0",
        border: false,
//		layout:{type:'vbox', align: 'stretch'},
        buttonAlign: 'center',
        width: "99%",
        //height:900,
        //width: "600",
        items: items
    });

    return [this._getExampleForm(), form];
};


VariantMergeForm.prototype._getExampleForm = function () {
    var _this = this;

    var example1 = Ext.create('Ext.Component', {
        width: 275,
        html: '<span class="u"><span class="emph u">Load example 1.</span> <span class="info s110">VCF file</span></span>',
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
        items: [this.note1, example1],
        defaults: {margin: '5 0 0 5'}
    });

    return exampleForm;
};


VariantMergeForm.prototype._getSpeciesForm = function () {
    var _this = this;

    var checkFlags = function (value) {
        var outputOptions = Ext.getCmp('outputOptions' + _this.id);
        if (value != "hsa") {
            outputOptions.child('checkboxfield[inputValue=TF_binding_site_variant]').setValue(false).disable();
            outputOptions.child('checkboxfield[inputValue=miRNA_target_site]').setValue(false).disable();
            outputOptions.child('checkboxfield[id=other_regulatory]').setValue(false).disable();

            outputOptions.child('checkboxfield[inputValue=SNP]').setValue(false).disable();
            outputOptions.child('checkboxfield[id=uniprot_natural_variants]').setValue(false).disable();

            outputOptions.child('checkboxfield[id=phenotypic_annotated_SNPs]').setValue(false).disable();
            outputOptions.child('checkboxfield[id=disease_mutations]').setValue(false).disable();
        } else {
            outputOptions.child('checkboxfield[inputValue=TF_binding_site_variant]').setValue(false).enable();
            outputOptions.child('checkboxfield[inputValue=miRNA_target_site]').setValue(false).enable();
            outputOptions.child('checkboxfield[id=other_regulatory]').setValue(false).enable();

            outputOptions.child('checkboxfield[inputValue=SNP]').setValue(false).enable();
            outputOptions.child('checkboxfield[id=uniprot_natural_variants]').setValue(false).enable();

            outputOptions.child('checkboxfield[id=phenotypic_annotated_SNPs]').setValue(false).enable();
            outputOptions.child('checkboxfield[id=disease_mutations]').setValue(false).enable();
        }
    };

    var speciesForm = Ext.create('Ext.panel.Panel', {
        title: "Species",
        border: true,
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
                        checkFlags(this.getValue());
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
};


VariantMergeForm.prototype._getBrowseInputForm = function () {
    var _this = this;

//    var note1 = Ext.create('Ext.container.Container', {
//        html: '<p>Please select a VCF file from your <span class="info">server account</span> using the <span class="emph">Browse</span> button.</p>'
//    });
//    var note2 = Ext.create('Ext.container.Container', {
//        html: '<p>Please select a PED file from your <span class="info">server account</span> using the <span class="emph">Browse</span> button.</p>'
//    });
//

    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Input",
        //cls:'panel-border-top',
        border: true,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [
            this.createOpencgaBrowserCmp({
                fieldLabel: 'Input VCF file:',
                dataParamName: 'vcf-file',
//                id: this.id + 'vcf-file',
                mode: 'fileSelection',
                allowedTypes: ['vcf'],
                allowBlank: false
            })
        ]
    });

    var button = Ext.create('Ext.button.Button', {
        text: "Add more files",
        margin: "0 0 15 105",
        handler: function () {
            var file = _this.createOpencgaBrowserCmp({
                fieldLabel: 'Input VCF file:',
                dataParamName: 'vcf-file',
                //  id: this.id + 'vcf-file',
                mode: 'fileSelection',
                allowedTypes: ['vcf'],
                allowBlank: false
            })

            formBrowser.insert(1, file);
//            _this.regionFields.push(reg);
        }
    });

    formBrowser.insert(2, button);

    return formBrowser;
};


VariantMergeForm.prototype._getBrowseOutputForm = function () {
    var _this = this;
//
//    var note1 = Ext.create('Ext.container.Container', {
//        html: '<p>Please select a VCF file from your <span class="info">server account</span> using the <span class="emph">Browse</span> button.</p>'
//    });
//    var note2 = Ext.create('Ext.container.Container', {
//        html: '<p>Please select a PED file from your <span class="info">server account</span> using the <span class="emph">Browse</span> button.</p>'
//    });

    var file = Ext.create('Ext.form.field.Text', {
        id: this.id + "output-file",
        fieldLabel: 'Output',
        name: 'output-file',
        width: 500
//                emptyText:"chr:start-end",
//                regex : /^([a-zA-Z0-9])+\:([0-9])+\-([0-9])+$/
    });

//    var folder = _this.createOpencgaBrowserCmp({
//        fieldLabel: 'Output folder:',
//        dataParamName: 'output-folder',
//        //  id: this.id + 'vcf-file',
//        mode: 'fileSelection',
//        allowedTypes: ['vcf'],
//        allowBlank: false
//    });

    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Output",
        //cls:'panel-border-top',
        border: true,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [
            file,
//            folder
        ]
    });


    return formBrowser;
};

VariantMergeForm.prototype.loadExample1 = function () {
    Ext.getCmp(this.id + 'vcf-file').setText('<span class="emph">Example file.vcf</span>', false);
    Ext.getCmp(this.id + 'vcf-file' + 'hidden').setValue('example_file.vcf');

    Ext.getCmp(this.id + 'ped-file').setText('<span class="emph">Example file.ped</span>', false);
    Ext.getCmp(this.id + 'ped-file' + 'hidden').setValue('example_file.ped');


    Ext.getCmp(this.id + 'jobname').setValue("VCF example");
    Ext.getCmp(this.id + 'jobdescription').setValue("VCF example");
};
