
window.onpopstate = function (e) {
    location.href = document.location;

};




var customFilters = {
    eventsAssigned: [],
    uriLocationState: {
        page: "Results"
    },
    counterHist: 0,
    assignEvents: function (module_id) {
        let moduleWrapper = document.getElementById("cf_wrapp_all_" + module_id);

        if (customFiltersProp[module_id].results_trigger == "btn" || customFiltersProp[module_id].results_loading_mode == "ajax") {

            // link click event
            let links = [].slice.call(moduleWrapper.querySelectorAll('a'));
            links.forEach((link) => {
                link.addEventListener("click", (event) => {
                    event.preventDefault();

                    // Do not use the parent nodes as links
                    if (customFiltersProp[module_id].category_flt_parent_link == false) {
                        if (link.classList.contains("cf_parentOpt")) {
                            return false
                        }
                    }
                    const url = link.getAttribute("href");
                    customFilters.listen(event, link, module_id, url);
                });
            });

            // link enter keydown event
            links.forEach((link) => {
                link.addEventListener("keydown", (event) => {
                    if (event.key != 'enter') {
                        return false;
                    }
                    event.preventDefault();
                    if (customFiltersProp[module_id].category_flt_parent_link == false) {
                        if (link.classList.contains("cf_parentOpt")) return false
                    }
                    const url = link.getAttribute("href");
                    customFilters.listen(event, link, module_id, url);
                });
            });

            // Input click event
            let checkboxes = [].slice.call(moduleWrapper.querySelectorAll('input[type=checkbox]'));
            let radioButtons = [].slice.call(moduleWrapper.querySelectorAll('input[type=radio]'));
            let checkboxesAndRadioButtons = checkboxes.concat(radioButtons);
            checkboxesAndRadioButtons.forEach((input) => {
                input.addEventListener("click", function (event) {
                    let url = '';
                    const anchor = document.getElementById(input.id + "_a");
                    if (anchor) {
                        url = anchor.getAttribute("href");
                    }
                    customFilters.listen(event, input, module_id, url);
                });
            });

            // Select drop down change
            let selectDropDowns = [].slice.call(moduleWrapper.querySelectorAll('select[class=cf_flt]'));
            selectDropDowns.forEach((selectDropDown) => {
                selectDropDown.addEventListener("change", function (event) {
                    event.preventDefault();
                    const url = this.options[this.selectedIndex].getAttribute('data-url');
                    customFilters.listen(event, selectDropDown, module_id, url);
                });
            });
        }

        /*The module form submit btn*/
        if (customFiltersProp[module_id].results_loading_mode == "ajax" && customFiltersProp[module_id].results_trigger == "btn") {

            let submitInput = [].slice.call(moduleWrapper.querySelectorAll('input[type=submit]'));
            let submitButtons = submitInput.concat([].slice.call(moduleWrapper.querySelectorAll('button[type=submit]')));

            // Select drop down change
            submitButtons.forEach((submitButton) => {
                submitButton.addEventListener("click", function (event) {
                    event.preventDefault();
                    customFilters.listen(event, submitButton, module_id);
                });
            });
        }

        /*
         * The search btn resides in various filters
         * This does not work only with ajax but with http as well
         */
        let searchButtons = [].slice.call(moduleWrapper.querySelectorAll('button.cf_search_button'));
        searchButtons.forEach((searchButton) => {
            searchButton.addEventListener("click", function (event) {
                event.preventDefault();
                let from_subquery = "";
                let to_subquery = "";
                let subQuery = "";
                let id = this.getAttribute("id");
                let filter_key = id.substr(0, id.indexOf("_button"));
                let filter_base_url = document.getElementById(filter_key + "_url").value;
                let isQueryExists = filter_base_url.indexOf("?");
                let delimiter = "?";
                let from_value = '';
                let to_value = '';
                let from_name = '';
                let to_name = '';
                let url = '';

                let fromField = document.getElementById(filter_key + '_0');
                let toField = document.getElementById(filter_key + '_1');

                //is range inputs
                if (fromField && toField) {
                    from_value = fromField.value;
                    to_value = toField.value;

                    from_name = fromField.name;
                    to_name = toField.name;
                }
                //is simple input
                else {
                    from_value = fromField.value;
                    from_name = fromField.name;
                }

                if (isQueryExists != -1) {
                    delimiter = "&";
                }

                if (from_value) {
                    from_subquery = from_name + "=" + from_value;
                }
                if (to_value) {
                    to_subquery = to_name + "=" + to_value;
                }

                if (from_subquery && !to_subquery) {
                    subQuery += delimiter + from_subquery;
                } else if (!from_subquery && to_subquery) {
                    subQuery += delimiter + to_subquery;
                } else {
                    subQuery += delimiter + from_subquery + "&" + to_subquery;
                }
                if (subQuery) {
                    url = filter_base_url + subQuery;
                }

                if (url) {
                    if (customFiltersProp[module_id].results_loading_mode == "ajax" || customFiltersProp[module_id].results_trigger == "btn") {
                        customFilters.listen(event, searchButton, module_id, url);
                    } else {
                        window.top.location.href = url;
                    }
                }
            });
        });
    },

    listen: function (event, element, module_id, url) {
        if (!module_id) {
            return;
        }
        let formSubmitBtn = false;
        let query_value = '';
        let moduleUrl = url;
        let filterName = '';

        //if it is html element, check if it is the module's submit btn
        if (element.nodeType) {
            formSubmitBtn = element.classList.contains('cf_apply_button');
        }

        if (typeof element.getProperty != "undefined" && element.getProperty('id')) {
            filterName = this.getFilterName(element.getProperty('id'));
        }

        //call some functions related with the query search
        if (filterName === 'q' || formSubmitBtn) {
            if (!this.validateInput(filterName, module_id)) {
                return false;
            }
        }

        //A.get the search query, B. reset the filters by setting a new modurl, if new and there is such setting in the component
        if (typeof customFiltersProp[module_id].mod_type != "undefined" && customFiltersProp[module_id].mod_type === 'filtering') {
            let query_input = document.getElementById('q_' + module_id + '_0');

            // fix for issue: https://github.com/breakdesigns/mod_cf_filtering/issues/22
            if ( filterName === 'virtuemart_category' && typeof customFiltersProp[module_id].category_flt_onchange_reset != "undefined" && customFiltersProp[module_id].category_flt_onchange_reset == 'filters_keywords') {
                query_input = null;
            }
            if (query_input) {
                let query_value = this.getQueryValue(module_id);
                if (typeof element.id != 'undefined' && element.id == 'q_' + module_id + '_clear') {
                    query_value = '';
                }
                if (typeof customFilters.previousQueryValue == 'undefined') {
                    customFilters.previousQueryValue = query_value;
                }

                if (customFilters.keyword_search_clear_filters_on_new_search && query_value != customFilters.previousQueryValue) {
                    let moduleUrl = customFiltersProp[module_id].base_url + 'index.php?option=com_customfilters&view=module&Itemid=' + customFiltersProp[module_id].Itemid;
                    if (query_value) {
                        //modurl
                        if (moduleUrl.indexOf('?') == -1) {
                            moduleUrl += '?';
                        } else {
                            moduleUrl += '&';
                        }
                        moduleUrl += 'q=' + query_value;
                    }
                }
            }
        }

        //Load the results.
        // a) Only when ajax is enabled,
        // b) the results trigger is not button (after every selection),
        // c) The results trigger is btn and the current action regards the button press/submit
        if (
            customFiltersProp[module_id].results_loading_mode === "ajax"
            &&
            (
                customFiltersProp[module_id].results_trigger !== "btn"
                || (
                    customFiltersProp[module_id].results_trigger === "btn" && formSubmitBtn
                )
            )
        ) {

            //if we use a keyword search in the filtering mod update the search module as well
            if (
                typeof customFiltersProp[module_id].mod_type != "undefined"
                &&
                customFiltersProp[module_id].mod_type === 'filtering'
            ) {
                let query_input = document.getElementById('q_' + module_id + '_0');

                if (query_input) {
                    let query_value = this.getQueryValue(module_id);
                    //reset other filters if a new search phrase. This process is triggered based on a component setting
                    if (customFilters.keyword_search_clear_filters_on_new_search && query_value != customFilters.previousQueryValue) {
                        //find the base url for the search
                        let url = customFiltersProp[module_id].component_base_url;
                        if (query_value) {
                            //url
                            if (url.indexOf('?') == -1) url += '?';
                            else url += '&';
                            url += 'q=' + query_value;
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
            this.loadModule(event, module_id, moduleUrl);
        }

        //update filtering modules from other modules. event.g.when the search mod is used
        if (customFiltersProp[module_id].loadOtherModules) {
            const query_input = document.getElementById('q_' + module_id + '_0');

            if (typeof (query_input) != 'undefined') {
                let query_value = this.getQueryValue(module_id);
                if (typeof customFilters.previousQueryValue == 'undefined') {
                    customFilters.previousQueryValue = query_value;
                }
                if (customFilters.keyword_search_clear_filters_on_new_search && query_value != customFilters.previousQueryValue) {
                    moduleUrl = customFiltersProp[module_id].base_url + 'index.php?option=com_customfilters&view=module';
                    if (typeof element.id != 'undefined' && element.id == 'q_' + module_id + '_clear') query_value = '';
                    if (query_value) {
                        //modurl
                        if (moduleUrl.indexOf('?') == -1) moduleUrl += '?';
                        else moduleUrl += '&';
                        moduleUrl += 'q=' + query_value;
                    }
                }

                const filteringModIds = this.getFilteringModules();
                for (let i = 0; i < filteringModIds.length; i++) {
                    this.updateFilteringModuleWithSearchQuery(filteringModIds[i], query_value);
                    this.loadModule(event, filteringModIds[i], moduleUrl);
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

        if (filterName !== null && filterName[0]) {
            filterName = filterName[0].replace(/(_{1}$)/, '');
        }
        else filterName = '';
        return filterName;
    },

    getFilteringModules: function () {
        const filteringMods = document.querySelectorAll('.cf_wrapp_all');
        let ids = [];
        for (let i = 0; i < filteringMods.length; i++) {
            let id = filteringMods[i].id;
            if (id) {
                ids.push(id.substring(13));
            }
        }
        return ids;
    },

    getBreadcrumbModules: function () {
        const modules = document.querySelectorAll('.cf_breadcrumbs_wrapper');
        let ids = [];
        for (let i = 0; i < modules.length; i++) {
            const id = modules[i].getAttribute('data-moduleid');
            if (id) {
                ids.push(id);
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
        let optionsStorage = Joomla.getOptions('mod_cf_filtering');
        if (optionsStorage.category_url === url ){
           /* url = '/index.php?option=com_ajax&module=cf_filtering&id=' + module_id
                + '&method=loadResetModule'
                + '&virtuemart_category_id=' + optionsStorage.category_id
                // + '&format=json'*/
            window.location.href = optionsStorage.category_url ;
            return ;
        }
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
    httpRequest: function (module_id, event, type, url, clearAreaOnLoad = true) {

        // Results wrapper selector
        let moduleResultsWrapperSelector = "#cf_wrapp_all_" + module_id;
        let componentResultsWrapperSelector = '';

        // Base Url
        let baseURL;

        // Use loading icon
        let useAjaxOverlay = clearAreaOnLoad;
        if (typeof customFiltersProp[module_id] != "undefined") {
            if (typeof customFiltersProp[module_id].results_wrapper != "undefined") {
                componentResultsWrapperSelector = '#' + customFiltersProp[module_id].results_wrapper;
            }

            if(clearAreaOnLoad) {
                useAjaxOverlay = type === 'module' ? customFiltersProp[module_id].use_ajax_spinner : customFiltersProp[module_id].use_results_ajax_spinner;
            }
            baseURL = customFiltersProp[module_id].base_url;
        }
        let targetWrapperSelector = type === 'module' ? moduleResultsWrapperSelector : componentResultsWrapperSelector;

        // Ajax overlay wrapper selector
        let moduleAjaxOverlaySelector = "#cf_ajax_loader_" + module_id;
        let componentAjaxOverlaySelector = "#cf_res_ajax_loader";
        let ajaxOverlaySelector = type === 'module' ? moduleAjaxOverlaySelector : componentAjaxOverlaySelector;

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
                urlObject.searchParams.set("async", "1");
                urlObject.searchParams.set("module_id", module_id);
            }
            urlObject.searchParams.set("tmpl", "component");
            request.open("POST", urlObject.toString());

            // The request is on progress
            request.onloadstart = function () {

                // go to the top if we are down the page
                if (type === 'component' && window.scrollY - targetWrapper.offsetTop > 720) {
                    targetWrapper.scrollIntoView(({behavior: 'smooth'}));
                }

                if (useAjaxOverlay === true && ajaxOverlayWrapper != null) {
                    customFilters.formatAjaxOverlay(ajaxOverlayWrapper, targetWrapper, event, type);
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
            if (type === 'module') {
                formData.append('view', 'module');
                formData.append('format', 'raw');
                formData.append('async', 1);
                formData.append('module_id', module_id);
            }
            else {
                // We need the url of the results to update the window state (i.e. address bar)
                baseURL = form.getAttribute('action');
                if(baseURL.indexOf('?')=== -1 ){
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
                if (type === 'component' && window.scrollY - targetWrapper.getBoundingClientRect().y > 720) {
                    targetWrapper.scrollIntoView(({behavior: 'smooth'}));
                }

                if (useAjaxOverlay === true && ajaxOverlayWrapper != null) {
                    customFilters.formatAjaxOverlay(ajaxOverlayWrapper, targetWrapper, event, type);
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
                ajaxOverlayWrapper.style.display = "none";
            }
            console.error('The http request cannot be completed due to error:' + request.status + ' ' + request.statusText);
            return false;
        };

        // The request completed :)
        request.onload = function () {
            if (ajaxOverlayWrapper != null) {
                ajaxOverlayWrapper.style.display = "none";
            }
            let response = {};
            response.text = request.responseText.removeScripts(function (script) {
                response.script = script;
            });

            if(type === 'module') {
                response.text = request.responseText.applyCss();
            }

            // We need to get only the inner part of the results
            if (type === 'component') {

                // Get the title from the results
                let title = response.text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
                if (title) {
                    // set a new title
                    document.title = title[1];
                }

                // Get the body from the results
                const match = response.text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

                if (match) {
                    response.text = match[1];
                } else {
                    console.error('The results response does not contain body element');
                }
                // Dummy element for injecting the response
                const temp = document.createElement('div');
                temp.innerHTML = response.text;
                let resultsElement = temp.querySelector(componentResultsWrapperSelector);
                temp.remove();
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

            if (type === 'component') {
                customFilters.triggerResultsScripts();
                /*
                Dispatch an event after the results update, that can be used by other apps.
                Scripts relevant to the results can be triggered using that event.
                */
                document.dispatchEvent(new CustomEvent('CfResultsUpdate', {
                    bubbles: true,
                    cancelable: true,
                    detail: {url: url}
                }));

                if (url) {
                    customFilters.setWindowState(url);
                }
                try {
                    customFilters.updateDependentModules(module_id);
                } catch (e) {
                    console.error(e);
                }

            }
            else if(type === 'module') {
                if(typeof customFiltersModuleInit === 'function') {
                    // Initialize the filtering module
                    customFiltersModuleInit(module_id);
                }
                /*
                Dispatch an event after the module update, that can be used by other apps.
                Scripts relevant to the modules can be triggered using that event.
                */
                document.dispatchEvent(new CustomEvent('CfModuleUpdate', {
                    bubbles: true,
                    cancelable: true,
                    detail: {module_id: module_id, url: url}
                }));
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
     * Обновить зависимые модули / Update dependent modules
     * @param module_id
     * @returns {boolean}
     */
    updateDependentModules: function (module_id) {
        //load the breadcrumbs modules
        var breadcrumbModuleIds = customFilters.getBreadcrumbModules();
        var moduleUrl = customFiltersProp[module_id].base_url + 'index.php?option=com_customfilters&view=module';

        moduleUrl = window.location.href + '?option=com_customfilters&view=module'
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

    addEventsRangeInputs: function (filterKey, module_id) {
        const elementBaseId = filterKey + "_" + module_id;
        const fromElement = document.getElementById(elementBaseId + "_0");
        const toElement = document.getElementById(elementBaseId + "_1");
        if (fromElement && toElement) {
            customFilters.validateRangeFlt(module_id, filterKey);
            const slider = document.getElementById(elementBaseId + "_slider");
            fromElement.addEventListener("keyup", function (n) {
                const validRange = customFilters.validateRangeFlt(module_id, filterKey);
                if (slider != null) {
                    customFilters.setSliderValues(module_id, filterKey, validRange, "min")
                }
            });
            toElement.addEventListener("keyup", function (n) {
                const validRange = customFilters.validateRangeFlt(module_id, filterKey);
                if (slider != null) {
                    customFilters.setSliderValues(module_id, filterKey, validRange, "max")
                }
            });
            if (customFiltersProp[module_id].results_trigger === "btn") {
                fromElement.addEventListener("change", function (n) {
                    const validRange = customFilters.validateRangeFlt(module_id, filterKey);
                    if (validRange) {
                        customFilters.listen(fromElement, module_id)
                    }
                });
                toElement.addEventListener("change", function (n) {
                    const validRange = customFilters.validateRangeFlt(module_id, filterKey);
                    if (validRange) {
                        customFilters.listen(toElement, module_id)
                    }
                })
            }
        }
    },

    createToggle: function (displayKey, state) {
        // Check if sessionStorage is supported
        const test = 'testKey';
        try {
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
        } catch (e) {
            return false;
        }
        const element = document.getElementById('cf_wrapper_inner_'+ displayKey);
        const sessionState = sessionStorage.getItem(displayKey) ? sessionStorage.getItem(displayKey) : state;
        customFilters.setHeaderClass(displayKey, sessionState);
        customFilters.setAriaExpanded(displayKey, sessionState);
        customFilters.setAriaHidden(displayKey, sessionState);
        const headElement = document.querySelector("#cfhead_" + displayKey);

        if(headElement) {
            headElement.addEventListener('click', function () {
                const detectedHiddenState = element.getAttribute('aria-hidden');
                const newState = detectedHiddenState == 'true' ? 'show' : 'hide';
                customFilters.setHeaderClass(displayKey, newState);
                customFilters.setAriaExpanded(displayKey, newState);
                customFilters.setAriaHidden(displayKey, newState);
                sessionStorage.setItem(displayKey, newState);
            });
        }
    },

    showMoreToggle: function(module_id) {
        let showMoreButtons = [];
        if (module_id) {
            const moduleWrapper = document.getElementById('cf_form_' + module_id);
            if (moduleWrapper) {
                showMoreButtons = moduleWrapper.querySelectorAll('.cf_show_more');
            }
        } else {
            showMoreButtons = document.querySelectorAll('.cf_show_more');
        }

        showMoreButtons.forEach((showMoreButton) => {
            const wrapper = showMoreButton.closest('.cf_wrapper_inner');
            const filterKey = wrapper.id;
            let toggleableElements = document.getElementById(wrapper.id).querySelectorAll('.cf_toggleable');

            showMoreButton.addEventListener('click', (event) => {
                event.preventDefault();
                const shownElements = toggleableElements[0].classList.contains('cf_invisible') ? false : true;

                toggleableElements.forEach((element) => {
                    if(shownElements === false) {
                        element.classList.remove('cf_invisible');
                    }else {
                        element.classList.add('cf_invisible');

                        // Closed open trees when collapsing
                        if(element.classList.contains('cf_parentLi')) {
                            const anchorElement = element.querySelector('a');
                            customFilters.setSubTreeState(anchorElement, 'collapsed');
                        }
                    }
                })

                // Alter the button's label and class
                if(shownElements === false) {
                    showMoreButton.innerHTML = Joomla.JText._('MOD_CF_SHOW_LESS');
                    showMoreButton.classList.remove('cf_show_more--collapsed');
                    showMoreButton.classList.add('cf_show_more--expanded');
                }else {
                    showMoreButton.innerHTML = Joomla.JText._('MOD_CF_SHOW_MORE');
                    showMoreButton.classList.add('cf_show_more--collapsed');
                    showMoreButton.classList.remove('cf_show_more--expanded');
                }
            })
        });
    },

    setHeaderClass: function (displayKey, state) {
        let elementId = "headexpand_" + displayKey;
        let element = document.getElementById(elementId);
        if(element) {
            if (state == "hide") {
                element.classList.remove("headexpand_show");
                element.classList.add("headexpand_hide")
            } else {
                element.classList.remove("headexpand_hide");
                element.classList.add("headexpand_show")
            }
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

    setAriaHidden: function (displayKey, state) {
        let element = document.getElementById('cf_wrapper_inner_'+ displayKey);
        if(element) {
            if (state == "hide") {
                element.setAttribute("aria-hidden", "true");
            } else {
                element.setAttribute("aria-hidden", "false");
            }
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
/*var CfElementFilter = new Class({
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

    /!**
     * Clear all the html tags from the text/labels of the values
     * @param Array elements
     *!/
    clearHtmlFromText:function(elements){
        elements.each(function (element) {
            var textElements=element.getElements(this.options.optionClass);//the text part of the element
            var text=textElements[0].get(this.options.property);//strip html code
            textElements[0].set('html',text);
        }.bind(this));
    }
});*/
class CfElementFilter {
    constructor(observer, list, options) {
        this.observeElement = document.getElementById(observer);
        this.elements = Array.from(document.querySelectorAll(list));
        this.matches = this.elements;
        this.options = {
            module_id: null,
            isexpanable_tree: false,
            filter_key: '',
            cache: true,
            caseSensitive: false,
            ignoreKeys: [13, 27, 32, 37, 38, 39, 40],
            matchAnywhere: true,
            optionClass: ".cf_option",
            property: "text",
            trigger: "keyup",
            onHide: '',
            onComplete: '',
            onStart: function() {
                this.elements.forEach(element => {
                    element.classList.add('cf_hide');
                });
            },
            onShow: function(element) {
                element.classList.remove('cf_hide');
            },
            onMatchText: function(element) {
                var user_input = this.observeElement.value;
                var i = this.options.caseSensitive ? "" : "i";
                var regex = new RegExp(user_input, i);
                var textElements = element.querySelectorAll(this.options.optionClass);
                var text = textElements[0].getAttribute(this.options.property);
                var text_lc = text.toLowerCase();
                var user_input_lc = user_input.toLowerCase();
                var start_char = text_lc.indexOf(user_input_lc);
                var part = text.substr(start_char, user_input.length);
                var matchedtext = text.replace(regex, '<span class="cf_match">' + part + '</span>');
                textElements[0].innerHTML = matchedtext;
            }
        };
        Object.assign(this.options, options);
        this.listen();
    }

    listen() {
        this.observeElement.addEventListener(this.options.trigger, (e) => {
            if (this.observeElement.value.length) {
                if (!this.options.ignoreKeys.includes(e.code)) {
                    this.onStart();
                    this.findMatches(this.options.cache ? this.matches : this.elements);
                    this.onComplete();
                }
            } else {
                this.elements.forEach(element => {
                    element.classList.remove("cf_hide");
                });
                this.clearHtmlFromText(this.elements);
                this.findMatches(this.elements, false);
                var hiddenEl = this.elements.querySelectorAll('.cf_invisible');
                hiddenEl.forEach(function(e) {
                    e.style.display = '';
                });
            }
        });
    }

    onStart() {
        this.elements.forEach(element => {
            element.classList.add('cf_hide');
        });
        if (typeof this.options.onStart === 'function') {
            this.options.onStart.call(this);
        }
    }

    onComplete() {
        if (typeof this.options.onComplete === 'function') {
            this.options.onComplete.call(this);
        }
    }

    findMatches(elements, t) {
        var user_input = this.observeElement.value;
        var user_input2 = this.options.matchAnywhere ? user_input : "^" + user_input;
        var i = this.options.caseSensitive ? "" : "i";
        var regex = new RegExp(user_input2, i);
        elements.forEach(element => {
            var n = t == undefined ? regex.test(element.getAttribute(this.options.property)) : t;
            var hiddenEl = element.classList.contains("cf_invisible"); //hidden categories

            if (n) {
                if (hiddenEl) {
                    element.style.display = 'block';
                }
                this.onMatchText(element);
                this.onShow(element);
            } else {
                if (hiddenEl) {
                    element.style.display = '';
                }
                if (element.dataset.showing) {
                    this.onHide(element);
                }
                element.dataset.showing = false;
            }
        });
    }

    onMatchText(element) {
        if (typeof this.options.onMatchText === 'function') {
            this.options.onMatchText.call(this, element);
        }
    }

    onShow(element) {
        if (typeof this.options.onShow === 'function') {
            this.options.onShow.call(this, element);
        }
    }

    onHide(element) {
        if (typeof this.options.onHide === 'function') {
            this.options.onHide.call(this, element);
        }
    }

    clearHtmlFromText(elements) {
        elements.forEach(element => {
            var textElements = element.querySelectorAll(this.options.optionClass);
            var text = textElements[0].getAttribute(this.options.property);
            textElements[0].innerHTML = text;
        });
    }
}









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
        scripts+= '('+code+')' + '\n';
    });

    // remove the scripts from the text
    let text = textNoJson.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function(all, code){
        scripts += code + '\n';
        return '';
    });

    if (typeof exec == 'function') exec(scripts, text);
    return text;
};

String.prototype.applyCss = function(){
    let css = '';

    // remove the css from the text
    let text = this.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, function(all, code){
        css += code + '\n';
        return '';
    });

    // apply the css
    if (css) {
        let head = document.head || document.getElementsByTagName('head')[0];
        let style = document.createElement('style');
        style.appendChild(document.createTextNode(css));
        head.appendChild(style);
    }
    return text;
};

window.addEventListener('DOMContentLoaded', () => {customFilters.showMoreToggle()});
window.addEventListener('CfModuleUpdate', (event) => {
    let module_id;
    if(typeof event.detail != 'undefined' && event.detail.module_id) {
        module_id = event.detail.module_id;
    }
    customFilters.showMoreToggle(module_id);
});