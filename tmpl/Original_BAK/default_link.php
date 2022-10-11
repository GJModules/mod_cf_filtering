<?php
/**
 * @package     customfilters
 * @subpackage  mod_cf_filtering
 * @copyright   Copyright (C) 2012-2021 breakdesigns.net . All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC')or die;

use Joomla\CMS\Helper\ModuleHelper;

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
            require ModuleHelper::getLayoutPath('mod_cf_filtering', 'default_category_tree');
        }

        if($option->selected){
            $class_name=' cf_sel_opt';
        } ?>
        <li class="cf_filters_list_li <?php echo $li_class?>" id="cf_option_li_<?php echo $element_id?>">
            <?php

            if($option->type =='clear') {
                //load the clear link from another layout
                require ModuleHelper::getLayoutPath('mod_cf_filtering', 'default_option_clear');
                continue;
            }?>

            <?php

                //inactive option
                if(!$option->active) {?>
                    <span class="cf_option cf_disabled_opt <?php echo $opt_class?>"><?php echo $option->label?></span>
                    <?php
                }

                //active option
                else{
                    require ModuleHelper::getLayoutPath('mod_cf_filtering', 'default_option_link');

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
