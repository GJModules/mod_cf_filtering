/* @copyright Copyright (C) 2012-2022 breakdesigns.net . All rights reserved.|* @license GNU General Public License version 2 or later;*/
window.onpopstate = function (e) {
    location.href = document.location;

};

var customFilters = {
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

    init: function(module_id) {
        // Load asynchronously
        if (customFiltersProp[module_id].async_loading == "1") {
            const moduleUrl = customFiltersProp[module_id].component_current_url;
            this.loadModule(new CustomEvent('Load'), module_id, moduleUrl, false);
        }
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
        if (filterName == 'q' || formSubmitBtn) {
            if (!this.validateInput(filterName, module_id)) {
                return false;
            }
        }

        //A.get the search query, B. reset the filters by setting a new modurl, if new and there is such setting in the component
        if (typeof customFiltersProp[module_id].mod_type != "undefined" && customFiltersProp[module_id].mod_type == 'filtering') {
            let query_input = document.getElementById('q_' + module_id + '_0');

            // fix for issue: https://github.com/breakdesigns/mod_cf_filtering/issues/22
            if (filterName == 'virtuemart_category' && typeof customFiltersProp[module_id].category_flt_onchange_reset != "undefined" && customFiltersProp[module_id].category_flt_onchange_reset == 'filters_keywords') {
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

        //Load the results. a)Only when ajax is enabled, b)the results trigger is not button (after every selection), c)The results trigger is btn and the current action regards the button press/submit
        if (customFiltersProp[module_id].results_loading_mode == "ajax" && (customFiltersProp[module_id].results_trigger != "btn" || (customFiltersProp[module_id].results_trigger == "btn" && formSubmitBtn))) {

            //if we use a keyword search in the filtering mod update the search module as well
            if (typeof customFiltersProp[module_id].mod_type != "undefined" && customFiltersProp[module_id].mod_type == 'filtering') {
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
        if (customFilters.keyword_search_clear_filters_on_new_search && query_value != customFilters.previousQueryValue) {
            //find the base url for the search
            let url = customFiltersProp[module_id].component_base_url;
            if (query_value) {
                //url
                if (url.indexOf('?') == -1) url += '?';
                else url += '&';
                url += 'q=' + query_value;
                return url;
            }
        }
        return false;
    },

    getFilterName: function (name) {
        let filterName = name.match(/([a-z]+_){1,2}/i);
        if (filterName[0]) {
            filterName = filterName[0].replace(/(_{1}$)/, '');
        }
        else {
            filterName = '';
        }
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
        const moduleForm = document.getElementById('cf_form_' + module_id);
        if (moduleForm != null) {
            moduleForm.querySelector('input[name=q]').value = query_value;
        }
    },

    updateSearchModulesWithSearchQuery: function (query_value) {
        const searchMods = document.querySelectorAll('.cf-form-search');
        for (let i = 0; i < searchMods.length; i++) {
            searchMods[i].querySelector('.cf_message').innerHTML = '';
            searchMods[i].querySelector('.cf_message').style.display = "none";
            searchMods[i].querySelector('input[name=q]').value = query_value;
        }
    },

    /**
     * Load/update the module with ajax
     *
     * @param {Event} event
     * @param {Number} module_id
     * @param {String} url
     * @param {Boolean} clearAreaOnload
     */
    loadModule: function (event, module_id, url, clearAreaOnload = true) {
        this.httpRequest(module_id, event, 'module', url, clearAreaOnload);
    },

    /**
     * Load/update the results with ajax
     *
     * @param {Number} module_id
     * @param {String} url
     */
    loadResults: function (module_id, url) {
        this.httpRequest(module_id, null, 'component', url);
    },

    /**
     * Handles the ajax requests
     *
     * @param {Number} module_id
     * @param {Event} event
     * @param {String} type
     * @param {String} url
     * @param {boolean} clearAreaOnLoad
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
                useAjaxOverlay = type == 'module' ? customFiltersProp[module_id].use_ajax_spinner : customFiltersProp[module_id].use_results_ajax_spinner;
            }
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
                urlObject.searchParams.set("async", "1");
                urlObject.searchParams.set("module_id", module_id);
            }
            urlObject.searchParams.set("tmpl", "component");
            request.open("POST", urlObject.toString());

            // The request is on progress
            request.onloadstart = function () {

                // go to the top if we are down the page
                if (type == 'component' && window.scrollY - targetWrapper.offsetTop > 720) {
                    targetWrapper.scrollIntoView(({behavior: 'smooth'}));
                }

                if (useAjaxOverlay == true && ajaxOverlayWrapper != null) {
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
            if (type == 'module') {
                formData.append('view', 'module');
                formData.append('format', 'raw');
                formData.append('async', 1);
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
                if (type == 'component' && window.scrollY - targetWrapper.getBoundingClientRect().y > 720) {
                    targetWrapper.scrollIntoView(({behavior: 'smooth'}));
                }

                if (useAjaxOverlay == true && ajaxOverlayWrapper != null) {
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
            let response = new Object();
            response.text = request.responseText.removeScripts(function (script) {
                response.script = script;
            });

            if(type == 'module') {
                response.text = request.responseText.applyCss();
            }

            // We need to get only the inner part of the results
            if (type == 'component') {

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

            if (type == 'component') {
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

            }else if(type == 'module') {
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
            let index = val.indexOf('='),
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
    formatAjaxOverlay: function (ajaxOverlayWrapperElement, resultsWrapperElement, event, type) {
        let domRect = resultsWrapperElement.getBoundingClientRect();


        if (type == 'module') {
            ajaxOverlayWrapperElement.classList.add("cf_ajax_loader");

            // we pass the event only when the module is loaded
            if(event != null && typeof event.event != "undefined" && typeof event.event.pageY != "undefined") {
                const positionY = event.event.pageY - domRect.y;
                ajaxOverlayWrapperElement.style.backgroundPosition = "center " + positionY + "px";
            }
        }

        ajaxOverlayWrapperElement.style.display = "block";
        ajaxOverlayWrapperElement.style.height = domRect.height + "px";
        ajaxOverlayWrapperElement.style.width = domRect.width + "px";
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
        const breadcrumbModuleIds = customFilters.getBreadcrumbModules();
        const moduleUrl = customFiltersProp[module_id].base_url + 'index.php?option=com_customfilters&view=module';
        for (let i = 0; i < breadcrumbModuleIds.length; i++) {
            customFilters.loadModule(undefined, breadcrumbModuleIds[i], moduleUrl);
        }
        return true;
    },

    setWindowState: function (e) {
        this.counterHist++;
        const t = window.history.state;
        if (window.history.pushState && window.history.replaceState) {
            window.history.pushState({
                page: this.counterHist
            }, "Search Results", e)
        }
    },

    addEventTree: function (module_id) {
        if (customFiltersProp[module_id].parent_link == false) {
            const moduleWrapper = document.getElementById('cf_wrapp_all_' + module_id);
            const parentNodes = [].slice.call(moduleWrapper.querySelectorAll('.cf_parentOpt'));

            parentNodes.forEach((parentNode) => {
                parentNode.addEventListener('click' , function (event) {
                    treeToggle(event, this);
                    return false;
                })

                parentNode.addEventListener('keydown' , function (event) {
                    if(event.key=='enter' || event.key=='right' || event.key=='left') {
                        treeToggle(event, this);
                    }
                    return false;
                })
            });

            function treeToggle(event, element) {
                event.preventDefault();
                let state = "collapsed";
                if (element.classList.contains("cf_unexpand")) {
                    state = "expanded";
                }
                customFilters.setSubTreeState(element, state);
            }
        }
    },

    setSubTreeState: function(rootElement, state) {
        const displayKey = "virtuemart_category_id";
        const numbersInId = rootElement.id.match(/\d+/g);
        if (!numbersInId || numbersInId.length < 1) {
            return false
        }
        const module_id = numbersInId[0];
        if (state == 'expanded') {
            rootElement.classList.remove("cf_unexpand");
            rootElement.classList.add("cf_expand")
        } else {
            rootElement.classList.remove("cf_expand");
            rootElement.classList.add("cf_unexpand")
        }
        let classesArray = rootElement.classList;
        let elementSelector;
        for (let className of classesArray) {
            if (className.indexOf("tree") >= 0) {
                elementSelector = className;
            }
        }
        let elementId = parseInt(rootElement.id.slice(rootElement.id.indexOf("_elid") + 5));
        if (elementSelector) {
            elementSelector += "-" + elementId;
            let liElements = [].slice.call(document.getElementById("cf_list_" + displayKey + "_" + module_id).querySelectorAll(".li-" + elementSelector));
            for (let liElement of liElements) {
                if (state == 'expanded') {
                    liElement.classList.remove("cf_invisible")
                } else {
                    let list = [].slice.call(document.getElementById("cf_list_" + displayKey + "_" + module_id).querySelectorAll("li[class*=" + elementSelector + "]"));
                    for (let ulLi of list) {
                        ulLi.classList.add("cf_invisible");
                        if (ulLi.classList.contains("cf_parentLi")) {
                            ulLi.querySelector("a").classList.remove("cf_expand");
                            ulLi.querySelector("a").classList.add("cf_unexpand");
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
            if (customFiltersProp[module_id].results_trigger == "btn") {
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
        if(element) {
            if (state == "hide") {
                element.setAttribute("aria-expanded", "false");
            } else {
                element.setAttribute("aria-expanded", "true");
            }
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
        const filter_key = filter_name + "_" + module_id;
        const from_el = document.getElementById(filter_key + "_0");
        const to_el = document.getElementById(filter_key + "_1");
        // No inputs return
        if(!from_el || !to_el) {
            return false;
        }
        const submit_button = document.getElementById(filter_key + "_button");
        let from_value = from_el.value.replace(",", ".");
        const isNumericFrom = from_value.match(/^[+-]?\d+(\.\d*)?$/);
        let to_value = to_el.value.replace(",", ".");
        const isNumericTo = to_value.match(/^[+-]?\d+(\.\d*)?$/);
        if (isNumericFrom && to_value.length == 0 || isNumericTo && from_value.length == 0 || isNumericFrom && isNumericTo) {
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
                return [from_value, to_value];
            }
        } else {
            if (submit_button) {
                submit_button.setAttribute("disabled", "disabled");
            }
            if (to_value.length > 0 || from_value.length > 0) {
                this.displayMsg(Joomla.JText._("MOD_CF_FILTERING_INVALID_CHARACTER"), filter_key)
            } else {
                this.displayMsg("", filter_key);
            }
        }
        return false
    },

    validateInput: function (filter_name, module_id) {
        const filter_id=filter_name+ '_' +module_id;
        const filter = document.getElementById(filter_id + "_0");
        if(!filter) {
            return true;
        }
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
        const message_el = document.getElementById(filter_key + "_message");
        if (message) {
            message_el.style.display="block";
            message_el.innerHTML = message
        } else {
            message_el.style.display="none";
        }
    },

    setSliderValues: function (module_id, filter, valid, minOrMax) {
        const flt_key = filter + "_" + module_id;
        const sliderObj = eval(flt_key + "_sliderObj");
        if (valid != false) {
            let min_val = parseInt(valid[0]);
            if (isNaN(min_val)) {
                min_val = parseInt(customFiltersProp[module_id].slider_min_value);
            }
            let max_val = parseInt(valid[1]);
            if (isNaN(max_val)) {
                max_val = parseInt(customFiltersProp[module_id].slider_max_value);
            }
            sliderObj.setMin(min_val);
            sliderObj.setMax(max_val)
        } else {
            if (minOrMax == "min") {
                sliderObj.setMin(parseInt(customFiltersProp[module_id].slider_min_value));
            }
            else if (minOrMax == "max") {
                sliderObj.setMax(parseInt(customFiltersProp[module_id].slider_max_value))
            }
        }
    }
};

/**
 * Class that filter's the list elements (text), through a text input
 */
var CfElementFilter = class {
    constructor(observer, list , options) {
        this.options = {
            module_id: null,
            isexpanable_tree: false,
            filter_key: '',
            cache: true,
            caseSensitive: false,
            ignoreKeys: [13, 27, 32, 37, 38, 39, 40],
            matchAnywhere: true,
            optionClass: ".cf_option",
            trigger: "keyup"
        };
        this.setOptions(options);
        this.observeElement = document.getElementById(observer);
        this.elements = [].slice.call(document.querySelectorAll(list));
        this.matches = this.elements;
        if(this.observeElement) {
            this.listen();
        }
    }

    setOptions(options) {
        for (const [key, value] of Object.entries(options)) {
            this.options[key] = value;
        }
    }

    listen () {
        this.observeElement.addEventListener(this.options.trigger, function (e) {
            if (this.observeElement.value.length) {
                if (!this.options.ignoreKeys.includes(e.code)) {
                    this.start();
                    this.findMatches(this.options.cache ? this.matches : this.elements);
                }
            } else {
                this.elements.forEach((element) => {
                    element.classList.remove('cf_hide');
                })
                this.findMatches(this.elements, true);
                this.clearHtmlFromText(this.elements);
            }
        }.bind(this))
    }

    start (){
        this.elements.forEach((element) => {
            element.classList.add('cf_hide');
        });
    }

    show (element) {
        element.classList.remove('cf_hide');
    }

    hide (element){
        element.classList.add('cf_hide');
    }

    matchText (element){
        const user_input = this.observeElement.value;
        const caseSensitive = this.options.caseSensitive ? "" : "i";
        const regex = new RegExp(user_input, caseSensitive);
        const textElement = element.querySelector(this.options.optionClass);//the text part of the element
        const text = textElement.textContent;
        //convert all to lower case to achieve the matching and get the start char
        const text_lc = text.toLowerCase();
        const user_input_lc = user_input.toLowerCase();
        const start_char = text_lc.indexOf(user_input_lc);
        //get the part from the list element-not from the input. Because of the letter case the user uses in the input
        const part = text.substr(start_char, user_input.length);
        //wrap the part
        const matchedText = text.replace(regex, '<span class="cf_match">' + part + '</span>');
        textElement.innerHTML = matchedText;
    }

    findMatches (elements, defaultMatching) {
        const user_input = this.observeElement.value;
        const user_input2 = this.options.matchAnywhere ? user_input : "^" + user_input;
        const caseSensitive = this.options.caseSensitive ? "" : "i";
        const regex = new RegExp(user_input2, caseSensitive);

        elements.forEach((element) => {
            const isMatch = defaultMatching == undefined ? regex.test(element.textContent) : defaultMatching;
            const hiddenEl = element.classList.contains("cf_invisible"); //hidden categories
            const isClear = element.classList.contains("cf_li_clear");

            if (isMatch && (isClear== false || defaultMatching == true)) {
                if (hiddenEl) {
                    element.setAttribute('style', 'display:block !important');
                }
                this.matchText(element);
                this.show(element);
            } else {
                if (hiddenEl) {
                    element.removeAttribute('style');
                }
                this.hide(element);
            }
            return true;
        });
    }

    /**
     * Clear all the html tags from the text/labels of the values
     * @param Array elements
     */
    clearHtmlFromText(elements) {
        elements.forEach((element) => {
            const textElement = element.querySelector(this.options.optionClass);//the text part of the element
            const text = textElement.textContent;//strip html code
            textElement.innerHTML = text;
            const hiddenEl = element.classList.contains("cf_invisible"); //hidden categories
            if(hiddenEl) {
                element.removeAttribute('style');
            }
        });
    }
}

var CfTooltip = class {
    constructor(element, tipId) {
        this.attachElement = document.querySelector(element);
        if(Array.isArray(this.attachElement)) {
            this.attachElement = this.attachElement[0];
        }
        this.id = tipId;
        this.init();
    }
    init () {
        this.tip = document.querySelector('#'+this.id);
        this.positionX();
        return true;
    }
    getPosition () {
        let el = this.attachElement;
        return {
            top: el.offsetTop,
            left: el.offsetLeft
        }
    }
    positionX (x) {
        if(!x) {
            let position = this.getPosition();
            x = position.left;
        }
        this.tip.style.left = parseInt(x) - ((parseInt(this.tip.style.width)  *16) / 2) + 'px'
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

    setCharLength(charLength) {
        if(!charLength || parseInt(charLength) < 2) {
            charLength = 2;
        }
        this.tip.style.width = charLength + 'rem';
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