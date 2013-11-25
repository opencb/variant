function Variant(args) {
    _.extend(this, Backbone.Events);

    var _this = this;
    this.id = Utils.genId("Variant");

    //set default args
    this.suiteId = 6;
    this.title = '<span class="emph">Vari</span>ant <span class="emph">an</span>alysis <span class="emph">t</span>ool';
    this.description = 'beta';
    this.version = '2.0.4';
    this.tools = ["hpg-variant.effect", "variant", "hpg-variant.vcf-stats", "hpg-variant.gwas-assoc", "hpg-variant.gwas-tdt"];
    this.border = true;
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
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }

        console.log("Initializing Variant");
        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="variant" style="height:100%;position:relative;"></div>')[0];
        $(this.targetDiv).append(this.div);

        this.headerWidgetDiv = $('<div id="header-widget"></div>')[0];
        $(this.div).append(this.headerWidgetDiv);
        this.menuDiv = $('<div id="menu"></div>')[0];
        $(this.div).append(this.menuDiv);
        this.wrapDiv = $('<div id="wrap" style="height:100%;position:relative;"></div>')[0];
        $(this.div).append(this.wrapDiv);


        this.sidePanelDiv = $('<div id="right-side-panel" style="position:absolute; z-index:50;right:0px;"></div>')[0];
        $(this.wrapDiv).append(this.sidePanelDiv);

        this.leftDiv = $('<div id="left" style="position:absolute;height: 100%;width:100px;"></div>')[0];
        this.contentDiv = $('<div id="content" style="position:absolute;height: 100%;left:100px;width:calc( 100% - 100px)"></div>')[0];
        $(this.wrapDiv).append(this.leftDiv);
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

        /* Header Widget */
        this.headerWidget = this._createHeaderWidget($(this.headerWidgetDiv).attr('id'));

        /* Header Widget */
        this.menu = this._createMenu($(this.menuDiv).attr('id'));

        /* check height */
        var topOffset = $(this.headerWidgetDiv).height() + $(this.menuDiv).height();
        $(this.wrapDiv).css({height: 'calc(100% - ' + topOffset + 'px)'});

        /* Wrap Panel */
        this.panel = this._createPanel($(this.contentDiv).attr('id'));

        /* Job List Widget */
        this.jobListWidget = this._createJobListWidget($(this.sidePanelDiv).attr('id'));

        this.variantMenuPreToolsFormPanel = this._createMenuPreToolsFormPanel()
        this.variantMenuAnalysisFormPanel = this._createMenuAnalysisFormPanel();
        this.variantMenuVisualizationFormPanel = this._createMenuVisualizationFormPanel();


        this.variantEffectForm = new VariantEffectForm(this);
        this.variantEffectForm.closable = false;
        this.variantEffectForm.width = '50%';
//        this.variantEffectForm.testing = true;
        this.variantEffectForm.draw({tabpanel: this.panel});

        this.variantIndexForm = new VariantIndexForm(this);
        this.variantIndexForm.closable = false;
        this.variantIndexForm.width = '50%';
        this.variantIndexForm.testing = true;
        this.variantIndexForm.draw({tabpanel: this.panel});

        this.variantStatsForm = new VariantStatsForm(this);
        this.variantStatsForm.closable = false;
        this.variantStatsForm.width = '50%';
        this.variantStatsForm.testing = true;
        this.variantStatsForm.draw({tabpanel: this.panel, testing: true});

        this.variantMergeForm = new VariantMergeForm(this);
        this.variantMergeForm.closable = false;
        this.variantMergeForm.width = '50%';
        this.variantMergeForm.testing = true;
        this.variantMergeForm.draw({tabpanel: this.panel});

        this.variantGwasForm = new VariantGwasForm(this);
        this.variantGwasForm.closable = false;
        this.variantGwasForm.width = '50%';
        this.variantGwasForm.testing = true;
        this.variantGwasForm.draw({tabpanel: this.panel});


        /*check login*/
        if ($.cookie('bioinfo_sid') != null) {
            this.sessionInitiated();
        } else {
            this.sessionFinished();
        }

        this.panel.add(this.variantMenuVisualizationFormPanel);
        this.panel.setActiveTab(this.variantMenuVisualizationFormPanel);


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
            handlers: {
                'login': function (event) {
                    Ext.example.msg('Welcome', 'You logged in');
                    _this.sessionInitiated();
                },
                'logout': function (event) {
                    Ext.example.msg('Good bye', 'You logged out');
                    _this.sessionFinished();

                },
                'account:change': function (event) {
                    _this.setAccountData(event.response);

                }
            }
        });
        headerWidget.draw();

        return headerWidget;
    },
    _createMenu: function (targetId) {
        var _this = this;
        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            id: this.id + "navToolbar",
            renderTo: targetId,
            cls: 'gm-navigation-bar bootstrap',
            region: "north",
            width: '100%',
            height: 40,
            border: false,
            items: [
                {
                    id: this.id + "btnUpload",
//                    disabled: true,
//                    overCls: '',
//                    pressedCls: 'active',
                    margin: '0 2 0 5',
                    cls: 'btn btn-success btn-sm',
                    text: '<span style="color: white;font-size: 12px;font-weight: bold">Upload</span>',
                    handler: function () {
                        _this.headerWidget.opencgaBrowserWidget.show({mode: 'manager'});
//                        var showForm = function () {
//                            if (!_this.panel.contains(_this.variantMenuPreToolsFormPanel)) {
//                                _this.panel.add(_this.variantMenuPreToolsFormPanel);
//                            }
//                            _this.panel.setActiveTab(_this.variantMenuPreToolsFormPanel);
//                        };
//                        _this._checkLogin(showForm);
                    }
                },
                {
                    id: this.id + "btnPreTools",
//                    disabled: true,
//                    overCls: '',
//                    pressedCls: 'active',
                    cls: 'btn btn-primary btn-sm',
                    text: '<span style="color: white;font-size: 12px;font-weight: bold">Preprocess</span>',
                    handler: function () {
                        var showForm = function () {
                            if (!_this.panel.contains(_this.variantMenuPreToolsFormPanel)) {
                                _this.panel.add(_this.variantMenuPreToolsFormPanel);
                            }
                            _this.panel.setActiveTab(_this.variantMenuPreToolsFormPanel);
                        };
                        _this._checkLogin(showForm);
                    }
                },
                {
                    id: this.id + "btnAnalysis",
                    cls: 'btn btn-warning btn-sm',

                    text: '<span style="color: white;font-size: 12px;font-weight: bold">Analysis</span>',
                    handler: function () {
//                        _this.showIndexForm();
                        var showForm = function () {
                            if (!_this.panel.contains(_this.variantMenuAnalysisFormPanel)) {
                                _this.panel.add(_this.variantMenuAnalysisFormPanel);
                            }
                            _this.panel.setActiveTab(_this.variantMenuAnalysisFormPanel);
                        };
                        _this._checkLogin(showForm);
                    }
                },
                {
                    id: this.id + "btnVisualization",
                    cls: 'btn btn-danger btn-sm',

//                    disabled: true,
                    text: '<span style="color: white;font-size: 12px;font-weight: bold">Visualization</span>',
                    handler: function () {
//                        _this.showIndexForm();
                        var showForm = function () {
                            if (!_this.panel.contains(_this.variantMenuVisualizationFormPanel)) {
                                _this.panel.add(_this.variantMenuVisualizationFormPanel);
                            }
                            _this.panel.setActiveTab(_this.variantMenuVisualizationFormPanel);
                        };
                        _this._checkLogin(showForm);
                    }
                },
                '->'
                ,
                {
                    id: this.id + 'jobsButton',
                    tooltip: 'Show Jobs',
                    text: '<span class="emph"> Hide jobs </span>',
                    enableToggle: true,
                    pressed: true,
                    toggleHandler: function () {
                        if (this.pressed) {
                            this.setText('<span class="emph"> Hide jobs </span>');
                            _this.jobListWidget.show();
                        } else {
                            this.setText('<span class="emph"> Show jobs </span>');
                            _this.jobListWidget.hide();
                        }
                    }
                }
            ]
        });
        return toolbar;
    },
    _createPanel: function (targetId) {
        var _this = this;

        homePanel = Ext.create('Ext.panel.Panel', {
//            padding: 30,
//            margin: "10 0 0 0",
            title: 'Home',
//            html: suiteInfo,
            border: 0,
//			layout: {
//		        type: 'vbox',
//		        align: 'stretch'
//		    },
            items: [
                {
                    xtype: 'panel',
//                    title:'Home',
                    padding: 30,
                    border: false,
                    autoScroll: true,
                    html: SUITE_INFO,
                    bodyPadding: 30,
                    flex: 1
                }
            ]
        });
        var panel = Ext.create('Ext.tab.Panel', {
            renderTo: targetId,
            width: '100%',
            height: '100%',
            border: 0,
            cls: 'ocb-border-top-lightgrey',
            activeTab: 0,
            items: [homePanel]
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
    _createMenuPreToolsFormPanel: function () {
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
                {name: "Stats", form: "stats"},
                {name: "Merge", form: "merge"},
                {name: "<span class=''>Filter</span>", form: "filter"},
                {name: "<span class=''>Annot</span>", form: "annot"}

            ]
        });

        var menuTpl = new Ext.XTemplate(
            '<div class="" style="margin: 15px; 0 0 10px;">',
            '<tpl for=".">',
//            '<div style="margin: 10px; border: 1px solid lightgray; padding: 10px" class="menu-list-item">',
            '<div class="btn btn-primary menu-list-item" style="display: block;margin: 10px;">',
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

                    var p = Ext.getCmp(_this.id + "variantCustomFormPanel");
                    p.removeAll(false);

                    var form = null;
                    console.log(record.data.form);
                    switch (record.data.form) {
                        case "stats":
                            form = _this.variantStatsForm.panel;
                            break;
                        case "merge":
                            form = _this.variantMergeForm.panel;
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
    _createMenuAnalysisFormPanel: function () {
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
                {name: "GWAS", form: "gwas"},
                {name: "Effect", form: "effect"}

            ]
        });

        var menuTpl = new Ext.XTemplate(
            '<div class="" style="margin: 15px; 0 0 10px;">',
            '<tpl for=".">',
//            '<div style="margin: 10px; border: 1px solid lightgray; padding: 10px" class="menu-list-item">',
            '<div class="btn btn-warning menu-list-item" style="display: block;margin: 10px;">',
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

                    var p = Ext.getCmp(_this.id + "variantCustomAnalysisFormPanel");
                    p.removeAll(false);

                    var form = null;
                    console.log(record.data.form);
                    switch (record.data.form) {
                        case "effect":
                            form = _this.variantEffectForm.panel;
                            break;
                        case "gwas":
                            form = _this.variantGwasForm.panel;
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
                title: 'Analysis',
                layout: 'hbox',
                border: 0,
                items: [
                    {
                        xtype: 'container',
//                        title: 'Analysis',
//                        flex: 1,
                        width: 120,
                        margin: '0 5 0 0',
                        items: [view]
                    },
                    {
                        xtype: 'container',
                        height: "100%",
                        margin: 10,
                        id: _this.id + "variantCustomAnalysisFormPanel",
//                        title: 'FORM',
                        autoScroll: true,
                        flex: 1
                    }
                ]
            }
        );

        return panel;

    }
}
Variant.prototype.sessionInitiated = function () {
    Ext.getCmp(this.id + 'jobsButton').enable();
    Ext.getCmp(this.id + 'jobsButton').toggle(true);
    //this.jobListWidget.draw();
    //this.dataListWidget.draw();
};

Variant.prototype.sessionFinished = function () {
    Ext.getCmp(this.id + 'jobsButton').disable();
    Ext.getCmp(this.id + 'jobsButton').toggle(false);

    this.jobListWidget.clean();
    this.accountData = null;

    this.panel.items.each(function (child) {
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
    this.panel.setWidth($(this.contentDiv).width());
};

Variant.prototype.jobItemClick = function (record) {
    var _this = this;
    this.jobId = record.data.id;
    if (record.data.visites >= 0) {

        Ext.getCmp(this.id + 'jobsButton').toggle(false);

        var toolName = record.raw.toolName;
//        if (toolName == 'variant') {
//            record.raw.command = Utils.parseJobCommand(record.raw);
//            var variantWidget = new VariantWidget({
//                targetId: this.panel,
//                title: record.raw.name,
//                job: record.raw,
//                autoRender: true
//            });
//            variantWidget.draw();
//        } else if (toolName == "hpg-variant.vcf-stats") {
//            record.raw.command = Utils.parseJobCommand(record.raw);
//            var variantStatsWidget = new VariantStatsWidget({
//                targetId: this.panel,
//                title: record.raw.name,
//                job: record.raw,
//                autoRender: true
//            });
//            variantStatsWidget.draw();
//        } else
    if (toolName == "hpg-variant.gwas-tdt" || toolName == "hpg-variant.gwas-assoc") {
            record.raw.command = Utils.parseJobCommand(record.raw);

            var variantGwasWidget = new VariantGwasWidget({
                targetId: this.panel,
                title: record.raw.name,
                job: record.raw,
                autoRender: true
            });
            variantGwasWidget.draw();
        }
        else {
            var resultWidget = new ResultWidget({
                targetId: this.panel.getId(),
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
        if (!_this.panel.contains(_this.variantEffectForm.panel)) {
            _this.panel.add(_this.variantEffectForm.panel);
        }
        _this.panel.setActiveTab(_this.variantEffectForm.panel);
    };
    this._checkLogin(showForm);
};
Variant.prototype.showIndexForm = function () {
    var _this = this;
    var showForm = function () {
        if (!_this.panel.contains(_this.variantIndexForm.panel)) {
            _this.panel.add(_this.variantIndexForm.panel);
        }
        _this.panel.setActiveTab(_this.variantIndexForm.panel);
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
        },

    ];
}
