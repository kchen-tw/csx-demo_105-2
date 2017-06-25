var plotdb;
if (!(typeof plotdb != 'undefined' && plotdb !== null)) {
    plotdb = {};
}
plotdb.String = {
    name: 'String',
    'default': "",
    level: 2,
    basetype: [],
    test: function() {
        return true;
    },
    parse: function(it) {
        return it || "";
    }
};
plotdb.Order = {
    name: 'Order',
    'default': function(k, v, i) {
        return i;
    },
    level: 4,
    basetype: [plotdb.String],
    test: function(v) {
        return !!plotdb.OrderTypes.map(function(type) {
            return type.test(v);
        }).filter(function(it) {
            return it;
        })[0];
    },
    parse: function(it) {
        return it;
    },
    order: {
        Ascending: function(a, b) {
            if (b > a) {
                return -1;
            } else if (b < a) {
                return 1;
            } else {
                return 0;
            }
        },
        Descending: function(a, b) {
            if (b > a) {
                return 1;
            } else if (b < a) {
                return -1;
            } else {
                return 0;
            }
        }
    },
    sort: function(data, fieldname, isAscending) {
        var field, types, i$, to$, i, j$, to1$, j, type, sorter;
        isAscending == null && (isAscending = true);
        field = fieldname ? data.map(function(it) {
            return it[fieldname];
        }) : data;
        types = plotdb.OrderTypes.map(function(it) {
            return it;
        });
        for (i$ = 0, to$ = field.length; i$ < to$; ++i$) {
            i = i$;
            for (j$ = 0, to1$ = types.length; j$ < to1$; ++j$) {
                j = j$;
                if (!types[j].test(field[i])) {
                    types[j] = null;
                }
            }
            types = types.filter(fn$);
        }
        type = types[0];
        sorter = ((type || {}).order || this.order)[isAscending ? 'Ascending' : 'Descending'];
        if (fieldname) {
            if (type) {
                for (i$ = 0, to$ = data.length; i$ < to$; ++i$) {
                    i = i$;
                    data[i][fieldname] = type.parse(data[i][fieldname]);
                }
            }
            return data.sort(function(a, b) {
                return sorter(a[fieldname], b[fieldname]);
            });
        } else {
            if (type) {
                for (i$ = 0, to$ = data.length; i$ < to$; ++i$) {
                    i = i$;
                    data[i] = type.parse(data[i]);
                }
            }
            return data.sort(sorter);
        }

        function fn$(it) {
            return it;
        }
    }
};
plotdb.Boolean = {
    name: 'Boolean',
    'default': true,
    level: 8,
    basetype: [plotdb.Order],
    test: function(it) {
        return !!/^(true|false|yes|no|[yntf01])$/.exec(it);
    },
    parse: function(it) {
        if (it && typeof it === 'string') {
            if (/^(yes|true|[yt])$/.exec(it.trim())) {
                return true;
            }
            if (/\d+/.exec(it.trim()) && it.trim() !== "0") {
                return true;
            }
            return false;
        }
        return !!it;
    },
    order: {
        Descending: function(a, b) {
            return b - a;
        },
        Ascending: function(a, b) {
            return a - b;
        },
        index: function(it) {
            if (it) {
                return 1;
            } else {
                return 0;
            }
        }
    }
};
plotdb.Bit = {
    name: 'Bit',
    'default': 0,
    level: 10,
    basetype: [plotdb.Boolean],
    test: function(it) {
        return !!/^[01]$/.exec(it);
    },
    parse: function(it) {
        return !it || it === "0" ? 0 : 1;
    },
    order: {
        Descending: function(a, b) {
            return b - a;
        },
        Ascending: function(a, b) {
            return a - b;
        },
        index: function(it) {
            return it;
        }
    }
};
plotdb.Numstring = {
    name: 'Numstring',
    'default': "",
    level: 6,
    basetype: [plotdb.Order],
    test: function(it) {
        return /\d+/.exec(it + "");
    },
    parse: function(it) {
        var numbers, num, i$, to$, j;
        numbers = [];
        num = it.split ?
            it.split(/\.?[^0-9.]+/g) : [it];
        for (i$ = 0, to$ = num.length; i$ < to$; ++i$) {
            j = i$;
            if (num[j]) {
                numbers.push(parseFloat(num[j]));
            }
        }
        return {
            raw: it,
            numbers: numbers,
            len: numbers.length,
            toString: function() {
                return this.raw;
            }
        };
    },
    order: {
        Ascending: function(a, b) {
            var na, nb, i$, to$, i, v;
            if (!a) {
                return !b ?
                    0 :
                    -1;
            }
            na = a.numbers;
            nb = b.numbers;
            for (i$ = 0, to$ = a.len; i$ < to$; ++i$) {
                i = i$;
                v = na[i] - nb[i];
                if (v) {
                    return v;
                }
            }
            return a.len - b.len;
        },
        Descending: function(a, b) {
            return plotdb.Numstring.order.Ascending(b, a);
        },
        index: function(it) {
            return it.numbers[0];
        }
    }
};
plotdb.Number = {
    name: 'Number',
    'default': 0,
    level: 8,
    basetype: [plotdb.Numstring],
    test: function(it) {
        return !isNaN(+((it || '') + "").replace(/,/g, '').replace(/%$/, ''));
    },
    parse: function(it) {
        if (typeof it === 'string') {
            it = parseFloat(it.replace(/,/g, ''));
            if (/%$/.exec(it)) {
                it = (+it.replace(/%$/, '')) / 100;
            }
        }
        return +it;
    },
    order: {
        Ascending: function(a, b) {
            return a - b;
        },
        Descending: function(a, b) {
            return b - a;
        },
        index: function(it) {
            return it;
        }
    }
};
plotdb.Date = {
    name: 'Date',
    'default': '1970/1/1',
    level: 8,
    basetype: [plotdb.Numstring],
    test: function(it) {
        return !/^\d*$/.exec(it) && this.parse(it) ? true : false;
    },
    parse: function(it) {
        var d, ret;
        d = new Date(it);
        if (!(d instanceof Date) || isNaN(d.getTime())) {
            ret = /^(\d{1,2})[/-](\d{4})$/.exec(it);
            if (!ret) {
                return null;
            }
            d = new Date(ret[2], parseInt(ret[1]) - 1);
        }
        return {
            raw: it,
            toString: function() {
                return this.raw;
            },
            parsed: d
        };
    },
    order: {
        Ascending: function(a, b) {
            return a.parsed.getTime() - b.parsed.getTime();
        },
        Descending: function(a, b) {
            return b.parsed.getTime() - a.parsed.getTime();
        },
        index: function(it) {
            return it.parsed.getTime();
        }
    }
};
plotdb.Weekday = {
    name: 'Weekday',
    'default': 'Mon',
    level: 8,
    basetype: [plotdb.Order],
    values: {
        abbr: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        en: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        zh: ['週一', '週二', '週三', '週四', '週五', '週六', '週日']
    },
    test: function(it) {
        var value, k, ref$, v, idx;
        value = typeof it === 'string' ? it.toLowerCase() : it;
        ref$ = this.values;
        for (k in ref$) {
            v = ref$[k];
            idx = v.indexOf(value);
            if (idx >= 0) {
                return true;
            }
        }
        return false;
    },
    parse: function(it) {
        return it;
    },
    order: {
        index: function(it) {
            var value, k, ref$, v, idx;
            value = it.toLowerCase();
            ref$ = plotdb.Weekday.values
            for (k in ref$) {
                v = ref$[k];
                idx = v.indexOf(value);
                if (idx >= 0) {
                    return idx;
                }
            }
            return -1;
        },
        Ascending: function(a, b) {
            a = plotdb.Weekday.order.index(a);
            b = plotdb.Weekday.order.index(b);
            return a - b;
        },
        Descending: function(a, b) {
            a = plotdb.Weekday.order.index(a);
            b = plotdb.Weekday.order.index(b);
            return b - a;
        }
    }
};
plotdb.Month = {
    name: 'Month',
    'default': 'Jan',
    level: 8,
    basetype: [plotdb.Order],
    values: {
        abbr: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
        en: ['january', 'feburary', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
        zh: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    },
    test: function(it) {
        var value, k, ref$, v, idx;
        value = typeof it === 'string' ? it.toLowerCase() : it;
        ref$ = this.values;
        for (k in ref$) {
            v = ref$[k];
            idx = v.indexOf(value);
            if (idx >= 0) {
                return true;
            }
        }
        return false;
    },
    parse: function(it) {
        return it;
    },
    order: {
        index: function(it) {
            var value, k, ref$, v, idx;
            value = it.toLowerCase();
            ref$ = plotdb.Month.values;
            for (k in ref$) {
                v = ref$[k];
                idx = v.indexOf(value);
                if (idx >= 0) {
                    return idx;
                }
            }
            return -1;
        },
        Ascending: function(a, b) {
            a = plotdb.Month.order.index(a);
            b = plotdb.Month.order.index(b);
            return a - b;
        },
        Descending: function(a, b) {
            a = plotdb.Month.order.index(a);
            b = plotdb.Month.order.index(b);
            return b - a;
        }
    }
};
plotdb.Range = {
    name: 'Range',
    'default': [0, 1],
    test: function(it) {
        return !!plotdb.Range.parse(it);
    },
    parse: function(it) {
        var e;
        if (typeof it === 'string') {
            try {
                it = JSON.parse(it);
            } catch (e$) {
                e = e$;
                return false;
            }
        }
        if (Array.isArray(it) && it.length === 2) {
            it[0] = parseFloat(it[0]);
            it[1] = parseFloat(it[1]);
            if (isNaN(it[0]) || isNaN(it[1])) {
                return null;
            }
            return it;
        }
        return null;
    }
};
plotdb.Choice = function(v) {
    return {
        'default': "",
        name: 'Choice',
        level: 20,
        test: function(it) {
            return v && v.length && in$(it, v);
        },
        values: v
    };
};
plotdb.Color = {
    name: 'Color',
    level: 10,
    test: function(it) {
        return !/(rgba?|hsla?)\([0-9.,]+\)|#[0-9a-f]{3,6}|[a-z0-9]+/.exec(it.trim());
    },
    'default': '#dc4521',
    Gray: '#cccccc',
    Positive: '#3f7ab5',
    Negative: '#d93510',
    Neutral: '#cccccc',
    Empty: '#ffffff',
    subtype: {
        negative: "negative",
        positive: "positive",
        neutral: "neutral"
    }
};
plotdb.Palette = {
    name: 'Palette',
    level: 30,
    re: /^((rgb|hsl)\((\s*[0-9.]+\s*,){2}\s*[0-9.]+\s*\)|(rgb|hsl)a\((\s*[0-9.]+\s*,){3}\s*[0-9.]+\s*\)|\#[0-9a-f]{3}|\#[0-9a-f]{6}|[a-zA-Z][a-zA-Z0-9]*)$/,
    test: function(it) {
        var e, this$ = this;
        if (!it) {
            return true;
        }
        if (typeof it === typeof "") {
            if (it.charAt(0) !== '[') {
                it = it.split(',');
            } else {
                try {
                    it = JSON.parse(it);
                } catch (e$) {
                    e = e$;
                    return false;
                }
            }
        } else if (Array.isArray(it)) {
            return !it.filter(function(it) {
                return !this$.re.exec(it.trim());
            }).length ? true : false;
        } else if (typeof it === 'object') {
            if (!(it.colors != null)) {
                return true;
            }
            if (it.colors.filter(function(it) {
                    return !it.hex;
                }).length) {
                return true;
            }
        }
        return false;
    },
    parse: function(it) {
        var e;
        if (!it) {
            return it;
        }
        if (Array.isArray(it)) {
            return it;
        }
        if (typeof it === typeof "") {
            try {
                return JSON.parse(it);
            } catch (e$) {
                e = e$;
                return it.split(',').map(function(it) {
                    return {
                        hex: it.trim()
                    };
                });
            }
        }
        return it;
    },
    'default': {
        colors: ['#1d3263', '#226c87', '#f8d672', '#e48e11', '#e03215', '#ab2321'].map(function(it) {
            return {
                hex: it
            };
        })
    },
    plotdb: {
        colors: ['#ed1d78', '#c59b6d', '#8cc63f', '#28aae2'].map(function(it) {
            return {
                hex: it
            };
        })
    },
    qualitative: {
        colors: ['#c05ae0', '#cf2d0c', '#e9ab1e', '#86ffb5', '#64dfff', '#003f7d'].map(function(it) {
            return {
                hex: it
            };
        })
    },
    binary: {
        colors: ['#ff8356', '#0076a1'].map(function(it) {
            return {
                hex: it
            };
        })
    },
    sequential: {
        colors: ['#950431', '#be043e', '#ec326d', '#fc82a9', '#febed2', '#fee6ee'].map(function(it) {
            return {
                hex: it
            };
        })
    },
    diverging: {
        colors: ['#74001a', '#cd2149', '#f23971', '#ff84ab', '#ffc3d7', '#f2f2dd', '#b8d9ed', '#81b1d0', '#3d8bb7', '#0071a8', '#003558'].map(function(it) {
            return {
                hex: it
            };
        })
    },
    subtype: {
        qualitative: "qualitative",
        binary: "binary",
        sequential: "sequential",
        diverging: "diverging"
    },
    scale: {
        ordinal: function(pal, domain, scale) {
            var c, range;
            c = pal.colors;
            range = c.filter(function(it) {
                return it.keyword;
            }).map(function(it) {
                return it.hex;
            }).concat(c.filter(function(it) {
                return !it.keyword;
            }).map(function(it) {
                return it.hex;
            }));
            if (!domain) {
                if (scale) {
                    domain = scale.domain();
                } else {
                    domain = c.map(function(it) {
                        return it.keyword;
                    }).filter(function(it) {
                        return it;
                    });
                }
            }
            if (!scale) {
                scale = d3.scale.ordinal();
            }
            return scale.domain(domain).range(range);
        },
        linear: function(pal, domain, scale) {
            var c, range;
            c = pal.colors;
            range = c.filter(function(it) {
                return it.keyword;
            }).map(function(it) {
                return it.hex;
            }).concat(c.filter(function(it) {
                return !it.keyword;
            }).map(function(it) {
                return it.hex;
            }));
            if (!domain) {
                if (scale) {
                    domain = scale.domain();
                } else {
                    domain = c.map(function(it) {
                        return it.keyword;
                    }).filter(function(it) {
                        return it != null;
                    });
                }
            }
            if (!scale) {
                scale = d3.scale.linear();
            }
            if (range.length === 1) {
                range.push(range[0]);
            }
            if (domain.length === 2 && range.length > 2) {
                domain = d3.range(range.length).map(function(it) {
                    return (domain[1] - domain[0]) * it / (range.length - 1 || 1) + domain[0];
                });
            }
            return scale.domain(domain).range(range);
        }
    }
};
plotdb.OrderTypes = [plotdb.Number, plotdb.Date, plotdb.Numstring, plotdb.Month, plotdb.Weekday, plotdb.Boolean, plotdb.Bit];
plotdb.Types = {
    list: ['Number', 'Numstring', 'Weekday', 'Month', 'Date', 'Boolean', 'Bit', 'Order'],
    resolveArray: function(vals) {
        var matchedTypes, i$, to$, j, type, matched, j$, to1$, k;
        matchedTypes = [
            [0, 'String']
        ];
        for (i$ = 0, to$ = this.list.length; i$ < to$; ++i$) {
            j = i$;
            type = plotdb[this.list[j]];
            matched = true;
            for (j$ = 0, to1$ = vals.length; j$ < to1$; ++j$) {
                k = j$;
                if (!type.test(vals[k])) {
                    matched = false;
                    break;
                }
            }
            if (matched) {
                matchedTypes.push([plotdb[this.list[j]].level, this.list[j]]);
            }
        }
        matchedTypes.sort(function(a, b) {
            return b[0] - a[0];
        });
        type = (matchedTypes[0] || [0, 'String'])[1];
        return type;
    },
    resolveValue: function(val) {
        var matchedTypes, i$, to$, j, type;
        matchedTypes = [
            [0, 'String']
        ];
        for (i$ = 0, to$ = this.list.length; i$ < to$; ++i$) {
            j = i$;
            type = plotdb[this.list[j]];
            if (type.test(val)) {
                matchedTypes.push([plotdb[this.list[j]].level, this.list[j]]);
            }
        }
        matchedTypes.sort(function(a, b) {
            return b[0] - a[0];
        });
        type = (matchedTypes[0] || [0, 'String'])[1];
        return type;
    },
    resolve: function(obj) {
        var headers, rows, fields, types, i$, to$, i, matchedTypes, j$, to1$, j, type, matched, k$, to2$, k;
        if (Array.isArray(obj)) {
            return this.resolveArray(obj);
        }
        if (typeof obj !== 'object') {
            return this.resolveValue(obj);
        }
        headers = obj.headers, rows = obj.rows, fields = obj.fields;
        types = [];
        for (i$ = 0, to$ = headers.length; i$ < to$; ++i$) {
            i = i$;
            matchedTypes = [];
            for (j$ = 0, to1$ = this.list.length; j$ < to1$; ++j$) {
                j = j$;
                type = plotdb[this.list[j]];
                matched = true;
                for (k$ = 0, to2$ = rows.length; k$ < to2$; ++k$) {
                    k = k$;
                    if (!type.test(rows[k][i])) {
                        matched = false;
                        break;
                    }
                }
                if (matched) {
                    matchedTypes.push([plotdb[this.list[j]].level, this.list[j]]);
                }
            }
            matchedTypes.sort(fn$);
            type = (matchedTypes[0] || [0, 'String'])[1];
            types.push(type);
        }
        return types;

        function fn$(a, b) {
            return b[0] - a[0];
        }
    }
};

function in$(x, xs) {
    var i = -1,
        l = xs.length >>> 0;
    while (++i < l)
        if (x === xs[i]) return true;
    return false;
} // Generated by LiveScript 1.3.1
plotdb.chart = {
    corelib: {},
    create: function(config) {
        return import$(import$({}, this.base), config);
    },
    base: {
        dimension: {
            value: {
                type: [],
                require: false
            }
        },
        config: {
            padding: {}
        },
        init: function() {},
        bind: function() {},
        resize: function() {},
        render: function() {}
    },
    dataFromDimension: function(dimension) {
        var data, len, k, v, i$, i, ret, that, type, defval, value, parse, j$, to$, j;
        data = [];
        len = Math.max.apply(null, (function() {
            var ref$, results$ = [];
            ref$ = dimension;
            for (k in ref$) {
                v = ref$[k];
                results$.push(v);
            }
            return results$;
        }()).reduce(function(a, b) {
            return a.concat(b.fields || []);
        }, []).filter(function(it) {
            return it.data;
        }).map(function(it) {
            return it.data.length;
        }).concat([0]));
        for (i$ = 0; i$ < len; ++i$) {
            i = i$;
            ret = {};
            for (k in dimension) {
                v = dimension[k];
                if (v.multiple) {
                    ret[k] = (v.fields || (v.fields = [])).length ? (v.fields || (v.fields = [])).map(fn$) : null;
                    v.fieldName = (v.fields || (v.fields = [])).map(fn1$);
                } else {
                    ret[k] = (that = (v.fields || (v.fields = []))[0]) ? (that.data || (that.data = []))[i] : null;
                    v.fieldName = (that = (v.fields || (v.fields = []))[0]) ? that.name : null;
                }
                if (ret[k] === null) {
                    type = v.type[0] || plotdb.String;
                    defval = plotdb[type.name]['default'];
                    value = typeof defval === 'function' ?
                        defval(k, v, i) :
                        type['default'];
                    ret[k] = v.multiple ? [value] : value;
                }
                if (v.type && v.type[0] && plotdb[v.type[0].name].parse) {
                    parse = plotdb[v.type[0].name].parse;
                    if (Array.isArray(ret[k])) {
                        for (j$ = 0, to$ = ret[k].length; j$ < to$; ++j$) {
                            j = j$;
                            ret[k][j] = parse(ret[k][j]);
                        }
                    } else {
                        ret[k] = parse(ret[k]);
                    }
                }
            }
            data.push(ret);
        }
        return data;

        function fn$(it) {
            return (it.data || (it.data = []))[i];
        }

        function fn1$(it) {
            return it.name;
        }
    },
    dataFromHash: function(dimension, source) {
        var k, v;
        if (!dimension || !source) {
            return [];
        }
        if (Array.isArray(source)) {
            return source;
        }
        if (typeof source === 'function') {
            source = source();
        }
        for (k in dimension) {
            v = dimension[k];
            v.fields = source[k] || [];
        }
        return plotdb.chart.dataFromDimension(dimension);
    },
    getSampleData: function(chart, dimension) {
        dimension == null && (dimension = null);
        return plotdb.chart.dataFromHash(dimension || chart.dimension, chart.sample);
    },
    updateData: function(chart) {
        return chart.data = plotdb.chart.dataFromDimension(chart.dimension);
    },
    updateDimension: function(chart) {
        var k, ref$, v, results$ = [];
        ref$ = chart.dimension;
        for (k in ref$) {
            v = ref$[k];
            if (Array.isArray(v.type)) {
                results$.push(v.type = v.type.map(fn$));
            }
        }
        return results$;

        function fn$(it) {
            if (typeof it === 'object') {
                return it;
            } else {
                return plotdb[it] || {};
            }
        }
    },
    updateAssets: function(chart, assets) {
        var ret, i$, len$, file, raw, array, j$, to$, idx;
        assets == null && (assets = []);
        ret = {};
        for (i$ = 0, len$ = assets.length; i$ < len$; ++i$) {
            file = assets[i$];
            raw = atob(file.content);
            array = new Uint8Array(raw.length);
            for (j$ = 0, to$ = raw.length; j$ < to$; ++j$) {
                idx = j$;
                array[idx] = raw.charCodeAt(idx);
            }
            file.blob = new Blob([array], {
                type: file.type
            });
            file.url = URL.createObjectURL(file.blob);
            file.datauri = ["data:", file.type, ";charset=utf-8;base64,", file.content].join("");
            ret[file.name] = file;
        }
        return chart.assets = ret;
    },
    updateConfig: function(chart, config) {
        var k, ref$, v, type, results$ = [];
        ref$ = chart.config;
        for (k in ref$) {
            v = ref$[k];
            type = (chart.config[k].type || []).map(fn$);
            if (!(config[k] != null)) {
                config[k] = v['default'];
            } else if (!(config[k].value != null)) {
                config[k] = (v || config[k])['default'];
            } else {
                config[k] = config[k].value;
            }
            if (type[0] && plotdb[type[0]].parse) {
                results$.push(config[k] = plotdb[type[0]].parse(config[k]));
            }
        }
        return results$;

        function fn$(it) {
            return it.name;
        }
    }
};

function import$(obj, src) {
    var own = {}.hasOwnProperty;
    for (var key in src)
        if (own.call(src, key)) obj[key] = src[key];
    return obj;
} // Generated by LiveScript 1.3.1
plotdb.theme = {
    create: function(config) {
        return import$(import$({}, this.base), config);
    },
    base: {
        palette: {
            'default': [],
            diverging: [],
            sequential: [],
            binary: [],
            qualitative: [],
            binaryDiverge: [],
            sequentialQualitative: [],
            sequentialSequential: [],
            divergingDiverging: []
        },
        config: {
            padding: {
                type: [plotdb.Number],
                'default': 10
            }
        }
    }
};

function import$(obj, src) {
    var own = {}.hasOwnProperty;
    for (var key in src)
        if (own.call(src, key)) obj[key] = src[key];
    return obj;
} // Generated by LiveScript 1.3.1
plotdb.data = {
    sample: {
        country: ["Afghanistan", "Albania", "Antarctica", "Algeria", "American Samoa", "Andorra", "Angola", "Antigua and Barbuda", "Azerbaijan", "Argentina", "Australia", "Austria", "Bahamas", "Bahrain", "Bangladesh", "Armenia", "Barbados", "Belgium", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Bouvet Island", "Brazil", "Belize", "British Indian Ocean Territory", "Solomon Islands", "British Virgin Islands", "Brunei", "Bulgaria", "Myanmar", "Burundi", "Belarus", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Sri Lanka", "Chad", "Chile", "China", "Taiwan", "Christmas Island", "Cocos Keeling Islands", "Colombia", "Comoros", "Mayotte", "Congo, Rep.", "Congo, Dem. Rep.", "Cook Islands", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Benin", "Denmark", "Dominica", "Dominican Republic", "Ecuador", "El Salvador", "Equatorial Guinea", "Ethiopia", "Eritrea", "Estonia", "Faroe Islands", "Falkland Islands", "SGSSI", "Fiji", "Finland", "Åland Islands", "France", "French Guiana", "French Polynesia", "French Southern Territories", "Djibouti", "Gabon", "Georgia", "Gambia", "Palestine", "Germany", "Ghana", "Gibraltar", "Kiribati", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guinea", "Guyana", "Haiti", "HIMI", "Holy See", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Cote d'Ivoire", "Jamaica", "Japan", "Kazakhstan", "Jordan", "Kenya", "North Korea", "South Korea", "Kuwait", "Kyrgyz Republic", "Lao", "Lebanon", "Lesotho", "Latvia", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Martinique", "Mauritania", "Mauritius", "Mexico", "Monaco", "Mongolia", "Moldova", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Oman", "Namibia", "Nauru", "Nepal", "Netherlands", "Curaçao", "Aruba", "Sint Maarten", "Bonaire, Sint Eustatius and Saba", "New Caledonia", "Vanuatu", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "Norway", "Northern Mariana Islands", "United States Minor Outlying Islands", "Micronesia, Fed. Sts.", "Marshall Islands", "Palau", "Pakistan", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Guinea-Bissau", "Timor-Leste", "Puerto Rico", "Qatar", "Réunion", "Romania", "Russia", "Rwanda", "Saint Barthélemy", "Saint Helena, Ascension and Tristan da Cunha", "Saint Kitts and Nevis", "Anguilla", "St. Lucia", "Saint Martin", "Saint Pierre and Miquelon", "St. Vincent and the Grenadines", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovak Republic", "Vietnam", "Slovenia", "Somalia", "South Africa", "Zimbabwe", "Spain", "South Sudan", "Sudan", "Western Sahara", "Suriname", "Svalbard and Jan Mayen", "Swaziland", "Sweden", "Switzerland", "Syria", "Tajikistan", "Thailand", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "United Arab Emirates", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "Macedonia, FYR", "Egypt", "United Kingdom", "Guernsey", "Jersey", "Isle of Man", "Tanzania", "United States", "Virgin Islands", "Burkina Faso", "Uruguay", "Uzbekistan", "Venezuela", "Wallis and Futuna", "Samoa", "Yemen", "Zambia"],
        continent: ['Asia', 'Europe', 'America', 'Oceania', 'Australia', 'Africa'],
        category: ['IT', 'RD', 'GM', 'FIN', 'LEGAL', 'HR', 'SALES', 'BD'],
        name: ['James', 'Joe', 'Amelie', 'Yale', 'Doraemon', 'Cindy', 'David', 'Frank', 'Kim', 'Ken', 'Leland', 'Mike', 'Nick', 'Oliver', 'Randy', 'Andy', 'Angelica', 'Zack', 'Alfred', 'Edward', 'Thomas', 'Percy', 'Frankenstein', 'Mary', 'Toby', 'Tim', 'Timonthy', 'Smith', 'Karen', 'Kenny', 'Jim', 'Victor', 'Xavier', 'Jimmy', 'Bob', 'Cynthia', 'Dory', 'Dolce', 'Kirby', 'Gabriel', 'Gabby', 'Watson', 'Wade', 'Wallace', 'Gasper', 'Karmen', 'Ian', 'Larry', 'Rachel', 'Parker', 'Parry', 'Eagle', 'Falcon', 'Hades', 'Helen', 'Sabrinaa', 'Oscar', 'Victoria'],
        fruit: ['Apple', 'Orange', 'Banana', 'Grape', 'Longan', 'Litchi', 'Peach', 'Guava', 'Melon', 'Pineapple', 'Pomelo', 'Durian', 'Berry', 'Pear'],
        weekday: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        generate: function(dimension) {
            var ret, res$, i$, to$, i, node, k, v;
            res$ = [];
            for (i$ = 0, to$ = parseInt(Math.random() * 10 + 10); i$ < to$; ++i$) {
                i = i$;
                node = {};
                for (k in dimension) {
                    v = dimension[k];
                    if (!v.type || !v.type.length) {
                        node[k] = this.name[parseInt(Math.random() * this.name.length)];
                    } else {
                        node[k] = parseInt(Math.random() * 8) + 2;
                    }
                }
                res$.push(node);
            }
            ret = res$;
            return ret;
        }
    }
};
(function() {
    var helper, target, k;
    helper = {
        get: function(idx) {
            return this[idx % this.length];
        },
        order: function(len) {
            var ret, i$, i;
            ret = new Array(len);
            for (i$ = 0; i$ < len; ++i$) {
                i = i$;
                ret[i] = this[i % this.length];
            }
            return ret;
        },
        rand: function() {
            return this[parseInt(Math.random() * this.length)];
        },
        rands: function(len) {
            var ret, i$, i;
            ret = new Array(len);
            for (i$ = 0; i$ < len; ++i$) {
                i = i$;
                ret[i] = this[parseInt(Math.random() * this.length)];
            }
            return ret;
        }
    };
    target = ['name', 'country', 'category', 'fruit', 'weekday', 'month', 'continent'];
    return (function() {
        var results$ = [];
        for (k in helper) {
            results$.push(k);
        }
        return results$;
    }()).map(function(h) {
        return target.map(function(t) {
            return plotdb.data.sample[t][h] = helper[h];
        });
    });
})();
import$(plotdb.data.sample, {
    crimeanWar: {
        "month": {
            "name": "month",
            "data": ["01/04/1854", "01/05/1854", "01/06/1854", "01/07/1854", "01/08/1854", "01/09/1854", "01/10/1854", "01/11/1854", "01/12/1854", "01/01/1855", "01/02/1855", "01/03/1855", "01/04/1855", "01/05/1855", "01/06/1855", "01/07/1855", "01/08/1855", "01/09/1855", "01/10/1855", "01/11/1855", "01/12/1855", "01/01/1856", "01/02/1856", "01/03/1856"]
        },
        "army size": {
            "name": "army size",
            "data": [8571, 23333, 28333, 28722, 30246, 30290, 30643, 29736, 32779, 32393, 30919, 30107, 32252, 35473, 38863, 42647, 44614, 47751, 46852, 37853, 43217, 44212, 43485, 46140]
        },
        "death number by zymotic": {
            "name": "death number by zymotic",
            "data": [1, 12, 11, 359, 828, 788, 503, 844, 1725, 2761, 2120, 1205, 477, 508, 802, 382, 483, 189, 128, 178, 91, 42, 24, 15]
        },
        "death number by wound": {
            "name": "death number by wound",
            "data": [0, 0, 0, 0, 1, 81, 132, 287, 114, 83, 42, 32, 48, 49, 209, 134, 164, 276, 53, 33, 18, 2, 0, 0]
        },
        "death number by other": {
            "name": "death number by other",
            "data": [5, 9, 6, 23, 30, 70, 128, 106, 131, 324, 361, 172, 57, 37, 31, 33, 25, 20, 18, 32, 28, 48, 19, 35]
        },
        "zymotic rate(‰)": {
            "name": "zymotic rate(‰)",
            "data": [1.4, 6.2, 4.7, 150, 328.5, 312.2, 197, 340.6, 631.5, 1022.8, 822.8, 480.3, 177.5, 171.8, 247.6, 107.5, 129.9, 47.5, 32.8, 56.4, 25.3, 11.4, 6.6, 3.9]
        },
        "wound rate(‰)": {
            "name": "wound rate(‰)",
            "data": [0, 0, 0, 0, 0.4, 32.1, 51.7, 115.8, 41.7, 30.7, 16.3, 12.8, 17.9, 16.6, 64.5, 37.7, 44.1, 69.4, 13.6, 10.5, 5, 0.5, 0, 0]
        },
        "other rate(‰)": {
            "name": "other rate(‰)",
            "data": [7, 4.6, 2.5, 9.6, 11.9, 27.7, 50.1, 42.8, 48, 120, 140.1, 68.6, 21.2, 12.5, 9.6, 9.3, 6.7, 5, 4.6, 10.1, 7.8, 13, 5.2, 9.1]
        }
    },
    lifeExpectancy: {
        "1985": {
            "name": "1985",
            "data": ["42.8", "72.2", "67.7", "80", "50", "73.1", "71.9", "70.5", "75.7", "74", "66.2", "67.2", "71.5", "55.8", "73.3", "71.1", "74.6", "71.1", "55", "56", "59.8", "71.5", "67.5", "67.4", "72.9", "71.3", "52", "49.8", "56.3", "58.2", "76.5", "67.2", "49.1", "53.4", "71.8", "66.4", "70.3", "55.4", "52.9", "56.6", "76.3", "57.7", "71.6", "74.3", "76.7", "71.1", "74.7", "60.6", "73.1", "70.5", "70", "61.1", "67.8", "51.9", "50.2", "70.4", "46.3", "64.1", "74.7", "75.7", "60.6", "56.6", "70.2", "74.6", "58.7", "76", "69.1", "62.8", "50.7", "50.5", "65", "53.4", "67.6", "68.9", "77.6", "55.9", "63.4", "63.6", "68.5", "73.7", "74.9", "75.7", "72.6", "77.8", "69.3", "66.4", "63.1", "56.4", "65.9", "69.5", "74.6", "64.7", "54.3", "70.1", "65.3", "60.4", "54.5", "71.9", "71.2", "73.8", "72", "54.5", "50.8", "70.5", "62.7", "46.9", "75.2", "64", "58.9", "67.8", "69.7", "61.8", "66", "60.8", "73.1", "66.1", "47", "56.7", "61.4", "55.2", "76.4", "74.2", "64.9", "45", "55.5", "76.1", "68.4", "61.1", "75.1", "56", "73.1", "67.2", "66", "70.7", "73.1", "75", "69.7", "68.2", "50.3", "69.5", "69.3", "67.5", "62.5", "71.8", "55.8", "72.6", "69.9", "49.5", "73.1", "70.8", "71.8", "60.2", "52.8", "62.8", "76.6", "70.5", "54.9", "68.5", "60", "76.9", "76.9", "68.5", "73", "64.4", "57.9", "70.4", "55.8", "57.5", "68", "68.5", "69.8", "65.2", "62", "52.3", "70", "71.9", "74.7", "74.8", "72.1", "67", "62.3", "72.2", "69.1", "67.4", "57.8", "56.9", "63.5", "51.1"]
        },
        "2000": {
            "name": "2000",
            "data": ["51", "74.2", "73.2", "82.7", "52.6", "73.9", "74.3", "71.4", "79.7", "78.2", "68", "70.3", "73.6", "65.8", "74.3", "68.2", "77.8", "69", "59.2", "63.9", "67.6", "75.2", "51.6", "71.9", "75.5", "71.7", "53.3", "47.5", "60.9", "55", "79.3", "70.1", "46.7", "52.4", "77.2", "71.5", "72.5", "60.2", "52.5", "52.6", "77.7", "52.8", "74.7", "75.9", "79.1", "75", "76.9", "59.6", "73.3", "72.7", "73.2", "68.9", "72.9", "52.4", "49.3", "70.1", "52.5", "64.2", "77.8", "79.1", "58", "60", "72.3", "78.1", "60.2", "78", "70.5", "68.5", "55.6", "51.7", "64.4", "58.6", "68.8", "71.8", "79.9", "61.1", "68.3", "71.2", "69.1", "76.7", "78.8", "79.6", "72.7", "81.1", "73.1", "63.6", "57.4", "59.5", "63.2", "76.3", "77.5", "65.8", "59.5", "70.1", "76.2", "49.8", "55.9", "74.6", "72", "78.2", "73.9", "60.5", "46.3", "73.8", "72.6", "51.1", "79.7", "63.8", "61.8", "71", "75.1", "64.5", "69.3", "61.4", "72", "71.3", "53.6", "61.4", "55", "64.9", "78.1", "78.5", "73.9", "53", "55.8", "78.7", "73.7", "62.6", "76.9", "56.9", "74.1", "74.3", "69", "73.8", "76.7", "77.2", "70.8", "65.4", "50", "72", "69.8", "69.9", "65.3", "76.1", "60", "74.7", "70.9", "52.2", "78.6", "73.3", "75.8", "61.7", "54.3", "57.1", "79.3", "72.4", "64.4", "68.8", "48.7", "79.7", "80", "73.8", "76", "66.3", "54.8", "71.3", "63.6", "59", "69.1", "69.4", "75", "71.5", "63.1", "50", "67.5", "73.8", "77.8", "77.1", "74.6", "67.4", "63", "74.3", "73.5", "72.6", "63.5", "45.7", "50.8", "54.1"]
        },
        "2015": {
            "name": "2015",
            "data": ["57.63", "76", "76.5", "84.1", "61", "75.2", "76.2", "74.4", "81.8", "81", "72.9", "72.3", "79.2", "70.1", "75.8", "70.4", "80.4", "70", "65.5", "70.2", "72.3", "77.9", "66.4", "75.6", "78.7", "74.9", "62.8", "60.4", "68.4", "59.5", "81.7", "74.6", "53.8", "57.7", "79.3", "76.9", "75.8", "64.1", "58.3", "61.9", "80", "60.33", "78", "78.5", "82.6", "78.6", "80.1", "64.63", "74.6", "73.8", "75.2", "71.3", "74.1", "60.63", "62.9", "76.8", "63.6", "66.3", "80.8", "81.9", "60.53", "65.1", "73.3", "81.1", "65.5", "79.8", "71.7", "73.1", "60.8", "53.4", "64.4", "65.3", "72.4", "76.2", "82.8", "66.8", "70.9", "78.5", "72.1", "80.4", "82.4", "82.1", "75.5", "83.5", "78.3", "68.2", "66.63", "62.4", "71.4", "80.7", "80.7", "69", "66.4", "75.7", "78.5", "48.5", "63.9", "76.2", "75.4", "81.1", "77", "64.7", "60.22", "75.1", "79.5", "57.6", "82.1", "65.1", "65.7", "73.9", "74.5", "67", "72.7", "65.3", "75.8", "74.7", "56.4", "67.9", "61", "71.2", "80.6", "80.6", "76.8", "62.2", "61.33", "81.6", "75.7", "66.5", "78.2", "60.6", "73.9", "77.5", "70.2", "77.3", "79.8", "82", "76.8", "73.13", "66.53", "74.5", "72.9", "72.2", "68.8", "78.1", "66.1", "78.1", "73.7", "58.5", "82.1", "76.4", "80.2", "64.1", "58.7", "63.72", "81.7", "76.5", "69.5", "70.5", "51.5", "82", "82.9", "70.26", "79.7", "71", "63.43", "75.1", "72.4", "64.23", "70.5", "71.4", "77.3", "76.5", "67.9", "60.8", "72.1", "76.6", "81.4", "79.1", "77.3", "70.1", "65", "75.8", "75.2", "76.5", "67.6", "58.96", "60.01", "58"]
        },
        "Country": {
            "name": "Country",
            "data": ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Dem. Rep.", "Congo, Rep.", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "North Korea", "South Korea", "Kuwait", "Kyrgyz Republic", "Lao", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Lithuania", "Luxembourg", "Macedonia, FYR", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia, Fed. Sts.", "Moldova", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "St. Lucia", "St. Vincent and the Grenadines", "Samoa", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovak Republic", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "West Bank and Gaza", "Vietnam", "Yemen", "Zambia", "Zimbabwe", "South Sudan"]
        },
        "Continent": {
            "name": "Continent",
            "data": ["Asia", "Europe", "Africa", "Europe", "Africa", "North America", "South America", "Europe", "Oceania", "Europe", "Europe", "North America", "Asia", "Asia", "North America", "Europe", "Europe", "North America", "Africa", "Asia", "South America", "Europe", "Africa", "South America", "Asia", "Europe", "Africa", "Africa", "Asia", "Africa", "North America", "Africa", "Africa", "Africa", "South America", "Asia", "South America", "Africa", "Africa", "Africa", "North America", "Africa", "Europe", "North America", "Europe", "Europe", "Europe", "Africa", "North America", "North America", "South America", "Africa", "North America", "Africa", "Africa", "Europe", "Africa", "Oceania", "Europe", "Europe", "Africa", "Africa", "Europe", "Europe", "Africa", "Europe", "North America", "North America", "Africa", "Africa", "South America", "North America", "North America", "Europe", "Europe", "Asia", "Asia", "Asia", "Asia", "Europe", "Asia", "Europe", "North America", "Asia", "Asia", "Asia", "Africa", "Oceania", "Asia", "Asia", "Asia", "Asia", "Asia", "Europe", "Asia", "Africa", "Africa", "Africa", "Europe", "Europe", "Europe", "Africa", "Africa", "Asia", "Asia", "Africa", "Europe", "Oceania", "Africa", "Africa", "North America", "Oceania", "Europe", "Asia", "Europe", "Africa", "Africa", "Asia", "Africa", "Asia", "Europe", "Oceania", "North America", "Africa", "Africa", "Europe", "Asia", "Asia", "North America", "Oceania", "South America", "South America", "Asia", "Europe", "Europe", "Asia", "Europe", "Asia", "Africa", "North America", "North America", "Oceania", "Africa", "Asia", "Africa", "Europe", "Africa", "Africa", "Asia", "Europe", "Europe", "Oceania", "Africa", "Africa", "Europe", "Asia", "Africa", "South America", "Africa", "Europe", "Europe", "Asia", "Asia", "Asia", "Africa", "Asia", "Asia", "Africa", "Oceania", "North America", "Africa", "Asia", "Asia", "Africa", "Europe", "Asia", "Europe", "North America", "South America", "Asia", "Oceania", "South America", "Asia", "Asia", "Asia", "Africa", "Africa", "Africa"]
        }
    },
    oldFaithful: {
        "eruptions": {
            "name": "eruptions",
            "data": [3.6, 1.8, 3.333, 2.283, 4.533, 2.883, 4.7, 3.6, 1.95, 4.35, 1.833, 3.917, 4.2, 1.75, 4.7, 2.167, 1.75, 4.8, 1.6, 4.25, 1.8, 1.75, 3.45, 3.067, 4.533, 3.6, 1.967, 4.083, 3.85, 4.433, 4.3, 4.467, 3.367, 4.033, 3.833, 2.017, 1.867, 4.833, 1.833, 4.783, 4.35, 1.883, 4.567, 1.75, 4.533, 3.317, 3.833, 2.1, 4.633, 2, 4.8, 4.716, 1.833, 4.833, 1.733, 4.883, 3.717, 1.667, 4.567, 4.317, 2.233, 4.5, 1.75, 4.8, 1.817, 4.4, 4.167, 4.7, 2.067, 4.7, 4.033, 1.967, 4.5, 4, 1.983, 5.067, 2.017, 4.567, 3.883, 3.6, 4.133, 4.333, 4.1, 2.633, 4.067, 4.933, 3.95, 4.517, 2.167, 4, 2.2, 4.333, 1.867, 4.817, 1.833, 4.3, 4.667, 3.75, 1.867, 4.9, 2.483, 4.367, 2.1, 4.5, 4.05, 1.867, 4.7, 1.783, 4.85, 3.683, 4.733, 2.3, 4.9, 4.417, 1.7, 4.633, 2.317, 4.6, 1.817, 4.417, 2.617, 4.067, 4.25, 1.967, 4.6, 3.767, 1.917, 4.5, 2.267, 4.65, 1.867, 4.167, 2.8, 4.333, 1.833, 4.383, 1.883, 4.933, 2.033, 3.733, 4.233, 2.233, 4.533, 4.817, 4.333, 1.983, 4.633, 2.017, 5.1, 1.8, 5.033, 4, 2.4, 4.6, 3.567, 4, 4.5, 4.083, 1.8, 3.967, 2.2, 4.15, 2, 3.833, 3.5, 4.583, 2.367, 5, 1.933, 4.617, 1.917, 2.083, 4.583, 3.333, 4.167, 4.333, 4.5, 2.417, 4, 4.167, 1.883, 4.583, 4.25, 3.767, 2.033, 4.433, 4.083, 1.833, 4.417, 2.183, 4.8, 1.833, 4.8, 4.1, 3.966, 4.233, 3.5, 4.366, 2.25, 4.667, 2.1, 4.35, 4.133, 1.867, 4.6, 1.783, 4.367, 3.85, 1.933, 4.5, 2.383, 4.7, 1.867, 3.833, 3.417, 4.233, 2.4, 4.8, 2, 4.15, 1.867, 4.267, 1.75, 4.483, 4, 4.117, 4.083, 4.267, 3.917, 4.55, 4.083, 2.417, 4.183, 2.217, 4.45, 1.883, 1.85, 4.283, 3.95, 2.333, 4.15, 2.35, 4.933, 2.9, 4.583, 3.833, 2.083, 4.367, 2.133, 4.35, 2.2, 4.45, 3.567, 4.5, 4.15, 3.817, 3.917, 4.45, 2, 4.283, 4.767, 4.533, 1.85, 4.25, 1.983, 2.25, 4.75, 4.117, 2.15, 4.417, 1.817, 4.467]
        },
        "waiting": {
            "name": "waiting",
            "data": [79, 54, 74, 62, 85, 55, 88, 85, 51, 85, 54, 84, 78, 47, 83, 52, 62, 84, 52, 79, 51, 47, 78, 69, 74, 83, 55, 76, 78, 79, 73, 77, 66, 80, 74, 52, 48, 80, 59, 90, 80, 58, 84, 58, 73, 83, 64, 53, 82, 59, 75, 90, 54, 80, 54, 83, 71, 64, 77, 81, 59, 84, 48, 82, 60, 92, 78, 78, 65, 73, 82, 56, 79, 71, 62, 76, 60, 78, 76, 83, 75, 82, 70, 65, 73, 88, 76, 80, 48, 86, 60, 90, 50, 78, 63, 72, 84, 75, 51, 82, 62, 88, 49, 83, 81, 47, 84, 52, 86, 81, 75, 59, 89, 79, 59, 81, 50, 85, 59, 87, 53, 69, 77, 56, 88, 81, 45, 82, 55, 90, 45, 83, 56, 89, 46, 82, 51, 86, 53, 79, 81, 60, 82, 77, 76, 59, 80, 49, 96, 53, 77, 77, 65, 81, 71, 70, 81, 93, 53, 89, 45, 86, 58, 78, 66, 76, 63, 88, 52, 93, 49, 57, 77, 68, 81, 81, 73, 50, 85, 74, 55, 77, 83, 83, 51, 78, 84, 46, 83, 55, 81, 57, 76, 84, 77, 81, 87, 77, 51, 78, 60, 82, 91, 53, 78, 46, 77, 84, 49, 83, 71, 80, 49, 75, 64, 76, 53, 94, 55, 76, 50, 82, 54, 75, 78, 79, 78, 78, 70, 79, 70, 54, 86, 50, 90, 54, 54, 77, 79, 64, 75, 47, 86, 63, 85, 82, 57, 82, 67, 74, 54, 83, 73, 73, 88, 80, 71, 83, 56, 79, 78, 84, 58, 83, 43, 60, 75, 81, 46, 90, 46, 74]
        }
    }
});

function import$(obj, src) {
    var own = {}.hasOwnProperty;
    for (var key in src)
        if (own.call(src, key)) obj[key] = src[key];
    return obj;
}
plotdb.config = { language: { name: "Language", type: [plotdb.Choice(["Chinese(Traditional)", "English"])], "default": "English", category: "Global Settings", rebindOnChange: !0 }, fontFamily: { name: "Font", type: [plotdb.String], "default": "Arial", category: "Global Settings" }, fontSize: { name: "Font Size", type: [plotdb.Number], "default": 13, category: "Global Settings" }, duration: { name: "Animation Duration", type: [plotdb.Number], "default": 1.5, desc: "Animation Duration, in second (e.g., 1.5)", category: "Global Settings" }, background: { name: "Background", type: [plotdb.Color], "default": "#ffffff", category: "Global Settings" }, textFill: { name: "Text Color", type: [plotdb.Color], "default": "#000000", category: "Global Settings" }, margin: { name: "Margin", type: [plotdb.Number], "default": 10, category: "Global Settings" }, aspectRatio: { name: "Aspect Ratio", type: [plotdb.Boolean], "default": !0, category: "Layout" }, popupShow: { name: "show Popup", desc: "show Popup when user hovers over elements", type: [plotdb.Boolean], "default": !0, category: "Popup", rebindOnChange: !0 }, boxRoundness: { name: "Block Roundness", type: [plotdb.Number], "default": 0, category: "Global Settings" }, palette: { name: "Palette", type: [plotdb.Palette], subtype: plotdb.Palette.subtype.Qualitative, "default": { colors: [{ hex: "#f4502a" }, { hex: "#f1c227" }, { hex: "#008a6d" }, { hex: "#00acdb" }, { hex: "#0064a8" }] }, category: "Global Settings" }, colorNegative: { name: "Negative", type: [plotdb.Color], desc: "Color for negative values", "default": plotdb.Color.Negative, subtype: plotdb.Color.subtype.Negative, category: "Global Settings" }, colorPositive: { name: "Positive", type: [plotdb.Color], desc: "Color for positive values", "default": plotdb.Color.Positive, subtype: plotdb.Color.subtype.Positive, category: "Global Settings" }, colorNeutral: { name: "Neutral", type: [plotdb.Color], desc: "Color for neutral values", "default": plotdb.Color.Neutral, subtype: plotdb.Color.subtype.Neutral, category: "Global Settings" }, colorEmpty: { name: "Empty", type: [plotdb.Color], desc: "Color for 'no values'", "default": plotdb.Color.Empty, subtype: plotdb.Color.subtype.Empty, category: "Global Settings" }, colorPast: { name: "Past", type: [plotdb.Color], desc: "Color for values in past", subtype: plotdb.Color.subtype.Fade, category: "Global Settings" }, fill: { name: "Fill", type: [plotdb.Color], "default": "#e03f0e", category: "Global Settings" }, fillOpacity: { name: "Fill Opacity", type: [plotdb.Number], "default": .6, category: "Global Settings" }, stroke: { name: "Stroke", type: [plotdb.Color], desc: "Stroke Color", "default": "#999", category: "Global Settings" }, geoFill: { name: "Fill Color", type: [plotdb.Color], desc: "Default color for filling geographic path", "default": "#eee", category: "Geography" }, geoStroke: { name: "Stroke Color", type: [plotdb.Color], desc: "Default color for outline of geographic path", "default": "#919191", category: "Geography" }, geoStrokeWidth: { name: "Stroke Width", type: [plotdb.Number], desc: "geographic path outline width", "default": "1", category: "Geography" }, hoverFill: { name: "Hovering Fill Color", type: [plotdb.Color], desc: "Fill color when hovering element", "default": "#aaa", category: "Color" }, hoverStroke: { name: "Hovering Stroke Color", type: [plotdb.Color], desc: "Stroke color when hovering element", "default": "#fff", category: "Color" }, connectFill: { name: "Fill Color", type: [plotdb.Color], desc: "Fill color between connection path of data node", "default": "#aaa", category: "Line" }, connectStroke: { name: "Stroke Color", type: [plotdb.Color], desc: "Stroke color between connection path of data node", "default": "#aaa", category: "Line" }, connectStrokeWidth: { name: "Stroke width", type: [plotdb.Number], desc: "Stroke size between connection path of data node", "default": 2, category: "Line" }, connectDashArray: { name: "Dash Array", type: [plotdb.String], desc: "SVG style dash array. '2 4' means 2px line and 4px space.", "default": "2 2", category: "Line" }, gridShow: { name: "Show Grid", type: [plotdb.Boolean], "default": !0, category: "Grid" }, gridBackground: { name: "Background", type: [plotdb.Color], "default": "#fff", category: "Grid" }, gridStroke: { name: "Color", type: [plotdb.Color], "default": "#ccc", category: "Grid" }, gridStrokeWidth: { name: "Stroke Width", type: [plotdb.Number], "default": 1, category: "Grid" }, gridFrameStroke: { name: "Frame Color", type: [plotdb.Color], "default": "#ccc", category: "Grid" }, gridFrameStrokeWidth: { name: "Frame Width", type: [plotdb.Number], "default": 3, category: "Grid" }, gridDashArray: { name: "Dash Style", type: [plotdb.String], "default": "2 4", category: "Grid", desc: "SVG style dash array. '2 4' means 2px line and 4px space." }, padding: { name: "Padding", type: [plotdb.Number], "default": 10, category: "Global Settings" }, bubbleSizeMin: { name: "Min Size", type: [plotdb.Number], "default": 0, category: "Bubble" }, bubbleSizeMax: { name: "Max Size", type: [plotdb.Number], "default": 20, category: "Bubble" }, bubbleFill: { name: "Fill Color", type: [plotdb.Color], "default": "#ffaaaa", category: "Bubble" }, bubbleStroke: { name: "Stroke Color", type: [plotdb.Color], "default": "#c01d1d", category: "Bubble" }, bubbleStrokeWidth: { name: "Stroke Width", type: [plotdb.Number], "default": "1", category: "Bubble" }, bubblePadding: { name: "Bubble Padding", type: [plotdb.Number], "default": 5, category: "Bubble" }, barThick: { name: "Bar Thickness", type: [plotdb.Number], "default": 10, category: "Layout" }, lineThick: { name: "Line Thickness", type: [plotdb.Number], "default": 10, category: "Layout" }, legendShow: { name: "Show Legend", type: [plotdb.Boolean], "default": !0, category: "Legend" }, legendLabel: { name: "Label", type: [plotdb.String], category: "Legend" }, legendPosition: { name: "Position", type: [plotdb.Choice(["top", "left", "right", "bottom"])], "default": "right", category: "Legend" }, otherLabel: { name: "Label for 'other'", type: [plotdb.String], "default": "Other", category: "Text" }, showLabel: { name: "Show Data Label", type: [plotdb.Boolean], "default": !1, category: "Label" }, labelShadowSize: { name: "Label Shadow Size", type: [plotdb.Number], "default": 2, category: "Label" }, labelShow: { name: "Show Data Label", type: [plotdb.Boolean], "default": !1, category: "Label" }, nodeShow: { name: "Show Data Dot", type: [plotdb.Boolean], "default": !0, category: "Dot" }, nodeSize: { name: "Dot Size", type: [plotdb.Number], "default": 6, category: "Dot" }, nodeFill: { name: "Fill Color", type: [plotdb.Color], desc: "fill Dot with this color", "default": "#eee", category: "Dot" }, nodeStroke: { name: "Stroke Color", type: [plotdb.Color], desc: "draw Dot outline with this color", "default": "#919191", category: "Dot" }, nodeStrokeWidth: { name: "Stroke Width", type: [plotdb.Number], "default": "1", category: "Dot" }, labelPosition: { name: "Label Position", type: [plotdb.Choice(["in", "out"])], "default": "out", category: "Switch" }, showPercent: { name: "Percentage in Label", type: [plotdb.Boolean], desc: "Show percentage in data label", "default": !0, category: "Switch" }, Unit: { name: "Unit", type: [plotdb.String], "default": "", desc: "Unit of value", category: "Value" }, xScaleRange: { name: "Data Range in X axis", type: [plotdb.Range], desc: "Enforce chart rendering within this range, in x axis", "default": [0, 1], category: "Value" }, yScaleRange: { name: "Data Range in Y axis", type: [plotdb.Range], desc: "Enforce chart rendering within this range, in y axis", "default": [0, 1], category: "Value" }, rScaleRange: { name: "Data Range in Circle Radius", type: [plotdb.Range], desc: "Enforce chart rendering within this range, in circle radius", "default": [0, 1], category: "Value" }, threshold: { name: "Threshold", type: [plotdb.Number], desc: "data larger than this value will be treated as positive, vice versa.", "default": 0, category: "Value" }, sort: { name: "Sort data", type: [plotdb.Choice(["Ascending", "Descending", "None"])], "default": "Descending", category: "Value" }, emptyAs0: { name: "Empty as 0", type: [plotdb.Boolean], desc: "Treat undefined data as 0", "default": !0, category: "Value" }, otherLimit: { name: "Small Data Threshold", type: [plotdb.Number], desc: "Data smaller than this value will be clustered into one set of data", "default": 0, category: "Value" }, lineSmoothing: { name: "Line Smoothing", "default": "linear", type: [plotdb.Choice(["linear", "step", "step-before", "step-after", "basis", "bundle", "cardinal", "monotone"])], category: "Line" }, strokeWidth: { name: "Stroke Width", type: [plotdb.Number], desc: "Default Stroke width", "default": "2", category: "Global Settings" }, strokeDashArray: { name: "Stroke Dash Style", type: [plotdb.Number], "default": "2", desc: "SVG style dash array. '2 4' means 2px line and 4px space.", category: "Global Settings" }, zeroBaseline: { name: "Zero Baseline", desc: "y Axis starts with zero", type: [plotdb.Boolean], "default": !0, rebindOnChange: !0, category: "Y Axis" }, yAxisZeroBaseline: { name: "Zero Baseline", desc: "y Axis starts with zero", type: [plotdb.Boolean], "default": !0, rebindOnChange: !0, category: "Y Axis" } }, ["X", "Y", "Radial", "Angular"].forEach(function(e) { var t, o, a, l; return t = e.charAt(0).toLowerCase() + "Axis", o = e + " Axis", a = [plotdb.Boolean], e = [plotdb.Number], l = [plotdb.Color], plotdb.config[t + "Show"] = { name: "Show Axis", type: a, "default": !0, category: o }, plotdb.config[t + "ShowDomain"] = { name: "Show Basline", type: a, "default": !0, category: o }, plotdb.config[t + "TickSizeInner"] = { name: "Inner Tick Size", type: e, "default": 4, category: o }, plotdb.config[t + "TickSizeOuter"] = { name: "Outer Tick Size", type: e, "default": 0, category: o }, plotdb.config[t + "TickPadding"] = { name: "Tick Padding", type: e, "default": 4, category: o }, plotdb.config[t + "Stroke"] = { name: "Stroke Color", type: l, "default": "#000", category: o }, plotdb.config[t + "Label"] = { name: "Label", type: [plotdb.String], "default": "", category: o }, plotdb.config[t + "TickCount"] = { name: "Tick Count", type: e, "default": 6, category: o, desc: "Hint on number of tick. Actual number will be decided by program" }, plotdb.config[t + "LabelPosition"] = { name: "Label Position", type: [plotdb.Choice(["in", "center"])], "default": "center", category: o }, plotdb.config[t + "TickDirection"] = { name: "Tick Direction", type: [plotdb.Choice(["vertical", "horizontal"])], "default": "horizontal", category: o }, plotdb.config[t + "HandleOverlap"] = { name: "Overlap Ticks", type: [plotdb.Choice(["none", "hidden", "offset"])], "default": "hidden", category: o, desc: "How should overlapped ticks be taken care?" } });
! function() {
    var e, o, n;
    if (e = { domain: "plotdb.com", domainIO: "plotdb.io", urlschema: "https://", name: "plotdb", debug: !1, facebook: { clientID: "1546734828988373" }, google: { clientID: "1003996266757-4gv30no8ije0sd8d8qsd709dluav0676.apps.googleusercontent.com" }, mode: 1, plan: { sizeLimits: [1e6, 5e7, 1e9] } }, "undefined" != typeof module && null !== module) module.exports = e;
    else if ("undefined" != typeof angular && null !== angular) try { o = angular.module("plotDB"), o.service("plConfig", [].concat(function() { return e })) } catch (l) { n = l }
    return "undefined" != typeof window && null !== window ? window.plConfig = e : void 0
}(); // Generated by LiveScript 1.3.1
plotdb.view = {
    host: plConfig.urlschema + "" + plConfig.domainIO,
    loader: function(key, cb) {
        var req;
        req = new XMLHttpRequest();
        req.onload = function() {
            var ret, e;
            try {
                ret = JSON.parse(this.responseText);
                if (Array.isArray(ret)) {
                    return cb(ret.map(function(it) {
                        return new plotdb.view.chart(it, {});
                    }));
                } else {
                    return cb(new plotdb.view.chart(ret, {}));
                }
            } catch (e$) {
                e = e$;
                console.error("load chart " + key + " failed when parsing response: ");
                return console.error(e);
            }
        };
        if (typeof key === 'number') {
            req.open('get', this.host + "/d/chart/" + key, true);
        } else if (typeof key === 'string') {
            req.open('get', key, true);
        }
        return req.send();
    },
    chart: function(chart, arg$) {
        var ref$, theme, fields, root, data, code;
        ref$ = arg$ != null ?
            arg$ : {}, theme = ref$.theme, fields = ref$.fields, root = ref$.root, data = ref$.data;
        this._ = {
            handler: {},
            _chart: JSON.stringify(chart),
            fields: fields,
            root: root,
            inited: false
        };
        if (chart) {
            code = chart.code.content;
            if (code[0] === '{') {
                code = "(function() { return " + code + "; })();";
            } else {
                code = "(function() { " + code + "; return module.exports; })();";
            }
            this._.chart = chart = import$(eval(code), chart);
        }
        plotdb.chart.updateDimension(chart);
        plotdb.chart.updateConfig(chart, chart.config);
        plotdb.chart.updateAssets(chart, chart.assets);
        if (data) {
            this.data(data);
        }
        if (fields) {
            this.sync(fields);
        }
        if (!data && (fields == null || !fields.length)) {
            this.data(chart.sample);
        }
        if (theme != null) {
            this.theme(theme);
        }
        if (fields != null) {
            this.sync(fields);
        }
        if (root) {
            this.attach(root);
        }
        chart.saveLocal = function(chart, key) {
            return function(cb) {
                var req;
                req = new XMLHttpRequest();
                req.onload = function() {
                    if (cb) {
                        return cb();
                    }
                };
                req.open('put', plConfig.urlschema + "" + plConfig.domain + "/e/chart/" + key + "/local", true);
                req.setRequestHeader('Content-Type', "application/json;charset=UTF-8");
                return req.send(JSON.stringify(chart.local));
            };
        }(chart, chart.key);
        return this;
    }
};
import$(plotdb.view.chart.prototype, {
    update: function() {
        var this$ = this;
        return ['resize', 'bind', 'render'].map(function(it) {
            if (this$._.chart[it]) {
                return this$._.chart[it]();
            }
        });
    },
    loadlib: function(root) {
        var libs;
        return libs = this._.chart.library || [];
    },
    attach: function(root) {
        var ref$, chart, theme, resize, newClass, e;
        this._.root = root;
        ref$ = {
            chart: (ref$ = this._).chart,
            theme: ref$.theme
        }, chart = ref$.chart, theme = ref$.theme;
        root.setAttribute("class", ((root.getAttribute("class") || "").split(" ").filter(function(it) {
            return it !== 'pdb-root';
        }).concat(['pdb-root'])).join(" "));
        root.innerHTML = [chart && chart.style ? "<style type='text/css'>/* <![CDATA[ */" + chart.style.content + "/* ]]> */</style>" : void 8, theme && theme.style ? "<style type='text/css'>/* <![CDATA[ */" + theme.style.content + "/* ]]> */</style>" : void 8, "<div style='position:relative;width:100%;height:100%;'><div style='height:0;'>&nbsp;</div>", chart.doc.content, "</div>", theme && (theme.doc || (theme.doc = {})).content ? theme.doc.content : void 8].join("");
        chart.root = root.querySelector("div:first-of-type");
        resize = function() {
            var this$ = this;
            if (resize.handle) {
                clearTimeout(resize.handle);
            }
            return resize.handle = setTimeout(function() {
                resize.handle = null;
                chart.resize();
                return chart.render();
            }, 500);
        };
        window.addEventListener('resize', function() {
            return resize();
        });
        newClass = (root.getAttribute('class') || "").split(' ').filter(function(it) {
            return it !== 'loading';
        }).join(" ").trim();
        try {
            chart.init();
            if (chart.parse) {
                chart.parse();
            }
            chart.resize();
            chart.bind();
            chart.render();
        } catch (e$) {
            e = e$;
            newClass += ' error';
        }
        root.setAttribute('class', newClass);
        return this.inited = true;
    },
    config: function(config) {
        return import$(this._.chart.config, config);
    },
    init: function(root) {
        return this._.chart.init();
    },
    parse: function() {
        return this._.chart.parse();
    },
    resize: function() {
        return this._.chart.resize();
    },
    bind: function() {
        return this._.chart.bind();
    },
    render: function() {
        return this._.chart.render();
    },
    clone: function() {
        var ref$;
        return new plotdb.view.chart(JSON.parse(this._._chart), {
            theme: (ref$ = this._).theme,
            fields: ref$.fields
        });
    },
    on: function(event, cb) {
        var ref$;
        return ((ref$ = this._.handler)[event] || (ref$[event] = [])).push(cb);
    },
    theme: function(theme) {
        return this._.theme = import$(eval(theme.code.content), theme);
    },
    data: function(data) {
        if (data == null) {
            return this._.data;
        }
        this._.data = data;
        return this.sync();
    },
    sync: function(fields) {
        var hash, i$, len$, item, k, ref$, v;
        fields == null && (fields = []);
        if (this._.data) {
            return this._.chart.data = plotdb.chart.dataFromHash(this._.chart.dimension, this._.data);
        }
        hash = {};
        for (i$ = 0, len$ = fields.length; i$ < len$; ++i$) {
            item = fields[i$];
            hash[item.key] = item;
        }
        ref$ = this._.chart.dimension;
        for (k in ref$) {
            v = ref$[k];
            v.fields = (v.fields || []).map(fn$).filter(fn1$);
        }
        plotdb.chart.updateData(this._.chart);
        if (this.inited && this._.chart.parse) {
            return this._.chart.parse();
        }

        function fn$(it) {
            return hash[it.key];
        }

        function fn1$(it) {
            return it;
        }
    }
});
plotdb.load = function(key, cb) {
    return plotdb.view.loader(key, cb);
};
plotdb.render = function(config, cb) {
    return plotdb.view.render(config, cb);
};

function import$(obj, src) {
    var own = {}.hasOwnProperty;
    for (var key in src)
        if (own.call(src, key)) obj[key] = src[key];
    return obj;
}