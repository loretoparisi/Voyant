
Ext.define('Voyant.widget.DocumentSelectorBase', {
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.documentselector',
	glyph: 'xf10c@FontAwesome',
	statics: {
		i18n: {
			documents: {en: 'Documents'},
			selectAll: {en: 'All'},
			selectNone: {en: 'None'},
			ok: {en: 'Ok'},
			cancel: {en: "Cancel"},
			all: {en: "all"}
		}
	},

	config: {
		docs: undefined,
		corpus: undefined,
		docStore: undefined,
		singleSelect: false
	},
	
    initComponent: function() {

		var me = this;
		
		this.setSingleSelect(this.config.singleSelect == undefined ? this.getSingleSelect() : this.config.singleSelect);
		
		Ext.apply(me, {
			text: this.localize('documents'),
			menu: {
				width: 250,
				fbar: [{
					xtype: 'checkbox',
					hidden: this.getSingleSelect(),
					boxLabel: this.localize("all"),
					listeners: {
						change: {
							fn: function(item, checked) {
								this.getMenu().items.each(function(item) {
									item.setChecked(checked)
								})
							},
							scope: this
						}
					}
				},{xtype:'tbfill'},{
		    		xtype: 'button',
		    		text: this.localize('ok'),
					hidden: this.getSingleSelect(),
	    	    	scale: 'small',
		    		handler: function(button, e) {
		    			var docs = [];
		    			this.getMenu().items.each(function(item) {
		    				if (item.checked) {
			    				docs.push(item.docId);
		    				}
		    			}, this);
		    			
		    			// tell parent tool
						var panel = button.findParentBy(function(clz) {
							return clz.mixins["Voyant.panel.Panel"];
						})
						if (panel) {
			    			panel.fireEvent('documentsSelected', button, docs);
						}

		    			// hide the opened menu
		    			button.findParentBy(function(clz) {
		    				if (clz.isXType("button") && clz.hasVisibleMenu()) {
		    					clz.hideMenu();
		    					return true
		    				}
		    				return false;
		    			})
		    		},
		    		scope: this
		    	},{
		    		xtype: 'button',
		    		text: this.localize('cancel'),
	    	    	scale: 'small',
		    		handler: function(b, e) {
		    			this.findParentBy(function(clz) {
		    				if (clz.isXType("button") && clz.hasVisibleMenu()) {
		    					clz.hideMenu();
		    					return true
		    				}
		    				return false
		    			}, this)
		    			this.hideMenu();
		    		},
		    		scope: this
		    	}]
			},
			listeners: {
				afterrender: function(selector) {
					selector.on("loadedCorpus", function(src, corpus) {
						this.setCorpus(corpus)
						if (corpus.getDocumentsCount()==1) {
							this.hide();
						}
					}, selector);
					var panel = selector.findParentBy(function(clz) {
						return clz.mixins["Voyant.panel.Panel"];
					})
					if (panel) {
						panel.on("loadedCorpus", function(src, corpus) {
							selector.fireEvent("loadedCorpus", src, corpus);
						}, selector);
						if (panel.getCorpus && panel.getCorpus()) {selector.fireEvent("loadedCorpus", selector, panel.getCorpus())}
					}
				}
			}
		});

		this.setDocStore(Ext.create("Ext.data.Store", {
			model: "Voyant.data.model.Document",
    		autoLoad: false,
    		remoteSort: false,
    		proxy: {
				type: 'ajax',
				url: Voyant.application.getTromboneUrl(),
				extraParams: {
					tool: 'corpus.DocumentsMetadata'
				},
				reader: {
					type: 'json',
					rootProperty: 'documentsMetadata.documents',
					totalProperty: 'documentsMetadata.total'
				},
				simpleSortMode: true
   		     },
   		     listeners: {
   		    	load: function(store, records, successful, options) {
   					this.populate(records);
   				},
   				scope: this
   		     }
    	}));
    },
    
    setCorpus: function(corpus) {
    	if (corpus) {
        	this.getDocStore().getProxy().setExtraParam('corpus', corpus.getId());
        	this.getDocStore().load();
    	}
		this.callParent(arguments);
    },
    
    populate: function(docs, replace) {
    	this.setDocs(docs);
    	
    	var menu = this.getMenu();
    	if (replace) {
    		menu.removeAll();
    	}
    	
    	var isSingleSelect = this.getSingleSelect();
    	
    	var groupId = 'docGroup'+Ext.id();
    	docs.forEach(function(doc, index) {
    		menu.add({
    			xtype: 'menucheckitem',
    			text: doc.getShortTitle(),
    			docId: doc.get('id'),
    			checked: isSingleSelect && index == 0 || !isSingleSelect,
    			group: isSingleSelect ? groupId : undefined,
    			checkHandler: function(item, checked) {
    				if (this.getSingleSelect() && checked) {
    					var panel = this.findParentBy(function(clz) {
    						return clz.mixins["Voyant.panel.Panel"];
    					})
    					if (panel) {
	    					panel.fireEvent('documentSelected', this, doc);
    					}
    				}
    			},
    			scope: this
    		});
    	}, this);
    	
    }
});

Ext.define('Voyant.widget.DocumentSelectorButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.documentselectorbutton',
    mixins: ['Voyant.widget.DocumentSelectorBase'],
    initComponent: function() {
    	this.mixins["Voyant.widget.DocumentSelectorBase"].initComponent.apply(this, arguments);
		this.callParent();
    }
})
    
Ext.define('Voyant.widget.DocumentSelectorMenuItem', {
    extend: 'Ext.menu.Item',
    alias: 'widget.documentselectormenuitem',
    mixins: ['Voyant.widget.DocumentSelectorBase'],
    initComponent: function() {
    	this.mixins["Voyant.widget.DocumentSelectorBase"].initComponent.apply(this, arguments);
		this.callParent();
    }
})
