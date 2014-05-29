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
    if (Array.isArray(this.paramsWS["intervals"])) {
        this.paramsWS["intervals"].sort();
        this.paramsWS["intervals"] = this.paramsWS["intervals"].join(',');
    }
    if (this.paramsWS["intervals"] === '') {
        delete this.paramsWS["intervals"];
    }


    this.paramsWS["config"] = "/httpd/bioinfo/opencga/analysis/hpg-variant/bin";
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
            })
        ]
    });
    return formBrowser;
};

VariantSplitForm.prototype._getParametersForm = function () {
    var _this = this;
    this.chromosome = Ext.create('Ext.form.field.Radio', {
        boxLabel: 'Chromosome',
        inputValue: 'chromosome',
        name: 'criterion',
        checked: true
    });

    this.coverage = Ext.create('Ext.form.field.Radio', {
        boxLabel: 'Coverage',
        inputValue: 'coverage',
        name: 'criterion',
        handler: function () {
            if (this.getValue()) {
                _this.intervalsFieldContainer.show();
                _this.addIntervalButton.show();
                _this.removeIntervalButton.show();
            } else {
                _this.intervalsFieldContainer.hide();
                _this.addIntervalButton.hide();
                _this.removeIntervalButton.hide();
            }
        }
    });

    var radioGroup = Ext.create('Ext.form.RadioGroup', {
        fieldLabel: 'Criterion',
        labelWidth: this.labelWidth,
        items: [this.chromosome, this.coverage]
    });


    this.intervalsFieldContainer = Ext.create('Ext.form.FieldContainer', {
        hidden: true,
        items: [
            {
                xtype: 'numberfield',
                fieldLabel: 'Interval stop limit',
                labelWidth: this.labelWidth,
                name: 'intervals',
                emptyText: "1000"
            }
        ]
    });

    this.addIntervalButton = Ext.create('Ext.button.Button', {
        hidden: true,
        text: "Add interval",
        margin: "0 0 15 " + (this.labelWidth + 5),
        handler: function () {
            _this.intervalsFieldContainer.add({
                xtype: 'numberfield',
                fieldLabel: 'Interval',
                labelWidth: _this.labelWidth,
                name: 'intervals',
                emptyText: "2000"
            });
        }
    });

    this.removeIntervalButton = Ext.create('Ext.button.Button', {
        hidden: true,
        text: "Remove interval",
        margin: "0 0 15 10",
        handler: function () {
            var childs = _this.intervalsFieldContainer.query('>*');
            if (childs.length > 1) {
                _this.intervalsFieldContainer.remove(_this.intervalsFieldContainer.query('>*:last')[0]);
            }
        }
    });


    var formBrowser = Ext.create('Ext.form.Panel', {
        title: "Parameters",
        header: this.headerFormConfig,
        border: this.formBorder,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [
            radioGroup,
            this.intervalsFieldContainer,
            this.addIntervalButton,
            this.removeIntervalButton
        ]
    });

    return formBrowser;

}
;


VariantSplitForm.prototype.loadExample2 = function () {
    this.clean();

    Ext.getCmp(this.id + 'vcf-file').setValue('4K_variants_147_samples');
    Ext.getCmp(this.id + 'vcf-file' + 'hidden').setValue('example_4K_variants_147_samples.vcf');

    Ext.getCmp(this.id + 'jobname').setValue("Split 4K");
    Ext.getCmp(this.id + 'jobdescription').setValue("147 samples");
};