import moment from 'moment';

// TODO: figure out how to fix the moment warning

var CharthouseTime = function (time) {

    this.isRelative = false;
    this.momentObj = null;

    // Syntax conversion of durations between graphite and moment objects
    var graphite2MomentDurations = {
        min: 'm',
        mon: 'M'
    };

    this.absTimeFormat = 'LL h:mma z';

    // Null input, use 'now'
    if (!time) {
        this.isRelative = true;
        this.momentObj = moment.duration();
    }

    if (typeof time == 'number') {
        // assume that it is a unix seconds timestamp
        this.momentObj = moment.unix(time).utc();
    }

    if (typeof time == 'string') {
        if (time.toLowerCase() === 'now') {
            // Now
            this.isRelative = true;
            this.momentObj = moment.duration();   // 0 duration
        } else if (time.charAt(0) == '-' || time.charAt(0) == '+') {
            // Relative time
            this.isRelative = true;
            var durStr = time.match(/[\-0-9]+|[a-zA-Z]+/g);
            this.momentObj = moment.duration(parseInt(durStr[0]), graphite2MomentDurations[durStr[1]] || durStr[1]);
        } else if (!isNaN(time)) {
            // Unix time
            this.momentObj = moment.unix(time).utc();
        } else {
            // Time string
            this.momentObj = moment(time).utc();
        }
        return;
    }

    if (typeof time == 'object') {
        if (time.hasOwnProperty('_milliseconds')) {
            // Moment duration object
            this.isRelative = true;
            this.momentObj = time;
        } else if (time._isAMomentObject) {
            // Absolute moment object
            this.momentObj = time;
        }
    }
};

CharthouseTime.prototype.getMomentObj = function () {
    return this.momentObj;
};

CharthouseTime.prototype.isRelative = function () {
    return this.isRelative;
};

CharthouseTime.setAbsTimeFormat = function (format) {
    this.absTimeFormat = format;
};

CharthouseTime.prototype.toAbs = function () {
    return (this.isRelative)
        ? moment().utc().add(this.momentObj)
        : this.momentObj;
};

CharthouseTime.prototype.toParamStr = function () {
    if (this.isRelative) {
        if (Math.abs(this.momentObj.asSeconds()) < 1) return 'now';
        if (isInt(this.momentObj.asYears())) return this.momentObj.asYears() + 'y';
        if (isInt(this.momentObj.asMonths())) return this.momentObj.asMonths() + 'mon';
        if (isInt(this.momentObj.asWeeks())) return this.momentObj.asWeeks() + 'w';
        if (isInt(this.momentObj.asDays())) return this.momentObj.asDays() + 'd';
        if (isInt(this.momentObj.asHours())) return this.momentObj.asHours() + 'h';
        if (isInt(this.momentObj.asMinutes())) return this.momentObj.asMinutes() + 'min';
        return this.momentObj.asSeconds() + 's';
    } else {
        return this.momentObj.unix();
    }

    function isInt(num) {
        return num === parseInt(num);
    }
};

CharthouseTime.prototype.toHuman = function () {
    return this.isRelative
        ? (this.momentObj.asSeconds() == 0 ? 'Now' : this.momentObj.humanize(true))
        : this.momentObj.format(this.absTimeFormat);
};

export default CharthouseTime;
