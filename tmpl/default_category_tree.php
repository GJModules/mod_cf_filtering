<?php
/**
 * @package     customfilters
 * @subpackage  mod_cf_filtering
 * @copyright   Copyright (C) 2012-2021 breakdesigns.net . All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC')or die;

$li_class = 'cf_catOption';
$li_class .= " cfLiLevel".$option->level;

//tree mode collapsed
if ($params->get('category_flt_tree_mode','0') == false) {
    /**
     * @var CfFilter $filter
     */
    $current_tree_string = implode(',', $filter->getActiveTree());
    //ending string
    if($current_tree_string) {
        $current_tree_string.='-';
    }
    if (!empty($option->isparent)) {
        $opt_class .= ' cf_parentOpt';
        $li_class .= ' cf_parentLi';
        $option_tree_branch = $option->cat_tree . '-' . $option->id . '-';

        if (strpos($current_tree_string, $option_tree_branch) !== false) {
            $opt_state = ' cf_expand';
        }
        else {
            $opt_state = ' cf_unexpand';
        }
        $opt_class .= $opt_state;
    } else {
        $opt_class .= ' cf_childOpt';
    }
    $opt_class .= ' tree_' . $option->cat_tree;
    $li_class .= ' li-tree_' . $option->cat_tree;

    if ((empty($current_tree_string) && $option->level > 0) || (!empty($current_tree_string) && strpos($current_tree_string, $option->cat_tree . '-') === false)) {
        $li_class .= " cf_invisible";
    }

    //trigger the script for the tree effects
    $scriptKey = md5("customFilters.addEventTree({$module->id});");

    //set that only once
    if(!isset($scriptProcesses[$scriptKey]) && ($jinput->get('view', '') != 'module' || $jinput->get('option', '') != 'com_customfilters')) {
        $scriptProcesses[$scriptKey] = "customFilters.addEventTree({$module->id});";
    }
}
