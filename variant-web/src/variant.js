function Variant(args) {
    _.extend(this, Backbone.Events);

    var _this = this;
    this.id = Utils.genId("Variant");

    //set default args
    this.suiteId = 6;
    this.title = 'VARIANT'
//    this.description = '<span class="emph">Vari</span>ant <span class="emph">an</span>alysis <span class="emph">t</span>ool';
//    this.description = '';
    this.description = 'Variant analysis tool'
    this.version = '2.0.6';
    this.tools = ["hpg-variant.effect", "variant", "hpg-variant.vcf-stats", "hpg-variant.gwas-assoc", "hpg-variant.gwas-tdt"];
    this.border = false;
    this.targetId;
    this.width;
    this.height;


    //set instantiation args, must be last
    _.extend(this, args);

    this.accountData = null;

    this.resizing = false;

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
}


Variant.prototype = {
    render: function (targetId) {
        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;
        this.targetDiv = (this.targetId instanceof HTMLElement ) ? this.targetId : $('#' + this.targetId)[0];
        if (this.targetDiv === 'undefined') {
            console.log('targetId not found');
            return;
        }

        this.div = $('<div id="variant"></div>')[0];
        $(this.div).css({
            position: 'relative',
            height: '100%'
        });
        $(this.targetDiv).append(this.div);

        this.headerWidgetDiv = $('<div id="header-widget"></div>')[0];
        $(this.wrapDiv).css({

        });
        $(this.div).append(this.headerWidgetDiv);
        this.wrapDiv = $('<div id="wrap"></div>')[0];
        $(this.wrapDiv).css({
            position: 'relative',
            height: '100%',
            background: '#314559'
        });
        $(this.div).append(this.wrapDiv);


        this.rightDiv = $('<div id="right-side-panel"></div>')[0];
        $(this.rightDiv).css({
            position: 'absolute',
            'z-index': '50',
            right: '0px'
        });
        $(this.wrapDiv).append(this.rightDiv);

        this.leftDivWidth = 150;
//        this.leftDiv = $('<div id="left"></div>')[0];
//        $(this.leftDiv).css({
//            position: 'absolute',
//            height: '100%',
//            width: leftDivWidth + 'px',
//            background: '#314559'
////            'border-top': '1px solid #c6d0da'
//        });
//        $(this.wrapDiv).append(this.leftDiv);

        this.contentDiv = $('<div id="content"></div>')[0];
        $(this.contentDiv).css({
            position: 'absolute',
            height: '100%',
//            left: leftDivWidth + 'px',
//            width: 'calc( 100% - ' + leftDivWidth + 'px)',
//            paddingLeft:leftDivWidth
//            borderTop: '1px solid #C6D0DA'
        });

        $(this.wrapDiv).append(this.contentDiv);

        this.width = ($(this.div).width());
        this.height = ($(this.div).height());

        if (this.border) {
            var border = (_.isString(this.border)) ? this.border : '1px solid lightgray';
            $(this.div).css({border: border});
        }

        $(window).resize(function (event) {
            if (event.target == window) {
                if (!_this.resizing) {//avoid multiple resize events
                    _this.resizing = true;
                    _this.setSize($(_this.div).width(), $(_this.div).height());
                    setTimeout(function () {
                        _this.resizing = false;
                    }, 400);
                }
            }
        });

        this.rendered = true;
    },
    draw: function () {
        var _this = this;
        if (!this.rendered) {
            console.info('Variant is not rendered yet');
            return;
        }
        this.variantMenuEl = this._createVariantMenuEl();

        /* Header Widget */
        this.headerWidget = this._createHeaderWidget(this.headerWidgetDiv);


        /* check height */
        var topOffset = $(this.headerWidgetDiv).height();
        $(this.wrapDiv).css({height: 'calc(100% - ' + topOffset + 'px)'});


        this.container = Ext.create('Ext.panel.Panel', {
            renderTo: $(this.contentDiv).attr('id'),
            border: 0,
            width: '100%',
            height: '100%',
            layout: 'fit'
        });

        this.homePanel = this._createHomePanel();
        this.resultPanel = this._createResultPanel(this.container);

        this.container.add(this.homePanel);

        /* Job List Widget */
        this.jobListWidget = this._createJobListWidget($(this.rightDiv).attr('id'));

        this.variantStatsForm = new VariantStatsForm({
            webapp: this,
            closable: false,
            width: '50%',
            testing: true,
            formBorder: false,
            border: false,
            style: {
                borderTop: '1px solid #d1d9e3'
            },
//            title: 'Stats',
//            bodyPadding: '15 0 0 40',
            bodyPadding: '20 0 0 200',
//            headerConfig: {
//                baseCls: 'header-panel'
//            },
            headerFormConfig: {
                baseCls: 'header-form'
            }
        });
        this.variantStatsForm.draw();
        this.variantMergeForm = new VariantMergeForm({
            webapp: this,
            closable: false,
            width: '50%',
            testing: true,
            formBorder: false,
            border: false,
            style: {
                borderTop: '1px solid #d1d9e3'
            },
//            title: 'Merge',
            bodyPadding: '20 0 0 200',
//            headerConfig: {
//                baseCls: 'preprocess-header'
//            },
            headerFormConfig: {
                baseCls: 'header-form'
            }
        });
        this.variantMergeForm.draw();


        this.variantGwasForm = new VariantGwasForm({
            webapp: this,
            closable: false,
            width: '50%',
            testing: true,
            formBorder: false,
            border: false,
            style: {
                borderTop: '1px solid #d1d9e3'
            },
//            title: 'GWAS',
//            bodyPadding: '15 0 0 40',
            bodyPadding: '20 0 0 200',
//            headerConfig: {
//                baseCls: 'analysis-header'
//            },
            headerFormConfig: {
                baseCls: 'header-form'
            }
        });
        this.variantGwasForm.draw();
        this.variantEffectForm = new VariantEffectForm({
            webapp: this,
            closable: false,
            width: 600,
            testing: false,
            formBorder: false,
            border: false,
            style: {
                borderTop: '1px solid #d1d9e3'
            },
//            title: 'Effect',
            bodyPadding: '20 0 0 200',
//            headerConfig: {
//                baseCls: 'analysis-header'
//            },
            headerFormConfig: {
                baseCls: 'header-form'
            }
        });
        this.variantEffectForm.draw();


        this.variantIndexForm = new VariantIndexForm({
            webapp: this,
            closable: false,
            width: '50%',
            testing: true,
            formBorder: false,
            border: false,
            style: {
                borderTop: '1px solid #d1d9e3'
            },
//            title: 'Index',
            bodyPadding: '20 0 0 200',
//            headerConfig: {
//                baseCls: 'visualization-header'
//            },
            headerFormConfig: {
                baseCls: 'header-form'
            }
        });
        this.variantIndexForm.draw();


        /*check login*/
        if ($.cookie('bioinfo_sid') != null) {
            this.sessionInitiated();
        } else {
            this.sessionFinished();
        }
    },
    _createHeaderWidget: function (targetId) {
        var _this = this;
        var headerWidget = new HeaderWidget({
            targetId: targetId,
            autoRender: true,
            appname: this.title,
            description: this.description,
            version: this.version,
            suiteId: this.suiteId,
            accountData: this.accountData,
            homeLink: "http://variant.bioinfo.cipf.es",
            helpLink: "http://docs.bioinfo.cipf.es/projects/variant",
            tutorialLink: "http://docs.bioinfo.cipf.es/projects/variant/wiki/Tutorial",
            aboutText: '',
            applicationMenuEl: this.variantMenuEl,
            handlers: {
                'login': function (event) {
                    Utils.msg('Welcome', 'You logged in');
                    _this.sessionInitiated();
                },
                'logout': function (event) {
                    Utils.msg('Good bye', 'You logged out');
                    _this.sessionFinished();

                },
                'account:change': function (event) {
                    _this.setAccountData(event.response);

                },
                'jobs:click': function () {
                    _this.jobListWidget.toggle();
                }
            }
        });
        headerWidget.draw();

        return headerWidget;
    },
    _createVariantMenuEl: function () {
        var _this = this;

        var menuHtml = '' +
            '   <ul class="ocb-app-menu unselectable">' +
            '       <li id="home" class="active">Home</li>' +
//            '       <li id="data" class="title">Data</li>' +
//            '       <li id="upload" class="data">Upload</li>' +
            '       <li id="preprocess" class="title">Preprocess</li>' +
            '       <li id="stats" class="preprocess">Stats</li>' +
            '       <li id="merge" class="preprocess">Merge</li>' +
            '       <li id="filter" class="preprocess">Filter</li>' +
            '       <li id="annot" class="preprocess">Annot</li>' +
            '       <li id="analysis" class="title">Analysis</li>' +
            '       <li id="gwas" class="analysis">GWAS</li>' +
            '       <li id="effect" class="analysis">Effect</li>' +
            '       <li id="visualization" class="title">Visualization</li>' +
//            '       <li id="index" class="visualization">Index</li>' +
            '       <li id="results" class="visualization">Results</li>' +
            '   </ul>'
        '';

        var ul = $(menuHtml)[0];

        var els = $(ul).children();
        var domEls = {};
        for (var i = 0; i < els.length; i++) {
            var elid = els[i].getAttribute('id');
            if (elid) {
                domEls[elid] = els[i];
            }
        }
        $(ul).click(function (e) {
            if (!$(e.target).hasClass('title')) {
                $(ul).find('ul').children().each(function (index, el) {
                    $(el).removeClass('active');
                });
                $(e.target).addClass('active');
                var text = $(e.target).text();
                switch (text) {
                    case "Home":
                        _this.container.removeAll(false);
                        _this.container.add(_this.homePanel);
                        break;
                    case "Results":
                        _this.container.removeAll(false);
                        _this.container.add(_this.resultPanel);
                        break;
                    case "Upload":
                        _this.headerWidget.opencgaBrowserWidget.show({mode: 'manager'});
                        break;
                    case "Stats":
                        _this.container.removeAll(false);
                        _this.container.add(_this.variantStatsForm.panel);
                        break;
                    case "Merge":
                        _this.container.removeAll(false);
                        _this.container.add(_this.variantMergeForm.panel);
                        break;
                    case "Filter":
                        _this.container.removeAll(false);
                        _this.container.add();
                        break;
                    case "Annot":
                        _this.container.removeAll(false);
                        _this.container.add();
                        break;

                    case "GWAS":
                        _this.container.removeAll(false);
                        _this.container.add(_this.variantGwasForm.panel);
                        break;
                    case "Effect":
                        _this.container.removeAll(false);
                        _this.container.add(_this.variantEffectForm.panel);
                        break;

                    case "Index":
                        _this.container.removeAll(false);
                        _this.container.add(_this.variantIndexForm.panel);
                        break;
                }

            }
        });
        return ul;
    },


    _createHomePanel: function () {
        var _this = this;

        var homePanel = Ext.create('Ext.panel.Panel', {
            bodyStyle: {
                fontSize: '22px',
                lineHeight: '30px',
                fontWeight: '300',
                color: '#ccc',
                background: '#314559',
                padding: '20px 0 0 200px'
            },
            border: 0,
            html: SUITE_INFO,
//            header: {
//                baseCls: 'header-panel'
//            },
//            items: [
//                {
//                    xtype: 'container',
//                    autoScroll: true
//                }
//            ]
        });
        return homePanel;
    },

    _createResultPanel: function (targetId) {

        var panel = Ext.create('Ext.tab.Panel', {
//            renderTo: targetId,
            width: '100%',
            height: '100%',
            tabBar: {
                baseCls: 'visualization-header',
                height: 33,
                padding: '12 0 0 5'
            },
//            plain:true,
            border: 0,
            activeTab: 0,
            items: []
        });
        return panel;
    },

    _createJobListWidget: function (targetId) {
        var _this = this;

        var jobListWidget = new JobListWidget({
            'timeout': 4000,
            'suiteId': this.suiteId,
            'tools': this.tools,
            'pagedViewList': {
                'title': 'Jobs',
                'pageSize': 7,
                'targetId': targetId,
                'order': 0,
                'width': 280,
                'height': 625,
                border: true,
                'mode': 'view'
            }
        });

        /**Atach events i listen**/
        jobListWidget.pagedListViewWidget.on('item:click', function (data) {
            _this.jobItemClick(data.item);
        });
        jobListWidget.draw();

        return jobListWidget;
    },

    _createMenuPreToolsFormPanel: function (option) {
        var _this = this;


        var panel = Ext.create('Ext.container.Container', {
                title: 'Preprocess',
                layout: 'hbox',
                border: 0,
                items: [
                    {
                        xtype: 'container',
//                        title: 'Preprocess',
//                        flex: 1,
                        width: 120,
                        items: [view]
                    },
                    {
                        xtype: 'container',
                        height: "100%",
                        margin: 10,
                        id: _this.id + "variantCustomFormPanel",
//                        title: 'FORM',
                        autoScroll: true,
                        flex: 1
                    }
                ]
            }
        );

        return panel;

    },
    _createMenuVisualizationFormPanel: function () {
        var _this = this;

        var st = Ext.create('Ext.data.Store', {
            id: 'menuStore',
            fields: [
                {
                    name: "name", type: 'string'
                },
                {
                    name: "form", type: 'auto'
                }
            ],
            data: [
                {name: "Index", form: "index"}

            ]
        });

        var menuTpl = new Ext.XTemplate(
            '<div class="" style="margin: 15px; 0 0 10px;">',
            '<tpl for=".">',
//            '<div style="margin: 10px; border: 1px solid lightgray; padding: 10px" class="menu-list-item">',
            '<div class="btn btn-danger menu-list-item" style="display: block;margin: 10px;">',
            '{name}',
            '</div>',
            '</tpl>',
            '</div>'
        );

        var view = Ext.create('Ext.view.View', {
            store: st,
            tpl: menuTpl,
            trackOver: true,
            autoScroll: true,
            selectedItemCls: 'active',
            cls: 'bootstrap',
            overItemCls: 'list-item-hover',
            itemSelector: '.menu-list-item',
            listeners: {
                itemclick: function (este, record) {
                    console.log(este);
                    console.log(record);

                    var p = Ext.getCmp(_this.id + "variantCustomIndexFormPanel");
                    p.removeAll(false);

                    var form = null;
                    console.log(record.data.form);
                    switch (record.data.form) {
                        case "index":
                            form = _this.variantIndexForm.panel;
                            break;
                    }

                    console.log(form);
                    if (form != null) {
                        p.add(form);
                    }
                }

            }
        });

        var panel = Ext.create('Ext.container.Container', {
                title: 'Visualization',
                layout: 'hbox',
                border: 0,
                items: [
                    {
                        xtype: 'container',
//                        title: 'Visualization',
//                        flex: 1,
                        width: 120,
                        margin: '0 5 0 0',
                        items: [view]
                    },
                    {
                        xtype: 'container',
                        height: "100%",
                        id: _this.id + "variantCustomIndexFormPanel",
//                        title: 'FORM',
                        autoScroll: true,
                        flex: 1
                    }
                ]
            }
        );

        return panel;

    },
//    _createMenuAnalysisFormPanel: function () {
//        var _this = this;
//
//        var st = Ext.create('Ext.data.Store', {
//            id: 'menuStore',
//            fields: [
//                {
//                    name: "name", type: 'string'
//                },
//                {
//                    name: "form", type: 'auto'
//                }
//            ],
//            data: [
//                {name: "GWAS", form: "gwas"},
//                {name: "Effect", form: "effect"}
//
//            ]
//        });
//
//        var menuTpl = new Ext.XTemplate(
//            '<div class="" style="margin: 15px; 0 0 10px;">',
//            '<tpl for=".">',
////            '<div style="margin: 10px; border: 1px solid lightgray; padding: 10px" class="menu-list-item">',
//            '<div class="btn btn-warning menu-list-item" style="display: block;margin: 10px;">',
//            '{name}',
//            '</div>',
//            '</tpl>',
//            '</div>'
//        );
//
//        var view = Ext.create('Ext.view.View', {
//            store: st,
//            tpl: menuTpl,
//            trackOver: true,
//            autoScroll: true,
//            selectedItemCls: 'active',
//            cls: 'bootstrap',
//            overItemCls: 'list-item-hover',
//            itemSelector: '.menu-list-item',
//            listeners: {
//                itemclick: function (este, record) {
//                    console.log(este);
//                    console.log(record);
//
//                    var p = Ext.getCmp(_this.id + "variantCustomAnalysisFormPanel");
//                    p.removeAll(false);
//
//                    var form = null;
//                    console.log(record.data.form);
//                    switch (record.data.form) {
//                        case "effect":
//                            form = _this.variantEffectForm.panel;
//                            break;
//                        case "gwas":
//                            form = _this.variantGwasForm.panel;
//                            break;
//
//                    }
//
//                    console.log(form);
//                    if (form != null) {
//                        p.add(form);
//                    }
//                }
//
//            }
//        });
//
//        var panel = Ext.create('Ext.container.Container', {
//                title: 'Analysis',
//                layout: 'hbox',
//                border: 0,
//                items: [
//                    {
//                        xtype: 'container',
////                        title: 'Analysis',
////                        flex: 1,
//                        width: 120,
//                        margin: '0 5 0 0',
//                        items: [view]
//                    },
//                    {
//                        xtype: 'container',
//                        height: "100%",
//                        margin: 10,
//                        id: _this.id + "variantCustomAnalysisFormPanel",
////                        title: 'FORM',
//                        autoScroll: true,
//                        flex: 1
//                    }
//                ]
//            }
//        );
//
//        return panel;
//
//    }
}
Variant.prototype.sessionInitiated = function () {
    this.jobListWidget.show();
    //this.dataListWidget.draw();
};

Variant.prototype.sessionFinished = function () {
    this.jobListWidget.hide();

    this.jobListWidget.clean();
    this.accountData = null;

    this.resultPanel.items.each(function (child) {
        if (child.title != 'Home') {
            child.destroy();
        }
    })
};


Variant.prototype.setAccountData = function (response) {
    this.accountData = response;
    this.jobListWidget.setAccountData(this.accountData);
};

Variant.prototype.setSize = function (width, height) {
    this.width = width;
    this.height = height;
    this.headerWidget.setWidth(width);
    this.menu.setWidth($(this.menuDiv).width());
    this.resultPanel.setWidth($(this.contentDiv).width());
};

Variant.prototype.jobItemClick = function (record) {
    var _this = this;


    this.jobId = record.data.id;
    if (record.data.visites >= 0) {
        this.container.removeAll(false);
        this.container.add(this.resultPanel);

//        this.variantMenu.items.each(function (item) {
//            if (item.getEl().getHTML() == 'Results') {
//                item.addCls('active');
//            } else {
//                item.removeCls('active');
//            }
//        });


        Ext.getCmp(this.id + 'jobsButton').toggle(false);

        var toolName = record.raw.toolName;
//        if (toolName == 'variant') {
//            record.raw.command = Utils.parseJobCommand(record.raw);
//            var variantWidget = new VariantWidget({
//                targetId: this.resultPanel,
//                title: record.raw.name,
//                job: record.raw,
//                autoRender: true
//            });
//            variantWidget.draw();
//        } else if (toolName == "hpg-variant.vcf-stats") {
//            record.raw.command = Utils.parseJobCommand(record.raw);
//            var variantStatsWidget = new VariantStatsWidget({
//                targetId: this.resultPanel,
//                title: record.raw.name,
//                job: record.raw,
//                autoRender: true
//            });
//            variantStatsWidget.draw();
//        } else
        if (toolName == "hpg-variant.gwas-tdt" || toolName == "hpg-variant.gwas-assoc") {
            record.raw.command = Utils.parseJobCommand(record.raw);

            var variantGwasWidget = new VariantGwasWidget({
                targetId: this.resultPanel,
                title: record.raw.name,
                job: record.raw,
                autoRender: true
            });
            variantGwasWidget.draw();
        }
        else {
            var resultWidget = new ResultWidget({
                targetId: this.resultPanel.getId(),
                application: 'variant',
                app: this,
                layoutName: record.raw.toolName
            });
            resultWidget.draw($.cookie('bioinfo_sid'), record);

            console.log(this.jobId)

            /* result widget parses the commandLine on record and adds the command key */
            var command = resultWidget.job.command.data;
        }

    }
};

Variant.prototype._checkLogin = function (showForm) {
    if (!$.cookie('bioinfo_sid')) {
        this.headerWidget.on('login', function (event) {
            showForm();
        });
        this.headerWidget.loginWidget.anonymousSign();
    } else {
        showForm();
    }
};

Variant.prototype.showEffectForm = function () {
    var _this = this;
    var showForm = function () {
        if (!_this.resultPanel.contains(_this.variantEffectForm.panel)) {
            _this.resultPanel.add(_this.variantEffectForm.panel);
        }
        _this.resultPanel.setActiveTab(_this.variantEffectForm.panel);
    };
    this._checkLogin(showForm);
};
Variant.prototype.showIndexForm = function () {
    var _this = this;
    var showForm = function () {
        if (!_this.resultPanel.contains(_this.variantIndexForm.panel)) {
            _this.resultPanel.add(_this.variantIndexForm.panel);
        }
        _this.resultPanel.setActiveTab(_this.variantIndexForm.panel);
    };
    this._checkLogin(showForm);
};

Variant.prototype.dataItemClick = function (record) {
//	console.log(record.data.name);
//	_this.adapter.-------(record.data.DATAID, "js", $.cookie('bioinfo_sid'));
};


Variant.prototype.showVCFtools = function () {
    var _this = this;
    vcfToolsJobFormPanel = new VCFToolsJobFormPanel({suiteId: this.suiteId});
    if (Ext.getCmp(vcfToolsJobFormPanel.panelId) == null) {
        vcfToolsJobFormPanel.draw();
        Ext.getCmp(this.centerPanelId).add(vcfToolsJobFormPanel.panel);
        vcfToolsJobFormPanel.onRun.addEventListener(function (sender, data) {
            Ext.getCmp(_this.eastPanelId).expand();
        });
    }
    Ext.getCmp(this.centerPanelId).setActiveTab(Ext.getCmp(vcfToolsJobFormPanel.panelId));
};

Variant.prototype.showVCFviewer = function () {
    var _this = this;
    this.vcfViewer = Ext.getCmp(this.id + "_vcfViewer");
    if (this.vcfViewer == null) {
        //Collapse to calculate width for genomeMaps
        pan = 26;
        if (!Ext.getCmp(this.eastPanelId).isHidden() || Ext.getCmp(this.eastPanelId).collapsed) {
            Ext.getCmp(this.eastPanelId).collapse();
            pan = 0;
        }
        var genomeMapsContainer = Ext.create('Ext.container.Container', {
            id: this.id + 'contVCFViewer'
        });

        this.vcfViewer = Ext.create('Ext.panel.Panel', {
            id: this.id + "_vcfViewer",
            border: false,
            title: "VCF Viewer",
            closable: true,
            items: genomeMapsContainer
//		    autoScroll:true
        });

        Ext.getCmp(this.centerPanelId).add(this.vcfViewer);

        //Once actived, the div element is visible, and genomeMaps can be rendered
        Ext.getCmp(this.centerPanelId).setActiveTab(this.vcfViewer);
//				
//		console.log(this.vcfViewer.getWidth());
//		console.log(this.vcfViewer.getHeight());


        //Parse query params to get location.... Also in AVAILABLE_SPECIES, an example location is set.
        var url = $.url();
        var location = url.param('location');
        if (location != null) {
            var position = location.split(":")[1];
            var chromosome = location.split(":")[0];
        }

        this.genomeViewer = new GenomeViewer(this.id + "contVCFViewer", DEFAULT_SPECIES, {
            availableSpecies: AVAILABLE_SPECIES,
            sidePanelCollapsed: true,
            width: this.vcfViewer.getWidth(),
            height: this.vcfViewer.getHeight()
        });

        //var toolbarMenu = Ext.create('Ext.toolbar.Toolbar', {
        //cls:'bio-menubar',
        //height:27,
        //padding:'0 0 0 10',
        //margins : '0 0 0 5',
        //items : [
        //{
        //text : 'Add track from VCF file',
        //handler : function() {
        //var vcfFileWidget = new VCFFileWidget({viewer:_this.genomeViewer});
        //vcfFileWidget.draw();
        //vcfFileWidget.onOk.addEventListener(function(sender, event) {
        //console.log(event.fileName);
        //var vcfTrack = new TrackData(event.fileName,{
        //adapter: event.adapter
        //});
        //_this.genomeViewer.addTrack(vcfTrack,{
        //id:event.fileName,
        //featuresRender:"MultiFeatureRender",
        //histogramZoom:80,
        //height:150,
        //visibleRange:{start:0,end:100},
        //featureTypes:FEATURE_TYPES
        //});
        //});
        //}
        //}
        //]
        //});
        //this.genomeViewer.setMenuBar(toolbarMenu);
        //this.genomeViewer.afterRender.addEventListener(function(sender,event){
        //_this.setTracks(_this.genomeViewer);
        //});
        this.genomeViewer.afterRender.addEventListener(function (sender, event) {
            _this.setTracks(_this.genomeViewer);
            _this.genomeViewer.addSidePanelItems(_this.getGMSidePanelItems());
        });
        this.genomeViewer.draw();
    } else {
        Ext.getCmp(this.centerPanelId).setActiveTab(this.vcfViewer);
    }
};

Variant.prototype.setTracks = function (genomeViewer) {
    var geneTrack = new TrackData("gene", {
        adapter: new CellBaseAdapter({
            category: "genomic",
            subCategory: "region",
            resource: "gene",
            species: genomeViewer.species,
            featureCache: {
                gzip: true,
                chunkSize: 50000
            }
        })
    });
    genomeViewer.trackSvgLayoutOverview.addTrack(geneTrack, {
        id: "gene",
        type: "gene",
        featuresRender: "MultiFeatureRender",
        histogramZoom: 10,
        labelZoom: 20,
        height: 150,
        visibleRange: {start: 0, end: 100},
        titleVisibility: 'hidden',
        featureTypes: FEATURE_TYPES
    });
    //end region track


    var seqtrack = new TrackData("Sequence", {
        adapter: new SequenceAdapter({
            category: "genomic",
            subCategory: "region",
            resource: "sequence",
            species: genomeViewer.species,
            featureCache: {
                gzip: true,
                chunkSize: 1000
            }
        })
    });
    genomeViewer.addTrack(seqtrack, {
        id: "1",
        type: "Sequence",
        title: "Sequenece",
        featuresRender: "SequenceRender",
        height: 30,
        visibleRange: {start: 100, end: 100}
    });

    var geneTrack = new TrackData("Gene/Transcript", {
        adapter: new CellBaseAdapter({
            category: "genomic",
            subCategory: "region",
            resource: "gene",
            species: genomeViewer.species,
            featureCache: {
                gzip: true,
                chunkSize: 50000
            }
        })
    });
    genomeViewer.addTrack(geneTrack, {
        id: "2",
        type: "Gene/Transcript",
        title: "Gene/Transcript",
        featuresRender: "GeneTranscriptRender",
        histogramZoom: 20,
        transcriptZoom: 50,
        height: 24,
        visibleRange: {start: 0, end: 100},
        featureTypes: FEATURE_TYPES
    });
};

Variant.prototype.addFileTrack = function (text) {
    var _this = this;
    var fileWidget = null;
    switch (text) {
        case "VCF":
            fileWidget = new VCFFileWidget({viewer: _this.genomeViewer});
            break;
    }
    if (fileWidget != null) {
        fileWidget.draw();
        if (_this.wum) {
            _this.headerWidget.onLogin.addEventListener(function (sender) {
                fileWidget.sessionInitiated();
            });
            _this.headerWidget.onLogout.addEventListener(function (sender) {
                fileWidget.sessionFinished();
            });
        }
        fileWidget.onOk.addEventListener(function (sender, event) {
            var fileTrack = new TrackData(event.fileName, {
                adapter: event.adapter
            });

            var id = Math.round(Math.random() * 10000);
            var type = text;

            _this.genomeViewer.addTrack(fileTrack, {
                id: id,
                title: event.fileName,
                type: type,
                featuresRender: "MultiFeatureRender",
                //					histogramZoom:80,
                height: 150,
                visibleRange: {start: 0, end: 100},
                featureTypes: FEATURE_TYPES
            });

            var title = event.fileName + '-' + id;
            //updateActiveTracksPanel(type, title, id, true);
        });
    }
};

Variant.prototype.getGMSidePanelItems = function () {
    var _this = this;
    var st = Ext.create('Ext.data.TreeStore', {
        root: {
            expanded: true,
            children: [
                { text: "VCF", iconCls: "icon-blue-box", leaf: true}
            ]
        }
    });
    return [
        {
            xtype: "treepanel",
            id: this.id + "availableTracksTree",
            title: "Add VCF track",
            bodyPadding: "10 0 0 0",
            useArrows: true,
            rootVisible: false,
            hideHeaders: true,
            store: st,
            listeners: {
                itemclick: function (este, record, item, index, e, eOpts) {
                    if (record.isLeaf()) {
                        _this.addFileTrack("VCF");
                    }
                }
            }
        }

    ];
}
