function VariantGwasWidget(args) {
    var _this = this;
    _.extend(this, Backbone.Events);

    this.id = Utils.genId("VariantGwasWidget");

    //set default args

    this.border = true;
    this.autoRender = false;
    this.targetId;
    this.width;
    this.height;

    //set instantiation args, must be last
    _.extend(this, args);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
}

VariantGwasWidget.prototype = {
    render: function (targetId) {
        console.log("render");
        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;


//        this.dbName = this.job.command.data['vcf-file'];
//        this.dbName = this.dbName.substring(this.dbName.lastIndexOf('/') + 1);
//        this.dbName = this.dbName.substring(0, this.dbName.lastIndexOf('.')) + '.db';
//        this.dbName = this.dbName + '.db';
//        this.statsName = this.dbName.substring(0, this.dbName.lastIndexOf('.')) + '.json';

        this.pvalue = this.job.command.data['outdir'] + "/pvalue.png";
        this.pvalueAdj = this.job.command.data['outdir'] + "/pvalue.adj.png";

        this.rendered = true;

    },
    draw: function () {
        console.log("draw");
        var _this = this;

        /* main panel */
        this.panel = this._createPanel(this.targetId);

        var url1 = OpencgaManager.pollurl({
            accountId: $.cookie("bioinfo_account"),
            sessionId: $.cookie("bioinfo_sid"),
            filename: this.pvalue,
            jobId: this.job.id
        });
        var itemBox1 = Ext.create('Ext.Component', {
            html: '<div><img width="500" height="500"src="' + url1 + '"></div>'
        });

        var url2 = OpencgaManager.pollurl({
            accountId: $.cookie("bioinfo_account"),
            sessionId: $.cookie("bioinfo_sid"),
            filename: this.pvalueAdj,
            jobId: this.job.id
        });
        var itemBox2 = Ext.create('Ext.Component', {
            html: '<div><img width="500"src="' + url2 + '"></div>'
        });

        Ext.getCmp(_this.id + "pvalueImg").add(itemBox1);
        Ext.getCmp(_this.id + "pvalueAdjImg").add(itemBox2);


    },

    _createPanel: function (targetId) {
        var _this = this;

        var panel = Ext.create('Ext.panel.Panel', {
            title: this.title,
            width: '100%',
            height: '100%',
            border: 0,
            layout: 'hbox',
            closable: true,
            cls: 'ocb-border-top-lightgrey',
            items: [
                {
                    xtype: 'container',
                    id: _this.id + "pvalueImg",
                    flex: 1
                },
                {
                    xtype: 'container',
                    id: _this.id + "pvalueAdjImg",
                    flex: 1

                }
            ]
        });
        targetId.add(panel);
        targetId.setActiveTab(panel);

        return panel;
    }}
;
