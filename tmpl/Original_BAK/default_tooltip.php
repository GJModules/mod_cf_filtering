<?php
/**
 * @package     customfilters
 * @subpackage  mod_cf_filtering
 * @copyright   Copyright © 2010-2021 Breakdesigns.net. All rights reserved.
 * @license     GNU General Public License 2 or later, see COPYING.txt for license details.
 */

defined('_JEXEC')or die;

if(!isset($tooltipContent)) {
    $tooltipContent = 0;
}

if(!isset($display_key_element)) {
    $display_key_element = '';
}

?>

<div class="cftooltip" role="tooltip" tabindex="-1" id="<?php echo $display_key_element?>_tooltip">
    <span class="tip-content">
        <?php echo $tooltipContent?>
    </span>
</div>
