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

<ul class="cf_filters_list cf_colorbtn_list" id="cf_list_<?php echo $key,'_',$module->id?>">

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
        }
        if(empty($option->id)) {
            $li_class .= 'cf_li_clear';
        }?>

        <li class="cf_filters_list_li <?php echo $li_class?>" id="cf_option_li_<?php echo $element_id?>">
            <?php

            if($option->type =='clear') {
                //load the clear link from another layout
                require JModuleHelper::getLayoutPath('mod_cf_filtering', 'default_option_clear');
                continue;
            }?>

            <?php

            $colors_multi=explode('|', $option->label);
            $nr_colors_multi=count($colors_multi);
            $color_btn_width=100/$nr_colors_multi;
            //check to see if the value is color
            if($nr_colors_multi==1){
                $color=cftools::checkNFormatColor($option->label);
                //if no color go to the next option
                if(empty($color)) {
                    continue;
                }
            }
            //inactive option
            if(!$option->active) {?>
                <div class="cf_option cf_disabled_opt cf_color_btn<?php echo $opt_class?>" role="button" aria-disabled="true">
                    <?php
                    // add the color name for accessibility reasons
                    if(isset($option->description) && $option->description!='') {?>
                        <span class="cf_hidden_text"><?php echo $option->description?></span>
                    <?php }?>

                    <?php foreach($colors_multi as $clr){
                        $color=cftools::checkNFormatColor($clr);?>
                        <span class="cf_color_inner" style="background-color:<?php echo $color?>; width:<?php echo $color_btn_width?>%" aria-hidden="true"></span>
                    <?php }?>
                </div>
                <?php

                // Add Tooltip
                if(isset($option->description) && $option->description!='') {
                    $tooltipContent = $option->description;
                    $display_key_element = $element_id;
                    require JModuleHelper::getLayoutPath('mod_cf_filtering', 'default_tooltip');
                }
            }

            //active option
            else{?>
                <div class="cf_link" role="button" aria-pressed="<?php echo $option->selected ? 'true' : 'false';?>">
                    <a href="<?php echo $option_url; ?>" id="<?php echo $element_id, '_a' ?>" class="cf_option cf_color_btn <?php echo $option->selected ? 'cf_sel_opt' : '', ' ', $opt_class ?>"
                       data-module-id="<?php echo $module->id ?>" <?php echo $params->get('indexfltrs_by_search_engines', 0) == false ? 'rel="nofollow"' : '' ?>>
                        <?php
                        // add the color name for accessibility reasons
                        if(isset($option->description) && $option->description!='') {?>
                            <span class="cf_hidden_text"><?php echo $option->description?></span>
                        <?php }?>

                        <?php foreach($colors_multi as $clr){
                                $color=cftools::checkNFormatColor($clr);?>
                                <span class="cf_color_inner" style="background-color:<?php echo $color?>; width:<?php echo $color_btn_width?>%" aria-hidden="true"></span>
                        <?php }?>
                    </a>

                    <?php
                    // Add Tooltip
                    if(isset($option->description) && $option->description!='') {
                        $tooltipContent = $option->description;
                        $display_key_element = $element_id;
                        require JModuleHelper::getLayoutPath('mod_cf_filtering', 'default_tooltip');
                    }
                    ?>
                </div>

                <?php
                //we need to keep the selected in the form
                if($option->selected){?>
                    <input type="hidden" name="<?php echo $key?>[]" value="<?php echo $option->id?>" />
                    <?php
                }
            }?>
        </li>
        <?php
    }?>
</ul>
