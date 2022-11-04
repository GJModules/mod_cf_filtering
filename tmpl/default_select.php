<?php
/**
 * @package     customfilters
 * @subpackage  mod_cf_filtering
 * @copyright   Copyright (C) 2012-2020 breakdesigns.net . All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

/**
 * @var CfFilter $filter
 * @var UrlHandler $urlHandler
 * @var string $results_trigger
 * @var string $results_loading_mode
 */



//no options, no game
if (count($filter->getOptions()) == 0) {
    return false;
}
if (empty($key)) {
    $key = '';
}



?>

<select name="<?php echo $key, '[]' ?>" class="cf_flt" aria-label="<?php echo $filter->getHeader()?>"
    <?php echo ($results_trigger != 'btn' && $results_loading_mode != 'ajax') ? 'onchange="window.top.location.href=this.options[this.selectedIndex].getAttribute(\'data-url\')"' : '' ?>>
    <?php
    foreach ($filter->getOptions() as $option) {

        $label = $option->label;
        $option_url = \JRoute::_($urlHandler->getURL($filter, $option->id, $option->type));

        if (isset($option->counter) && $option->active) {
            $label .= '&nbsp;(' . $option->counter . ')';
        }
        ?>

        <option data-url="<?= $option->option_sef_url->sef_url ?>" <?php echo !$option->active ? 'disabled' : '' ?>
                value="<?php echo $option->id ?>" <?php echo $option->selected ? 'selected' : '' ?>>
            <?php echo $label ?>
        </option>

        <?php
    }




    ?>
</select>
