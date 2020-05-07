<?php

namespace Ps2alerts\Api\Utility;

use Ps2alerts\Api\Exception\InvalidArgumentException;

class DateValidationUtility
{
    /**
     * Validates a date to ensure it's to a certain format
     *
     * @param $date
     * @param string $format
     *
     * @return bool
     */
    public function validate($date, $format = 'Y-m-d H:i:s')
    {
        $d = \DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) == $date;
    }

    /**
     * Validates a date range to ensure it's allowed within a certain limit.
     * @param $dates
     * @param int $maxDiff
     *
     * @throws InvalidArgumentException
     */
    public function validateTimeDifference($dates, int $maxDiff)
    {
        if (! is_array($dates)) {
            $dates = str_replace('\'', '', $dates); // Remove escaping quotes
            $dates = explode(',', $dates);
        }

        if (! is_array) {
            throw new InvalidArgumentException('Somehow validateTimeDifference couldn\'t make a date array.');
        }

        $date1 = \DateTime::createFromFormat('Y-m-d', $dates[0]);
        $date2 = \DateTime::createFromFormat('Y-m-d', $dates[1]);

        $diff = $date2->diff($date1, true);

        if ($diff->days > $maxDiff) {
            throw new InvalidArgumentException("Number of days attempting to access is more than maximum allowed ($maxDiff)");
        }
    }
}