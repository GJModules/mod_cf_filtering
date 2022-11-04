<?php
/**
 * @package customfilters
 * @subpackage mod_cf_filtering
 * @copyright Copyright (C) 2012-2021 breakdesigns.net . All rights reserved.
 * @license GNU General Public License version 2 or later; see LICENSE.txt
 */

use Joomla\CMS\Uri\Uri;

require_once JPATH_ROOT . DIRECTORY_SEPARATOR . 'components' . DIRECTORY_SEPARATOR . 'com_customfilters' . DIRECTORY_SEPARATOR . 'include' . DIRECTORY_SEPARATOR . 'tools.php';

class UrlHandler
{
    /**
     *
     * @var stdClass
     */
    protected $module;

    /**
     *
     * @var array
     */
    protected $selected_flt;

    /**
     *
     * @var array
     */
    protected $selected_flt_modif;

    /**
     *
     * @var array
     */
    protected $selected_fl_per_flt;

    /**
     *
     * @var Joomla\Registry\Registry
     */
    protected $moduleParams;

    /**
     *
     * @var Joomla\Registry\Registry
     */
    protected $menuParams;

    /**
     *
     * @var bool|array
     */
    protected $hiddenCategory;

    /**
     *
     * @var int
     */
    protected $parentCategoryId;

    /**
     *
     * @param stdClass $module
     * @param array $selected_filters
     * @since 1.0.0
     */
    public function __construct($module, $selected_filters = [])
    {
        $this->module = $module;
        $this->selected_flt = $selected_filters['selected_flt'];
        $this->selected_flt_modif = $selected_filters['selected_flt_modif'];
        $this->selected_fl_per_flt = $selected_filters['selected_fl_per_flt'];
        $this->moduleParams = \cftools::getModuleparams($module);
        $this->menuParams = \cftools::getMenuparams();
    }

    /**
     * Creates the href/URI for each filter's option
     *
     * @param CfFilter $filter
     * @param null|string $var_value
     * @param string $type
     * @return Uri
     * @since 1.0.0
     */
    public function getURL( CfFilter $filter, $var_value = null, $type = 'option')
    {
        $var_name = $filter->getVarName();
        $display_type = implode(',',$filter->getDisplay());
        $options = $filter->getOptions();




        $on_category_reset_others = false;
        $selected_filters = $this->selected_flt_modif;
        $results_trigger=$this->moduleParams->get('results_trigger','sel');

        if ($var_name == 'virtuemart_category_id') {
            // Очищать выбор других фильтров или поисковых запросов при смене категории
            $on_category_reset_others = $this->moduleParams->get('category_flt_onchange_reset', 'filters');
            if ($on_category_reset_others) {
                if (! empty($selected_filters['virtuemart_category_id'])) {
                    $categ_array = $selected_filters['virtuemart_category_id'];
                }
                else {
                    $categ_array = [];
                }
            }
        }
        else {
            // Set category to the rest of the filters when no category is selected, in case of only sub-categories display
            if ($this->moduleParams->get('category_flt_only_subcats', false) && $this->getHiddenCategory()) {
                $selected_filters['virtuemart_category_id'] = $this->getHiddenCategory();
            }
        }
        


        /**
         * @var string $dependency_direction Зависимость направления
         */
        $dependency_direction   = $this->moduleParams->get('dependency_direction', 't-b')  ;   
        // В случае зависимости сверху-снизу выберите, что этот фильтр должен использовать
        // In case of dependency top-bottom get the selected that this filter should use
        if ( $dependency_direction == 't-b')
        {
            if (isset($this->selected_fl_per_flt[$var_name]))
            {
                $q_array = $this->selected_fl_per_flt[$var_name];
            } else
            {
                $q_array = [];
            }
        }
        // При выборе категории очистить другие
        // On category selection clear others
        elseif ($on_category_reset_others)
        {
            $q_array['virtuemart_category_id'] = $categ_array;
            if ($on_category_reset_others == 'filters')
            {
                !empty($this->selected_flt['q']) ? $q_array['q'] = $this->selected_flt['q'] : '';
            }
        }
        else
        {
            $q_array = $selected_filters;
        }

        // In case of category tree, the parent options are always links, no matter what is the display type of the filter
        if (! empty($options[$var_value]->isparent)) {
            $display_type = CfFilter::DISPLAY_LINK;
        }

        // Do not include also the parents in the urls of the child
        if (! empty($options[$var_value]->cat_tree)) {
            $parent_cat = explode('-', $options[$var_value]->cat_tree);
            foreach ($parent_cat as $pcat) {
                if (isset($q_array[$var_name])) {
                    $index = array_search($pcat, $q_array[$var_name]);
                    if ($index !== false) {
                        unset($q_array[$var_name][$index]);
                    }
                }
            }
        }

        /*
         * In case of select , radio or links (single select) or is clear remove previous selected criteria from the same filter
         * only 1 option from that filter should be selected
         */
        if (($display_type != CfFilter::DISPLAY_CHECKBOX && $display_type != CfFilter::DISPLAY_COLOR_BUTTON_MULTI && $display_type != CfFilter::DISPLAY_BUTTON_MULTI) || $type == 'clear') {
            $q_array=$this->getClearQuery($q_array, $filter, $type);
        }

        /*
         * In case an option is already selected
         * The destination link of that option should omit it's value in case of checkboxes or multi-button
         * to create the uncheck effect
         */
        if (($display_type == CfFilter::DISPLAY_CHECKBOX || $display_type == CfFilter::DISPLAY_COLOR_BUTTON_MULTI || $display_type == CfFilter::DISPLAY_BUTTON_MULTI)
            && (isset($q_array[$var_name]) && in_array($var_value, $q_array[$var_name])))
        {
            if (is_array($q_array[$var_name]))
            {
                $key = array_search($var_value, $q_array[$var_name]);
                unset($q_array[$var_name][$key]);
                $q_array[$var_name] = array_values($q_array[$var_name]); // reorder to fill null indexes
                if (count($q_array[$var_name]) == 0)
                {
                    unset($q_array[$var_name]); // if no any value unset it
                }
            }
        } /* If not exist add it */
        else
        {
            if ($var_value)
            {
                if (isset($q_array[$var_name]) && is_array($q_array[$var_name]))
                {

                    // remove the null option which used only for sef reasons
                    if (isset($q_array[$var_name][0]))
                    {
                        if ($q_array[$var_name][0] == '0' || $q_array[$var_name][0] == ' ')
                        {
                            $q_array[$var_name][0] = $var_value;
                        }
                    }

                    $q_array[$var_name][] = $var_value;
                } else
                {
                    $q_array[$var_name] = [$var_value];
                }
            }
        }

        /*
         * If the custom filters won't be displayed in the page in case a vm_cat and/or a vm_manuf is not selected
         * remove the custom filters from the query too
         */
        if ($var_name == 'virtuemart_category_id' || $var_name == 'virtuemart_manufacturer_id')
        {/**/
            $cust_flt_disp_if = $this->moduleParams->get('custom_flt_disp_after');

            if (($cust_flt_disp_if == 'vm_cat' && $var_name == 'virtuemart_category_id') || ($cust_flt_disp_if == 'vm_manuf' && $var_name == 'virtuemart_manufacturer_id'))
            {
                // if no category or manuf in the query
                // remove all the custom filters from the query as the custom filters won't displayed
                if (!isset($q_array[$var_name]) || count($q_array[$var_name]) == 0)
                {
                    $this->unsetCustomFilters($q_array);
                }
            } elseif ($cust_flt_disp_if == 'keyword_or_vm_cat_or_vm_manuf' && ($var_name == 'q' || $var_name == 'virtuemart_category_id' || $var_name == 'virtuemart_manufacturer_id'))
            {
                if (!isset($q_array['q']) && !isset($q_array['virtuemart_category_id']) && !isset($q_array['virtuemart_manufacturer_id']))
                {
                    $this->unsetCustomFilters($q_array);
                }
            } elseif ($cust_flt_disp_if == 'keyword_or_vm_cat_and_vm_manuf' && ($var_name == 'q' || $var_name == 'virtuemart_category_id' || $var_name == 'virtuemart_manufacturer_id')
                && (!isset($q_array['q']) && (!isset($q_array['virtuemart_category_id']) || !isset($q_array['virtuemart_manufacturer_id']))))
            {
                $this->unsetCustomFilters($q_array);
            }
        }

        // unset dependent custom filters, if a selection is made in a parent filter
        $this->unsetCustomFiltersByDependency($q_array, $var_name);

        $itemId = $this->menuParams->get('cf_itemid', '');
        if ($itemId) {
            $q_array['Itemid'] = $itemId;
        }
        $q_array['option'] = 'com_customfilters';
        $q_array['view'] = 'products';

        // If trigger is on select load results
        // else load the module
        if ($results_trigger == 'btn') {
            unset($q_array['Itemid']);
            $q_array['module_id'] = $this->module->id;
        }

        $uri = Uri::getInstance('index.php');
        $uri->setQuery($q_array);



        return $uri;
    }

    /**
     * Used in case a category is not displayed (e.g.
     * only child are displayed)
     *
     * @return bool|int
     */
    protected function getHiddenCategory()
    {
        if (! isset($this->hiddenCategory)) {
            $this->hiddenCategory = false;
            if (isset($this->selected_flt['virtuemart_category_id']) &&
                count($this->selected_flt['virtuemart_category_id']) == 1 &&
                empty($this->selected_flt_modif['virtuemart_category_id'])) {
                $this->hiddenCategory = $this->selected_flt['virtuemart_category_id'];
            }
        }
        return $this->hiddenCategory;
    }

    /**
     *
     * @param int $category_id
     * @return int
     */
    protected function getParentCategoryId($category_id)
    {
        if (! $this->parentCategoryId) {
            $db = JFactory::getDbo();
            $query = $db->getQuery(true);
            $query->select('category_parent_id')
                ->from('#__virtuemart_category_categories')
                ->where('category_child_id=' . (int) $category_id);
            $db->setQuery($query);
            $this->parentCategoryId = $db->loadResult();
        }
        return $this->parentCategoryId;
    }

    /**
     * Returns a url query that contains only 1 value from the selected filter
     *
     * @param array $q_array
     * @param CfFilter $filter
     * @param string $type
     * @return array
     */
    protected function getClearQuery(array $q_array, CfFilter $filter, $type='clear')
    {
        // clear all the selections in all filters. e.g. search
        if ($type == 'clear' && @$filter->getClearType() == 'all') {
            $q_array=[];
        }

        // clear only the selections in that filter
        else {
            unset($q_array[$filter->getVarName()]);
        }
        return $q_array;
    }

    /**
     * Unset the query params of the dependent filters,
     * if a selection is made in a parent filter.
     *
     * @param array $query
     * @param string $varName
     * @return bool
     * @since 2.9.10
     */
    protected function unsetCustomFiltersByDependency(&$query, $varName)
    {


        if (strpos($varName, 'custom_f_') === false || empty($query)) {
            return false;
        }
        preg_match('/[0-9]+/', $varName, $mathces);
        $customId = $mathces[0];




        $dependentCustomFilterCustomIds = \cftools::getDependentCustomFilters($customId);
        foreach ($dependentCustomFilterCustomIds as $filterCustomId) {
            if (isset($query['custom_f_' . $filterCustomId])) {
                unset($query['custom_f_' . $filterCustomId]);
            }
        }
        return true;
    }

    /**
     * Unset any custom filter found from the assoc array
     *
     * @param Array    An array tha conains the vars of the query
     * @since    1.0
     * @author    Sakis Terz
     */
    protected function unsetCustomFilters(&$query)
    {
        $published_cf = cftools::getCustomFilters();
        if (isset($published_cf)) {
            foreach ($published_cf as $cf) {
                $cf_var_name = 'custom_f_' . $cf->custom_id;
                if (isset($query[$cf_var_name])) {
                    unset($query[$cf_var_name]);
                }
            }
        }
    }

    /**
     * creates the reset uri
     *
     * @author Sakis Terz
     * @since 1.5.0
     * @return Uri
     */
    public function getResetUri()
    {
        $resetfields = $this->moduleParams->get('reset_all_reset_flt', [
            'virtuemart_manufacturer_id',
            'price',
            'custom_f'
        ], 'array');
        $itemId = $this->menuParams->get('cf_itemid', '');
        $q_array = [];
        $q_array['option'] = 'com_customfilters';
        $q_array['view'] = 'products';
        if (! empty($itemId)) {
            $q_array['Itemid'] = $itemId;
        }

        foreach ($this->selected_flt as $key => $selected) {
            $new_key = strpos($key, 'custom_f_') !== false ? 'custom_f' : $key;
            if (! in_array($new_key, $resetfields)) {
                $q_array[$key] = $selected;
            }
        }

        $uri = Uri::getInstance('index.php');
        $uri->setQuery($q_array);



        return $uri;
    }
}
