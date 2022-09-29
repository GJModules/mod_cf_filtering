
window.general_cf = function (){

    var self = this ;
    var $ = jQuery ;
    this.Init = function (){

        this.addEvtListener();
    }
    /**
     * Добавить слушателей событий
     */
    this.addEvtListener = function () {
        document.addEventListener('click' , function (e){
            if( typeof e.target.dataset.evtAction === 'undefined' ) return ;
            switch ( e.target.dataset.evtAction ) {
                // кнопки показать еще в фильтрах
                case 'show_var':
                    self.omClickShowVar ( e )
                    break ;
            }
            // console.log( e.target.dataset.evtAction  );
            // console.log( e.target  );
        })


        /*document.querySelectorAll('div.show_var').forEach(function (el, i , n){
            el.addEventListener( 'click' , self.omClickShowVar )
        });*/

    }
    /**
     * Обработка кнопки показать еще в фильтрах.
     * @param e
     */
    this.omClickShowVar = function (e){
        var $el = $(e.target);
        var $UL = $el.parent();
        var $li_disp_n = $UL.find('li.disp_n');
        $UL.addClass('open_ul');
        $li_disp_n.each(function (i,el){
            $(el).removeClass('disp_n').addClass('open_li')
        });
        $el.hide();
    }
}
window.General_CF = new window.general_cf();
window.General_CF.Init();


window.onpopstate = function (e) {
    location.href = document.location;

};




var customFilters = {
    eventsAssigned: new Array,
    uriLocationState: {
        page: "Results"
    },
    counterHist: 0,
    assignEvents: function (module_id) {
        // noinspection EqualityComparisonWithCoercionJS,EqualityComparisonWithCoercionJS,EqualityComparisonWithCoercionJS
        if (this.eventsAssigned[module_id] == false || this.eventsAssigned[module_id] == null) {

            if (customFiltersProp[module_id].results_trigger == "btn" || customFiltersProp[module_id].results_loading_mode == "ajax") {
                // link click event
                document.id("cf_wrapp_all_" + module_id).addEvent("click:relay(a)", function (event) {
                    event.stop();



                    if ( customFiltersProp[module_id].category_flt_parent_link == false ) {
                        if (this.hasClass("cf_parentOpt")) return false
                    }
                    var url = this.get("href");
                    if (this.hasClass("cf_no_ajax")){
                        window.location.href = url ;

                        return ;
                    }

                    customFilters.listen(event, this, module_id, url);
                });

                // link enter keydown event
                document.id("cf_wrapp_all_" + module_id).addEvent("keydown:relay(a)", function (event) {
                    if(event.key!='enter') {
                        return false;
                    }
                    event.stop();
                    if (customFiltersProp[module_id].category_flt_parent_link == false) {
                        if (this.hasClass("cf_parentOpt")) return false
                    }
                    var url = this.get("href");
                    customFilters.listen(event, this, module_id, url);
                });
                // input click event
                document.id("cf_wrapp_all_" + module_id).addEvent("click:relay(input[type=checkbox],input[type=radio])", function (event) {
                    var url='';
                    var anchror = document.id(this.get("id")+"_a");
                    if(anchror) url = anchror.get("href");
                    customFilters.listen(event, this, module_id,url);
                });

                document.id("cf_wrapp_all_" + module_id).addEvent("change:relay(select[class=cf_flt])", function (event) {
                    event.stop();
                    var url=this.options[this.selectedIndex].getAttribute('data-url');
                    customFilters.listen(event, this, module_id,url);
                })
            }

            /*The module form submit btn*/
            if (customFiltersProp[module_id].results_loading_mode == "ajax" && customFiltersProp[module_id].results_trigger == "btn") {
                document.id("cf_wrapp_all_" + module_id).addEvent("click:relay(input[type=submit],button[type=submit])", function (event) {
                    event.preventDefault();
                    customFilters.listen(event,this,module_id);
                })
            }

            /*
             * The btn resides in various filters
             * This does not work only with ajax but with http as well
             */
            document.id("cf_wrapp_all_" + module_id).addEvent("click:relay(button[class=cf_search_button btn])", function (event) {
                event.stop();
                var filter_base_url = "";
                var from_subquery = "";
                var to_subquery = "";
                var s = "";
                var id = this.getProperty("id");
                var filter_key = id.substr(0, id.indexOf("_button"));
                filter_base_url = document.id(filter_key + "_url").value;
                var n = filter_base_url;
                var f = filter_base_url.indexOf("?");

                var fromField=document.id(filter_key+'_0');
                var toField=document.id(filter_key+'_1');

                //is range inputs
                if(fromField && toField){
                    var from_value=fromField.value;
                    var to_value=toField.value;

                    var from_name=fromField.name;
                    var to_name=toField.name;
                }
                //is simple input
                else {
                    var from_value=document.id(filter_key+'_0').value;
                    from_name=document.id(filter_key+'_0').name;
                }

                if (f != -1) {
                    var d = "&";
                }
                else {
                    var d = "?";
                }
                if (from_value) {
                    from_subquery = from_name + "=" + from_value;
                }
                if (to_value) {
                    to_subquery = to_name + "=" + to_value;
                }

                if (from_subquery && !to_subquery) {
                    s += d + from_subquery;
                }
                else if (!from_subquery && to_subquery) {
                    s += d + to_subquery;
                }
                else {
                    s += d + from_subquery + "&" + to_subquery;
                }
                if (s) {
                    var url = filter_base_url + s;
                }

                if (url) {
                    if (customFiltersProp[module_id].results_loading_mode == "ajax" || customFiltersProp[module_id].results_trigger=="btn") {
                        customFilters.listen(event, this, module_id, url);
                    }
                    else {
                        window.top.location.href = url;
                    }
                }
            });
            this.eventsAssigned[module_id] = true
        }
    },


    listen: function (event, element, module_id, url) {
        if(!module_id) {
            return;
        }
        var formSubmitBtn=false;
        var query_value='';
        var modurl=url;
        var filterName='';

        //if it is html element, check if it is the module's submit btn
        if(element.nodeType) {
            formSubmitBtn=element.hasClass('cf_apply_button');
        }

        if (typeof element.getProperty != "undefined" && element.getProperty('id')) {
            var filterName=this.getFilterName(element.getProperty('id'));
        }

        //call some functions related with the query search
        if(filterName=='q' || formSubmitBtn){
            if(!this.validateInput(filterName, module_id)) {
                return false;
            }
        }

        //A.get the search query, B. reset the filters by setting a new modurl, if new and there is such setting in the component
        if(typeof customFiltersProp[module_id].mod_type != "undefined" && customFiltersProp[module_id].mod_type=='filtering'){
            var query_input=document.getElementById('q_'+module_id+'_0');

            // fix for issue: https://github.com/breakdesigns/mod_cf_filtering/issues/22
            if(filterName=='virtuemart_category' && typeof customFiltersProp[module_id].category_flt_onchange_reset != "undefined" && customFiltersProp[module_id].category_flt_onchange_reset=='filters_keywords') {
                query_input = '';
            }
            if(query_input){
                query_value=this.getQueryValue(module_id);
                if(typeof element.id!='undefined' && element.id=='q_'+module_id+'_clear')query_value='';
                if(typeof customFilters.previousQueryValue=='undefined')customFilters.previousQueryValue=query_value;

                if(customFilters.keyword_search_clear_filters_on_new_search && query_value!=customFilters.previousQueryValue){
                    modurl=customFiltersProp[module_id].base_url+'index.php?option=com_customfilters&view=module&Itemid='+customFiltersProp[module_id].Itemid;
                    if(query_value){
                        //modurl
                        if(modurl.indexOf('?')==-1) {
                            modurl+='?';
                        }
                        else {
                            modurl+='&';
                        }
                        modurl+='q='+query_value;
                    }
                }
            }
        }

        //Load the results. a)Only when ajax is enabled, b)the results trigger is not button (after every selection), c)The results trigger is btn and the current action regards the button press/submit
        if (customFiltersProp[module_id].results_loading_mode == "ajax" && (customFiltersProp[module_id].results_trigger != "btn" || (customFiltersProp[module_id].results_trigger == "btn" &&  formSubmitBtn))) {

            //if we use a keyword search in the filtering mod update the search module as well
            if(typeof customFiltersProp[module_id].mod_type != "undefined" && customFiltersProp[module_id].mod_type=='filtering'){
                if(query_input){
                    //reset other filters if a new search phrase. This process is triggered based on a component setting
                    if(customFilters.keyword_search_clear_filters_on_new_search && query_value!=customFilters.previousQueryValue){
                        //find the base url for the search
                        var url=customFiltersProp[module_id].component_base_url;
                        if(query_value){
                            //url
                            if(url.indexOf('?')==-1)url+='?';
                            else url+='&';
                            url+='q='+query_value;
                        }
                    }

                    //update the search modules if exist
                    this.updateSearchModulesWithSearchQuery(query_value);
                }
            }
            this.loadResults(module_id, url);
        }

        //load the filtering module
        if (customFiltersProp[module_id].loadModule && !formSubmitBtn) {
            /**
             * TODO : Если нет отмеченных фильтров - перезагружаем страницу - Разобраться - без перезагрузки.
             * -- ссылка на пункт меню для фильтра /administrator/index.php?option=com_menus&view=item&client_id=0&layout=edit&id=173
             */


            if ( testEmptyFilter() ){
                window.location.href = modurl ;
                return ;
            }

            /**
             * Проверить что нет отмеченных фильтров
             * @returns {boolean}
             */
            function testEmptyFilter(){
                var $ = jQuery ;
                var checkBox = $('input.cf_flt[type="checkbox"]:checked')
                if ( typeof checkBox[0] === 'undefined' )  return true  ;

                return false ;

                
            }


            this.loadModule(event, module_id, modurl);
        }

        //update filtering modules from other modules. event.g.when the search mod is used
        if (customFiltersProp[module_id].loadOtherModules) {
            query_value='';
            var query_input= document.getElementById('q_'+module_id+'_0');
            if(typeof(query_input)!='undefined'){
                query_value=this.getQueryValue(module_id);
                if(typeof customFilters.previousQueryValue=='undefined'){
                    customFilters.previousQueryValue=query_value;
                }
                if(customFilters.keyword_search_clear_filters_on_new_search && query_value!=customFilters.previousQueryValue){
                    modurl=customFiltersProp[module_id].base_url+'index.php?option=com_customfilters&view=module';
                    if(typeof element.id!='undefined' && element.id=='q_'+module_id+'_clear')query_value='';
                    if(query_value){
                        //modurl
                        if(modurl.indexOf('?')==-1)modurl+='?';
                        else modurl+='&';
                        modurl+='q='+query_value;
                    }
                }

                var filteringModIds=this.getFilteringModules();
                for(var i=0; i<filteringModIds.length; i++){
                    this.updateFilteringModuleWithSearchQuery(filteringModIds[i],query_value);
                    this.loadModule(event, filteringModIds[i], modurl);
                }
            }
        }
        //store the last used keyword search
        this.setLastQueryValue(query_value);
    },

    getQueryValue:function(module_id) {
        let query_input=document.getElementById('q_'+module_id+'_0');
        return query_input.value;
    },

    setLastQueryValue:function(query_value) {
        //store the last used keyword search
        customFilters.previousQueryValue=query_value;
    },

    generateURL:function(module_id, query_value) {

        //reset other filters if a new search phrase. This process is triggered based on a component setting
        if(customFilters.keyword_search_clear_filters_on_new_search && query_value!=customFilters.previousQueryValue){
            //find the base url for the search
            var url=customFiltersProp[module_id].component_base_url;
            if(query_value){
                //url
                if(url.indexOf('?')==-1)url+='?';
                else url+='&';
                url+='q='+query_value;
                return url;
            }
        }
        return false;
    },


    getFilterName: function (name) {
        var filterName = name.match(/([a-z]+_){1,2}/i);
        if (filterName[0]) {
            filterName = filterName[0].replace(/(_{1}$)/, '');
        }
        else filterName = '';
        return filterName;
    },

    getFilteringModules: function () {
        var filteringMods = $$('.cf_wrapp_all');
        var ids = new Array();
        for (var i = 0; i < filteringMods.length; i++) {
            var id = filteringMods[i].id;
            if (id) parseInt(ids.push(id.substring(13)));
        }
        return ids;
    },

    getBreadcrumbModules: function () {
        var modules = $$('.cf_breadcrumbs_wrapper');
        var ids = new Array();
        for (var i = 0; i < modules.length; i++) {
            var id = modules[i].getAttribute('data-moduleid');
            if (id) {
                parseInt(ids.push(id));
            }
        }
        return ids;
    },

    updateFilteringModuleWithSearchQuery: function (module_id, query_value) {
        let moduleForm = document.getElementById('cf_form_' + module_id);

        if (moduleForm != null) {
            moduleForm.querySelector('input[name=q]').value = query_value;
        }
    },

    updateSearchModulesWithSearchQuery: function (query_value) {
        var searchMods = document.querySelectorAll('.cf-form-search');
        for (var i = 0; i < searchMods.length; i++) {
            searchMods[i].querySelector('.cf_message').innerHTML = '';
            searchMods[i].querySelector('.cf_message').setStyle("display", "none");
            searchMods[i].querySelector('input[name=q]').value = query_value;
        }
    },

    /**
     * Load/update the module with ajax
     *
     * @param {Event} event
     * @param {Number} module_id
     * @param {String} url
     */
    loadModule: function (event, module_id, url) {
        this.httpRequest(module_id, event, type = 'module', url);

    },

    /**
     * Load/update the results with ajax
     *
     * @param {Number} module_id
     * @param {String} url
     */
    loadResults: function (module_id, url) {
        this.httpRequest(module_id, event = null, type = 'component', url);
    },

    /**
     * Handles the ajax requests
     *
     * @param {Number} module_id
     * @param {Event} event
     * @param {String} type
     * @param {String} url
     * @returns {boolean}
     */
    httpRequest: function (module_id, event, type, url) {

        // Results wrapper selector
        let moduleResultsWrapperSelector = "#cf_wrapp_all_" + module_id;
        let componentResultsWrapperSelector = '';

        // Base Url
        let baseURL;

        // Use loading icon
        let useAjaxOverlay = false;
        if (typeof customFiltersProp[module_id] != "undefined") {
            if (typeof customFiltersProp[module_id].results_wrapper != "undefined") {
                componentResultsWrapperSelector = '#' + customFiltersProp[module_id].results_wrapper;
            }

            useAjaxOverlay = type == 'module' ? customFiltersProp[module_id].use_ajax_spinner : customFiltersProp[module_id].use_results_ajax_spinner;
            baseURL = customFiltersProp[module_id].base_url;
        }
        let targetWrapperSelector = type == 'module' ? moduleResultsWrapperSelector : componentResultsWrapperSelector;

        // Ajax overlay wrapper selector
        let moduleAjaxOverlaySelector = "#cf_ajax_loader_" + module_id;
        let componentAjaxOverlaySelector = "#cf_res_ajax_loader";
        let ajaxOverlaySelector = type == 'module' ? moduleAjaxOverlaySelector : componentAjaxOverlaySelector;

        // form
        let form = document.querySelector("#cf_form_" + module_id);

        // create our wrapper elements
        let ajaxOverlayWrapper = document.querySelector(ajaxOverlaySelector);
        let targetWrapper = document.querySelector(targetWrapperSelector);

        // create the request object
        let request = new XMLHttpRequest();

        if (url) {
            try {
                var urlObject = new URL(url, baseURL);
            } catch (e) {
                console.error('The supplied url is not valid. Error:' + e);
                return false;
            }

            // Set the query params needed for the module
            if (type == 'module') {
                urlObject.searchParams.set("view", "module");
                urlObject.searchParams.set("format", "raw");
                urlObject.searchParams.set("module_id", module_id);
            }
            urlObject.searchParams.set("tmpl", "component");
            request.open("POST", urlObject.toString());

            // The request is on progress
            request.onloadstart = function () {

                // go to the top if we are down the page
                if (type == 'component' && window.scrollY - targetWrapper.getTop() > 720) {
                    targetWrapper.scrollIntoView(({behavior: 'smooth'}));
                }

                if (useAjaxOverlay == true && ajaxOverlayWrapper != null) {
                    customFilters.formatModuleAjaxOverlay(ajaxOverlayWrapper, targetWrapper, event, type);
                }
            };
            try {
                request.send();
            } catch (e) {
                console.error('The http request cannot be completed due to error:' + e);
                return false;
            }

        } else {
            let formData = new FormData(form);

            // Set the query params needed for the module
            if (type == 'module') {
                formData.append('view', 'module');
                formData.append('format', 'raw');
                formData.append('module_id', module_id);
            }
            else {
                // We need the url of the results to update the window state (i.e. address bar)
                baseURL = form.getAttribute('action');
                if(baseURL.indexOf('?')==-1){
                    baseURL+='?';
                }
                else {
                    baseURL+='&';
                }
                url = new URLSearchParams(formData).toString();
                url = customFilters.cleanQueryString(url);
                url = baseURL + url;
            }

            formData.append('tmpl', 'component');
            formData.append('method', 'post');

            request.open("POST", form.getAttribute('action'));

            // The request is on progress
            request.onloadstart = function () {

                // go to the top if we are down the page
                if (type == 'component' && window.scrollY - targetWrapper.getTop() > 720) {
                    targetWrapper.scrollIntoView(({behavior: 'smooth'}));
                }

                if (useAjaxOverlay == true && ajaxOverlayWrapper != null) {
                    customFilters.formatModuleAjaxOverlay(ajaxOverlayWrapper, targetWrapper, event, type);
                }
            };
            try {
                request.send(formData);
            } catch (e) {
                console.error('The http request cannot be completed due to error:' + e);
                return false;
            }
        }

        // The request returns an error
        request.onerror = function () {
            if (ajaxOverlayWrapper != null) {
                ajaxOverlayWrapper.setStyle("display", "none");
            }
            console.error('The http request cannot be completed due to error:' + request.status + ' ' + request.statusText);
            return false;
        };

        // The request completed :)
        request.onload = function () {
            if (ajaxOverlayWrapper != null) {
                ajaxOverlayWrapper.setStyle("display", "none");
            }
            let response = new Object();
            response.text = request.responseText.removeScripts(function (script) {
                response.script = script;
            });

            // We need to get only the inner part of the results
            // Нам нужно получить только внутреннюю часть результатов
            if (type === 'component') {

                // Get the title from the results
                let title = response.text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
                if (title) {
                    // set a new title
                    document.title = title[1];
                }

                let keywords = response.text.match(/<meta name="keywords" content="([\s\S]*?)" \/>/i);
                if (keywords) {
                    // set a new keywords

                    document.querySelector('meta[name="keywords"]').setAttribute("content", keywords[1]);
                }

                let description = response.text.match(/<meta name="description" content="([\s\S]*?)" \/>/i);
                if ( description ) {
                    // set a new description
                    document.querySelector('meta[name="description"]').setAttribute("content", keywords[1]);
                }



                // Get the body from the results
                var match = response.text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

                if (match) {
                    response.text = match[1];
                } else {
                    console.error('The results response does not contain body element');
                }
                let temp = new Element('div').set('html', response.text);
                let resultsElement = temp.querySelector(componentResultsWrapperSelector);
                if (resultsElement) {
                    response.text = resultsElement.innerHTML;
                } else {
                    console.error('The results response does not include the wrapper element:' + componentResultsWrapperSelector + ' Make sure that the breakdesigns ajax plugin is enabled.');
                    return false;
                }
            }

            if (response.text) {
                targetWrapper.innerHTML = response.text;
            } else {
                targetWrapper.innerHTML = '';
            }

            if (response.script) {
                //evaluate the scripts of the results
                try {
                    window.eval(response.script);
                } catch (e) {
                    console.error(e);
                }
            }

            if (type == 'component') {
                customFilters.triggerResultsScripts();
                if (url) {
                    customFilters.setWindowState(url);
                }
                try {
                    customFilters.updateDependentModules(module_id);
                } catch (e) {
                    console.error(e);
                }

            }
        };
        return true;
    },
    /**
     * Clean the query from empty vars
     *
     * @param method
     * @returns {string}
     */
    cleanQueryString: function(url){
        return url.split('&').filter(function(val){
            var index = val.indexOf('='),
                key = index < 0 ? '' : val.substr(0, index),
                value = val.substr(index + 1);

            return (value || value === 0);
        }).join('&');
    },

    /**
     * Formats the ajax overlay wrapper
     *
     * @param {Element} ajaxOverlayWrapperElement
     * @param {Element} resultsWrapperElement
     * @param event
     * @param {String} type
     * @returns {Boolean}
     * @since 2.8.2
     */
    formatModuleAjaxOverlay: function (ajaxOverlayWrapperElement, resultsWrapperElement, event, type) {
        let size = resultsWrapperElement.getSize();
        let position = resultsWrapperElement.getPosition();


        if (type == 'module') {
            ajaxOverlayWrapperElement.addClass("cf_ajax_loader");

            // we pass the event only when the module is loaded
            if(event != null && typeof event.event != "undefined" && typeof event.event.pageY != "undefined") {
                positionY = event.event.pageY - position.y;
                ajaxOverlayWrapperElement.setStyle("background-position", "center " + positionY + "px");
            }
        }

        ajaxOverlayWrapperElement.setStyle("display", "block");
        ajaxOverlayWrapperElement.setStyle("height", size.y + "px");
        ajaxOverlayWrapperElement.setStyle("width", size.x + "px");
        return true;
    },

    /**
     * Trigger any js function needed for the results to work properly.
     *
     * @returns {boolean}
     * @since 2.8.2
     */
    triggerResultsScripts: function () {
        if (typeof Virtuemart != "undefined" && typeof Virtuemart.product != "undefined") {
            Virtuemart.product(jQuery("form.product"));
        }

        //the stockable plugin triggers also the CustomfieldsForAll functions
        if (typeof (Stockablecustomfields) != 'undefined' && typeof (Stockablecustomfields.setEvents) === "function") {
            Stockablecustomfields.setEvents();
        } else if (typeof (CustomfieldsForAll) != 'undefined' && typeof (CustomfieldsForAll.eventHandler) === "function") {
            CustomfieldsForAll.eventHandler();
        }

        // Trigger DependentCustomfieldsForAll
        if (typeof (DependentCustomfieldsForAll) != 'undefined' && typeof (DependentCustomfieldsForAll.eventHandler) === "function") {
            DependentCustomfieldsForAll.eventHandler();
            let forms = jQuery("form.product");
            setTimeout(function() {
                DependentCustomfieldsForAll.handleForms(forms);
            }, 13);
        }

        //the VM orderlist does not work after ajax
        jQuery('.orderlistcontainer').hover(function () {
                jQuery(this).find('.orderlist').stop().show()
            },
            function () {
                jQuery(this).find('.orderlist').stop().hide()
            });

        return true;
    },

    /**
     *  Update dependent modules
     *
     * @returns {boolean}
     * @since 2.8.2
     */
    updateDependentModules: function (module_id) {
        //load the breadcrumbs modules
        var breadcrumbModuleIds = customFilters.getBreadcrumbModules();
        var moduleUrl = customFiltersProp[module_id].base_url + 'index.php?option=com_customfilters&view=module';
        for (var i = 0; i < breadcrumbModuleIds.length; i++) {
            customFilters.loadModule(event = undefined, breadcrumbModuleIds[i], moduleUrl);
        }
        return true;
    },

    setWindowState: function (e) {
        this.counterHist++;
        var t = window.history.state;
        if (window.history.pushState && window.history.replaceState) {
            window.history.pushState({
                page: this.counterHist
            }, "Search Results", e)
        }
    },

    addEventTree: function (e) {
        var t = "virtuemart_category_id";
        if (customFiltersProp[e].parent_link == false) {
            document.id("cf_wrapp_all_" + e).addEvent("click:relay(.cf_parentOpt)", function (event, element) {
                treeToggle(event, element);
                return false;
            });

            document.id("cf_wrapp_all_" + e).addEvent("keydown:relay(.cf_parentOpt)", function (event, element) {
                if(event.key=='enter' || event.key=='right' || event.key=='left') {
                    treeToggle(event, element);
                }
                return false;
            });

            function treeToggle(event, element) {
                event.stop();
                var classes = element.getProperty("class");
                var classesArray = classes.split(" ");
                var elementSelector;
                if (element.hasClass("cf_unexpand")) {
                    element.removeClass("cf_unexpand");
                    element.addClass("cf_expand")
                } else if (element.hasClass("cf_expand")) {
                    element.removeClass("cf_expand");
                    element.addClass("cf_unexpand")
                }
                for (var a = 0; a < classesArray.length; a++) {
                    if (classesArray[a].indexOf("tree") >= 0) elementSelector = classesArray[a]
                }
                var elementId = element.getProperty("id");
                elementId = parseInt(elementId.slice(elementId.indexOf("_elid") + 5));
                if (elementSelector) {
                    elementSelector += "-" + elementId;
                    var liElement = document.id("cf_list_" + t + "_" + e).getElements(".li-" + elementSelector);
                    if (liElement[0].hasClass("cf_invisible")) var c = false;
                    else var c = true;
                    for (var a = 0; a < liElement.length; a++) {
                        if (c == false) {
                            liElement[a].removeClass("cf_invisible")
                        } else {
                            var h = document.id("cf_list_" + t + "_" + e).getElements("li[class*=" + elementSelector + "]");
                            for (var p = 0; p < h.length; p++) {
                                h[p].addClass("cf_invisible");
                                if (h[p].hasClass("cf_parentLi")) {
                                    h[p].getElement("a").removeClass("cf_expand");
                                    h[p].getElement("a").addClass("cf_unexpand")
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    addEventsRangeInputs: function (e, t) {
        var n = e + "_" + t;
        var r = document.id(n + "_0");
        var i = document.id(n + "_1");
        if (r && i) {
            customFilters.validateRangeFlt(t, e);
            var s = document.id(n + "_slider");
            r.addEvent("keyup", function (n) {
                var r = customFilters.validateRangeFlt(t, e);
                if (s != null) customFilters.setSliderValues(t, e, r, "min")
            });
            i.addEvent("keyup", function (n) {
                var r = customFilters.validateRangeFlt(t, e);
                if (s != null)customFilters.setSliderValues(t, e, r, "max")
            });
            if (customFiltersProp[t].results_trigger == "btn") {
                r.addEvent("change", function (n) {
                    var i = customFilters.validateRangeFlt(t, e);
                    if (i) customFilters.listen(r, t)
                });
                i.addEvent("change", function (n) {
                    var r = customFilters.validateRangeFlt(t, e);
                    if (r) customFilters.listen(i, t)
                })
            }
        }
    },

    createToggle: function (displayKey, state) {
        var element = jQuery('#cf_wrapper_inner_'+ displayKey);
        var cookieState = Cookie.read(displayKey) ? Cookie.read(displayKey) : state;
        var display = cookieState == 'show' ? true : false;
        element.toggle(display);
        customFilters.setHeaderClass(displayKey, cookieState);
        customFilters.setAriaExpanded(displayKey, cookieState);

        document.querySelector("#cfhead_" + displayKey).addEventListener('click', function (state) {
            element.toggle();
            if (element.is(':visible')) var mystate = "show";
            else var mystate = "hide";
            customFilters.setHeaderClass(displayKey, mystate);
            customFilters.setAriaExpanded(displayKey, mystate);
            var s = Cookie.write(displayKey, mystate);
        });
    },

    setHeaderClass: function (displayKey, state) {
        let elementId = "headexpand_" + displayKey;
        let element = document.getElementById(elementId);
        if (state == "hide") {
            element.removeClass("headexpand_show");
            element.addClass("headexpand_hide")
        } else {
            element.removeClass("headexpand_hide");
            element.addClass("headexpand_show")
        }
    },

    setAriaExpanded: function (displayKey, state) {
        let elementId = "#cfhead_" + displayKey;
        let element = document.querySelector(elementId);
        if (state == "hide") {
            element.setAttribute("aria-expanded", "false");
        } else {
            element.setAttribute("aria-expanded", "true");
        }
    },

    validateRangeFlt: function (module_id, filter_name) {
        let filter_key = filter_name + "_" + module_id;
        const from_el = document.getElementById(filter_key + "_0");
        const to_el = document.getElementById(filter_key + "_1");
        let submit_button = null;
        if (customFiltersProp[module_id].results_trigger != "btn") {
            submit_button = document.getElementById(filter_key + "_button");
        }
        let from_value = from_el.value.replace(",", ".");
        var o = from_value.match(/^[+-]?\d+(\.\d*)?$/);
        let to_value = to_el.value.replace(",", ".");
        var a = to_value.match(/^[+-]?\d+(\.\d*)?$/);
        if (o && to_value.length == 0 || a && from_value.length == 0 || o && a) {
            if (from_value.length > 0 && to_value.length > 0 && parseFloat(from_value) > parseFloat(to_value)) {
                if (submit_button) {
                    submit_button.setAttribute("disabled", "disabled");
                }
                this.displayMsg("", filter_key);
                return false
            } else {
                if (submit_button) {
                    submit_button.removeAttribute("disabled");
                }
                this.displayMsg("", filter_key);
                return new Array(from_value, to_value);
            }
        } else {
            if (submit_button) {
                submit_button.setAttribute("disabled", "disabled");
            }
            if (to_value.length > 0 || from_value.length > 0) {
                this.displayMsg(Joomla.JText._("MOD_CF_FILTERING_INVALID_CHARACTER"), filter_key)
            } else this.displayMsg("", filter_key)
        }
        return false
    },

    validateInput: function (filter_name, module_id) {
        let filter_id=filter_name+ '_' +module_id;
        let filter = document.getElementById(filter_id + "_0");
        if(!filter) return true;
        let value = filter.value;

        //an input has to be at least 2 characters long
        if(value.length<2){
            this.displayMsg(Joomla.JText._("MOD_CF_FILTERING_MIN_CHARACTERS_LIMIT"), filter_id);
            return false;
        } else {
            this.displayMsg('', filter_id);
            return true;
        }
    },

    displayMsg: function (message, filter_key) {
        var message_el = document.getElementById(filter_key + "_message");
        if (message) {
            message_el.style.display="block";
            message_el.innerHTML = message
        } else {
            message_el.style.display="none";
        }
    },

    setSliderValues: function (module_id, filter, valid, minOrMax) {
        var flt_key = filter + "_" + module_id;
        var sliderObj = eval(flt_key + "_sliderObj");
        if (valid != false) {
            var min_val = parseInt(valid[0]);
            if (isNaN(min_val)) min_val = parseInt(customFiltersProp[module_id].slider_min_value);
            var max_val = parseInt(valid[1]);
            if (isNaN(max_val)) max_val = parseInt(customFiltersProp[module_id].slider_max_value);
            sliderObj.setMin(min_val);
            sliderObj.setMax(max_val)
        } else {
            if (minOrMax == "min") sliderObj.setMin(parseInt(customFiltersProp[module_id].slider_min_value));
            else if (minOrMax == "max") sliderObj.setMax(parseInt(customFiltersProp[module_id].slider_max_value))
        }
    }
};

/**
 * Class that filter's the list elements (text), through a text input
 */
var CfElementFilter = new Class({
    Implements: [Options, Events],
    options: {
        module_id: null,
        isexpanable_tree: false,
        filter_key: '',
        cache: true,
        caseSensitive: false,
        ignoreKeys: [13, 27, 32, 37, 38, 39, 40],
        matchAnywhere: true,
        optionClass:".cf_option",
        property: "text",
        trigger:"keyup",
        onHide: '',
        onComplete: '',
        onStart:function(){
            this.elements.addClass('cf_hide');
        },

        onShow: function(element) {
            element.removeClass('cf_hide');
        },

        onMatchText:function(element){
            var user_input = this.observeElement.value;
            var i = this.options.caseSensitive ? "" : "i";
            var regex = new RegExp(user_input, i);
            var textElements=element.getElements(this.options.optionClass);//the text part of the element
            var text=textElements[0].get(this.options.property);
            //convert all to lower case to achieve the matching and get the start char
            var text_lc=text.toLowerCase();
            var user_input_lc=user_input.toLowerCase();
            var start_char=text_lc.indexOf(user_input_lc);
            //get the part from the list element-not from the input. Because of the letter case the user uses in the input
            var part=text.substr(start_char,user_input.length);
            //wrapp the part
            var matchedtext=text.replace(regex,'<span class="cf_match">'+part+'</span>');
            textElements[0].set('html',matchedtext);
        }
    },

    initialize: function (observer, list, options) {
        this.setOptions(options);
        this.observeElement = document.id(observer);
        this.elements = $$(list);
        this.matches = this.elements;
        this.listen()
    },

    listen: function () {
        this.observeElement.addEvent(this.options.trigger, function (e) {
            if (this.observeElement.value.length) {
                if (!this.options.ignoreKeys.contains(e.code)) {
                    this.fireEvent("start");
                    this.findMatches(this.options.cache ? this.matches : this.elements);
                    this.fireEvent("complete")
                }
            } else {
                this.elements.removeClass("cf_hide");
                this.clearHtmlFromText(this.elements);
                this.findMatches(this.elements, false);
                var hiddenEl=this.elements.getElements('.cf_invisible');
                hiddenEl.each(function (e) { e.setStyle('display','');});
            }
        }.bind(this))
    },

    findMatches: function (elements, t) {
        var user_input = this.observeElement.value;
        var user_input2 = this.options.matchAnywhere ? user_input : "^" + user_input;
        var i = this.options.caseSensitive ? "" : "i";
        var regex = new RegExp(user_input2, i);
        var o = [];
        elements.each(function (e) {
            var n = t == undefined ? regex.test(e.get(this.options.property)) : t;
            var hiddenEl = e.getProperty("class").contains("cf_invisible", " "); //hidden categories

            if (n) {
                if (hiddenEl) {e.setStyle('display','block'); }
                this.fireEvent("matchText", [e]);
                this.fireEvent("show", [e]);
                //o.push(e);
                //e.store("showing", true);
            } else {
                if (hiddenEl) {e.setStyle('display',''); }
                if (e.retrieve("showing")) {
                    this.fireEvent("hide", [e])
                }
                e.store("showing", false);
            }
            return true;
        }.bind(this));
    },

    /**
     * Clear all the html tags from the text/labels of the values
     * @param Array elements
     */
    clearHtmlFromText:function(elements){
        elements.each(function (element) {
            var textElements=element.getElements(this.options.optionClass);//the text part of the element
            var text=textElements[0].get(this.options.property);//strip html code
            textElements[0].set('html',text);
        }.bind(this));
    }
});

class CfTooltip {

    constructor(element, tipId) {
        this.attachElement = document.querySelector(element);
        if(Array.isArray(this.attachElement)) {
            this.attachElement = this.attachElement[0];
        }
        this.id = tipId;
        this.tip;
        this.init();
    };
    init () {
        this.tip = document.querySelector('#'+this.id);
        this.positionX();
        return true;

    };
    getPosition () {
        let el = this.attachElement;
        return {
            top: el.offsetTop,
            left: el.offsetLeft
        };
    }
    positionX () {
        let position = this.getPosition();
        this.tip.style.left = parseInt(position.left) - 5 + 'px'
    }
    positionY () {
        let position = this.getPosition();
        this.tip.style.top = parseInt(position.top) + 20     + 'px'
    }
    getValue () {
        let value = this.attachElement.getAttribute('data-tooltip');
        if(!value) {
            value = '';
        }
        return value;
    }
    setValue (value) {
        this.tip.innerHTML = value;
        this.attachElement.setAttribute('data-tooltip', value);
        this.attachElement.setAttribute('aria-valuenow', value);
        return true;
    }
}

String.prototype.removeScripts = function(exec){
    let scripts = '';

    // Quote json strings. Otherwise they produce an error when evaluated.
    let textNoJson = this.replace(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi, function(all, code){
        scripts+= '\''+code+'\'' + '\n';
    });

    // remove the scripts from the text
    let text = textNoJson.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function(all, code){
        scripts += code + '\n';
        return '';
    });

    if (typeOf(exec) == 'function') exec(scripts, text);
    return text;
};
