<?php
/**
 * @package     customfilters
 * @subpackage  mod_cf_filtering
 * @copyright   Copyright (C) 2012-2020 breakdesigns.net . All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC')or die;

//no options, no game
if(count($filter->getOptions())==0) {
    return false;
}
if(empty($key)) {
    $key = '';
}
?>

<ul class="cf_filters_list" id="cf_list_<?php echo $key,'_',$module->id?>">

    <?php
    foreach ($filter->getOptions() as $option) {

        //keep these vars. They are used by css and scripts
        $opt_class = '';
        $li_class = '';
        $class_name = '';
        $display_key = $key.'_'.$module->id;
        $element_id = $display_key . '_elid' . $option->id;
        $option_url = \JRoute::_($urlHandler->getURL($filter, $option->id, $option->type));

        //create classes for the category tree
        if ($key == 'virtuemart_category_id' && $params->get('categories_disp_order','names') == 'tree' && (int)$option->id > 0 && isset($option->cat_tree)) {
            require JModuleHelper::getLayoutPath('mod_cf_filtering', 'default_category_tree');
        }

        if($option->selected){
            $class_name=' cf_sel_opt';
        } ?>
        <li class="cf_filters_list_li <?php echo $li_class?>" id="cf_option_li_<?php echo $element_id?>">
            <?php

            if($option->type =='clear') {
                //load the clear link from another layout
                require JModuleHelper::getLayoutPath('mod_cf_filtering', 'default_option_clear');
                continue;
            }?>

            <?php
            //parents are always links and active
            if(!empty($option->isparent)) {
                require JModuleHelper::getLayoutPath('mod_cf_filtering', 'default_option_link');
                continue;
            }?>

            <input <?php echo ($results_trigger!='btn' && $results_loading_mode!='ajax')?'onclick="window.top.location.href=\''.$option_url.'\';"':''?>
                    type="radio" name="<?php echo $key,'[]'?>" <?php echo !$option->active?'disabled':''?>
                    tabindex="-1"
                    class="cf_flt" id="<?php echo $element_id?>" value="<?php echo $option->id?>" <?php echo $option->selected?'checked':''?>/>

            <label class="<?php echo $option->selected?'cf_sel_opt':'';?>" for="<?php echo $element_id?>">
                <?php
                //inactive option
                if(!$option->active) {?>
                    <span class="cf_option cf_disabled_opt <?php echo $opt_class?>"><?php echo $option->label?></span>
                    <?php
                }

                //active option
                else{
                    require JModuleHelper::getLayoutPath('mod_cf_filtering', 'default_option_link');
                }?>
            </label>
        </li>
        <?php
    }?>
</ul>
