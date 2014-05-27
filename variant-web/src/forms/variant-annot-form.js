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

VariantAnnotForm.prototype = new GenericFormPanel();

function VariantAnnotForm(args) {
    args.analysis = 'hpg-variant.vcf-annot';
    args.border = false;
    GenericFormPanel.prototype.constructor.call(this, args);

    this.id = Utils.genId("VariantAnnotForm");
    this.headerWidget = this.webapp.headerWidget;
    this.opencgaBrowserWidget = this.webapp.headerWidget.opencgaBrowserWidget;

    this.file_id = 0;
}

VariantAnnotForm.prototype.beforeRun = function () {

    this.paramsWS["config"] = "/httpd/bioinfo/opencga/analysis/hpg-variant/bin";
};


VariantAnnotForm.prototype.getPanels = function () {
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

    return [
        this._getExampleForm(),
        form
    ];
};


VariantAnnotForm.prototype._getExampleForm = function () {
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


VariantAnnotForm.prototype._getBrowseInputForm = function () {
    var _this = this;

    var form = Ext.create('Ext.form.Panel', {
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
            })
        ]
    });


    return form;
};

VariantAnnotForm.prototype._getParametersForm = function () {
    var _this = this;


    this.dbsnp = {
        xtype: 'checkbox',
        boxLabel: 'dbSNP',
        name: 'dbsnp',
        inputValue: '',
        checked: true
    };
    this.effect = {
        xtype: 'checkbox',
        boxLabel: 'Effect',
        name: 'effect',
        inputValue: '',
//        checked: true
    };

    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Parameters",
        header: this.headerFormConfig,
        border: this.formBorder,
        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Annotate',
                labelWidth: this.labelWidth,
                items: [
                    this.dbsnp,
                    this.effect
                ]
            }
        ]
    });

    return formBrowser;

};

VariantAnnotForm.prototype.loadExample1 = function () {
    this.clean();
};

