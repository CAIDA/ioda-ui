import _ from 'underscore';

Array.prototype.alphanumSort = function (caseInsensitive, accessorProp) {

    function chunkify(t) {
        var tz = [], x = 0, y = -1, n = 0, i, j;

        while (i = (j = t.charAt(x++)).charCodeAt(0)) {
            // Don't consider dots to be part of (fractional) numbers as it messes with IP addresses
            var m = (/*i == 46 || */(i >= 48 && i <= 57));
            if (m !== n) {
                tz[++y] = "";
                n = m;
            }
            tz[y] += j;
        }
        return tz;
    }

    if (accessorProp)
        this.forEach(function (t) {
            t[accessorProp] = chunkify(t[accessorProp]);
        });
    else
        for (var z = 0, t; z < this.length; z++) {
            this[z] = chunkify(this[z]);
        }

    this.sort(function (a, b) {
        if (accessorProp) {
            a = a[accessorProp];
            b = b[accessorProp];
        }
        for (var x = 0, aa, bb; (aa = a[x]) && (bb = b[x]); x++) {
            if (caseInsensitive) {
                aa = aa.toLowerCase();
                bb = bb.toLowerCase();
            }
            if (aa !== bb) {
                var c = Number(aa), d = Number(bb);
                if (c == aa && d == bb) {
                    return c - d;
                } else return (aa > bb) ? 1 : -1;
            }
        }
        return a.length - b.length;
    });

    if (accessorProp)
        this.forEach(function (t) {
            t[accessorProp] = t[accessorProp].join('');
        });
    else
        for (var z = 0, t; z < this.length; z++) {
            this[z] = this[z].join('');
        }

    return this;
};

Array.prototype.crossSample = function (newSize) {

    var arr = this;

    if (!newSize) return [];

    var step = arr.length / newSize;
    return _.range(newSize).map(function (d) {

        // Avg value (incl. weighted average of edges when current is not multiple of newSize (fractional step))
        // Only averages real numbers, ignores null values

        var first = d * step;
        var last = Math.min((d + 1) * step, arr.length);
        var firstWeight = 1 - (first % 1);
        var lastWeight = last % 1;

        first = Math.floor(first);
        last = Math.floor(last);

        if (first == last) return arr[first]; // Just one index, no need to average

        var sum = 0;
        var cnt = 0;

        add(arr[first], firstWeight);
        add(arr[last], lastWeight);
        for (var i = first + 1; i < last; i++) {
            add(arr[i], 1);
        }

        return cnt == 0 ? null : sum / cnt;

        function add(val, weight) {
            if (!weight || val == null) return;
            sum += (val * weight);
            cnt += weight;
        }
    });
};

Array.prototype.cntNonNulls = function () {
    return _(this).reduce(function (prev, cur) {
        return cur == null ? prev : prev + 1;
    }, 0);
};

// Counts number of value variations (delta!=0) in the array
Array.prototype.cntVariations = function () {
    if (!this.length) return 0;

    return _(this).reduce(function (prev, cur) {
            if (cur != prev.val) {
                prev.cnt++;
            }
            prev.val = cur;
            return prev;
        },
        {
            cnt: 0,
            val: null
        }).cnt;
};

// Counts number of delta variations (vertices) in the array
Array.prototype.cntVertices = function () {
    if (!this.length) return 0;
    return _(this).reduce(function (prev, cur) {
            var delta = (prev.val != null && cur != null) ? cur - prev.val : null;
            if (delta != prev.delta || (delta == null && prev.val != null)) { // Delta changed or prev was an isolated point surrounded by nulls
                prev.cnt++;
            }
            prev.val = cur;
            prev.delta = delta;
            return prev;
        },
        {
            cnt: 0,
            delta: null,
            val: null
        }).cnt;
};

String.prototype.alphanumCompare = function (other, caseInsensitive) {

    function chunkify(t) {
        var tz = [], x = 0, y = -1, n = 0, i, j;

        while (i = (j = t.charAt(x++)).charCodeAt(0)) {
            // Don't consider dots to be part of (fractional) numbers as it messes with IP addresses
            var m = (/*i == 46 || */(i >= 48 && i <= 57));
            if (m !== n) {
                tz[++y] = "";
                n = m;
            }
            tz[y] += j;
        }
        return tz;
    }

    var a = this;
    var b = other;

    var aa = chunkify(caseInsensitive ? a.toLowerCase() : a);
    var bb = chunkify(caseInsensitive ? b.toLowerCase() : b);

    for (let x = 0; aa[x] && bb[x]; x++) {
        if (aa[x] !== bb[x]) {
            var c = Number(aa[x]), d = Number(bb[x]);
            if (c == aa[x] && d == bb[x]) {
                return c - d;
            } else return (aa[x] > bb[x]) ? 1 : -1;
        }
    }
    return aa.length - bb.length;
};

String.prototype.abbrFit = function (nChars, divPos, sep) {
    // The relative position where to place the '...'
    divPos = divPos || 0.7;
    sep = sep || '...';
    if (nChars <= sep.length) sep = ''; // If string is smaller than separator

    nChars -= sep.length;

    if (this.length <= nChars) return "" + this;

    return this.substring(0, nChars * divPos)
        + sep
        + this.substring(this.length - nChars * (1 - divPos), this.length);
};
